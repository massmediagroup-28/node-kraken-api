const crypto = require('crypto')
const https = require('https')
const parse_url = require('url').parse
const querystring = require('querystring')

const kraken_api_methods = {
  public: ['Time', 'Assets', 'AssetPairs', 'Ticker', 'Depth', 'Trades', 'Spread', 'OHLC'],
  private: ['Balance', 'TradeBalance', 'OpenOrders', 'ClosedOrders', 'QueryOrders', 'TradesHistory', 'QueryTrades', 'OpenPositions', 'Ledgers', 'QueryLedgers', 'TradeVolume', 'AddOrder', 'CancelOrder', 'DepositMethods', 'DepositAddresses', 'DepositStatus', 'WithdrawInfo', 'Withdraw', 'WithdrawStatus', 'WithdrawCancel']
}

/**
 * KrakenClient connects to the Kraken.com API
 * @param {String} key    API Key
 * @param {String} secret API Secret
 * @param {Object} [opt]  user-configurable options: {otp, agent, timeout}
 */
function KrakenClient(key, secret, opt) {
  var self = this;

  var config = Object.assign({},
  {
    // default user-configurable options
    otp: undefined,  // Two-factor password
    agent: false,
    timeout: 5000
  },
  (opt || {}),
  {
    // values that cannot be changed by user
    url: 'https://api.kraken.com',
    version: '0',
    key: key,
    secret: secret
  })

  var unique_nonce, getMessageSignature, privateMethod, publicMethod, rawRequest, api

  unique_nonce = new (function() {
    this.generate = function() {
      var now = Date.now()
      this.counter = (now === this.last? this.counter + 1 : 0)
      this.last = now

      // add padding to nonce
      var padding =
        this.counter < 10   ? '000' :
        this.counter < 100  ?  '00' :
        this.counter < 1000 ?   '0' : ''

      return (now + padding + this.counter)
    };
  })()

  /**
   * This method returns a signature for a request as a Base64-encoded string
   * @param  {String}  path    The relative URL path for the request
   * @param  {Object}  request The POST body
   * @param  {Integer} nonce   A unique, incrementing integer
   * @return {String}          The request signature
   */
  getMessageSignature = function(path, request, nonce) {
    var message  = querystring.stringify(request);
    var secret  = new Buffer(config.secret, 'base64');
    var hash  = new crypto.createHash('sha256');
    var hmac  = new crypto.createHmac('sha512', secret);

    var hash_digest  = hash.update(nonce + message).digest('binary');
    var hmac_digest  = hmac.update(path + hash_digest, 'binary').digest('base64');

    return hmac_digest;
  }

  /**
   * This method makes a private API request.
   * @param  {String}   method   The API method (public or private)
   * @param  {Object}   params   Arguments to pass to the api call
   * @param  {Function} callback A callback function to be executed when the request is complete
   * @return {Object}            The request object
   */
  privateMethod = function(method, params, callback) {
    params = params || {};

    params.nonce = unique_nonce.generate()

    if(config.otp !== undefined) {
      params.otp = config.otp;
    }

    var path      = '/' + config.version + '/private/' + method;
    var url       = config.url + path;
    var signature = getMessageSignature(path, params, params.nonce);

    var headers = {
      'API-Key': config.key,
      'API-Sign': signature
    };

    return rawRequest(url, headers, params, callback);
  }

  /**
   * This method makes a public API request.
   * @param  {String}   method   The API method (public or private)
   * @param  {Object}   params   Arguments to pass to the api call
   * @param  {Function} callback A callback function to be executed when the request is complete
   * @return {Object}            The request object
   */
  publicMethod = function(method, params, callback) {
    params = params || {};

    var path  = '/' + config.version + '/public/' + method;
    var url    = config.url + path;

    return rawRequest(url, {}, params, callback);
  }

  /**
   * This method sends the actual HTTP request
   * @param  {String}   url      The URL to make the request
   * @param  {Object}   headers  Request headers
   * @param  {Object}   params   POST body
   * @param  {Function} callback A callback function to call when the request is complete
   */
  rawRequest = function(url, headers, params, callback) {
    var POST_data, options

    POST_data = querystring.stringify(params)

    // Set custom User-Agent string
    headers['User-Agent'] = `Mozilla/4.0 (compatible; Kraken Node.js bot; ${process.platform}; Node.js/${process.version})`

    // set Content-Length
    headers['Content-Length'] = Buffer.byteLength(POST_data, 'utf8')

    options = Object.assign({}, parse_url(url), {
      method: 'POST',
      headers: headers,
      timeout: config.timeout,
      agent: config.agent
    })

    try {
      const req = https.request(options, (res) => {
        var data = ''

        res.setEncoding('utf8')
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          var error

          try {
            data = JSON.parse(data)
          }
          catch(error) {
            error.code = 'JSON-PARSE'
            error.api_response = data
            return callback.call(self, error, null)
          }

          var krakenError
          if (data && data.error && data.error.length){
            krakenError = null
            data.error.forEach(function(element) {
              if (element.charAt(0) === "E") {
                krakenError = element.substr(1)
                return false
              }
            })
            if (krakenError) {
              error = new Error('Kraken API returned error: ' + krakenError)
              return callback.call(self, error, null)
            }
            else {
              error = new Error(JSON.stringify(data.error))
              return callback.call(self, error, null)
            }
          }
          else {
            return callback.call(self, null, data)
          }
        })
      })

      req.on('error', (error) => {
        return callback.call(self, error, null)
      })

      req.write(POST_data)
      req.end()
    }
    catch(error){
      return callback.call(self, error, null)
    }
  }

  /**
   * This method makes a public or private API request.
   * @param  {String}   method   The API method (public or private)
   * @param  {Object}   params   Arguments to pass to the api call
   * @return {Object}            Promise
   */
  api = function(method, params) {
    return new Promise((resolve, reject) => {
      var callback = function(error, data){
        if (error) reject(error)
        else resolve(data.result)
      }
      if(kraken_api_methods.public.indexOf(method) !== -1) {
        publicMethod(method, params, callback)
      }
      else if(kraken_api_methods.private.indexOf(method) !== -1) {
        privateMethod(method, params, callback)
      }
      else {
        reject(new Error(method + ' is not a valid API method.'))
      }
    })
  }

  self.api = api
}

module.exports = KrakenClient
