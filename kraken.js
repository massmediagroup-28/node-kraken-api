const crypto = require('crypto')
const https = require('https')
const parse_url = require('url').parse
const querystring = require('querystring')

/**
 * KrakenClient connects to the Kraken.com API
 * @param {String} key    API Key
 * @param {String} secret API Secret
 * @param {String} [otp]  Two-factor password (optional) (also, doesn't work)
 */
function KrakenClient(key, secret, opt) {
	var self = this;

	var config = Object.assign({},
	{
		// default user-configurable options
		otp: undefined,
		timeoutMS: 5000
	},
	(opt || {}),
	{
		// values that cannot be changed by user
		url: 'https://api.kraken.com',
		version: '0',
		key: key,
		secret: secret
	})

	/**
	 * This method makes a public or private API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @return {Object}            Promise
	 */
	function api(method, params) {
		return new Promise((resolve, reject) => {
			var callback = function(error, data){
				if (error) reject(error)
				else resolve(data.result)
			}
			var methods = {
				public: ['Time', 'Assets', 'AssetPairs', 'Ticker', 'Depth', 'Trades', 'Spread', 'OHLC'],
				private: ['Balance', 'TradeBalance', 'OpenOrders', 'ClosedOrders', 'QueryOrders', 'TradesHistory', 'QueryTrades', 'OpenPositions', 'Ledgers', 'QueryLedgers', 'TradeVolume', 'AddOrder', 'CancelOrder', 'DepositMethods', 'DepositAddresses', 'DepositStatus', 'WithdrawInfo', 'Withdraw', 'WithdrawStatus', 'WithdrawCancel']
			};
			if(methods.public.indexOf(method) !== -1) {
				publicMethod(method, params, callback)
			}
			else if(methods.private.indexOf(method) !== -1) {
				privateMethod(method, params, callback)
			}
			else {
				reject(new Error(method + ' is not a valid API method.'))
			}
		})
	}

	/**
	 * This method makes a public API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object
	 */
	function publicMethod(method, params, callback) {
		params = params || {};

		var path	= '/' + config.version + '/public/' + method;
		var url		= config.url + path;

		return rawRequest(url, {}, params, callback);
	}

	/**
	 * This method makes a private API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object
	 */
	function privateMethod(method, params, callback) {
		params = params || {};

		var path	= '/' + config.version + '/private/' + method;
		var url		= config.url + path;

		if(!params.nonce) {
			params.nonce = new Date() * 1000; // spoof microsecond
		}

		if(config.otp !== undefined) {
			params.otp = config.otp;
		}

		var signature = getMessageSignature(path, params, params.nonce);

		var headers = {
			'API-Key': config.key,
			'API-Sign': signature
		};

		return rawRequest(url, headers, params, callback);
	}

	/**
	 * This method returns a signature for a request as a Base64-encoded string
	 * @param  {String}  path    The relative URL path for the request
	 * @param  {Object}  request The POST body
	 * @param  {Integer} nonce   A unique, incrementing integer
	 * @return {String}          The request signature
	 */
	function getMessageSignature(path, request, nonce) {
		var message	= querystring.stringify(request);
		var secret	= new Buffer(config.secret, 'base64');
		var hash	= new crypto.createHash('sha256');
		var hmac	= new crypto.createHmac('sha512', secret);

		var hash_digest	= hash.update(nonce + message).digest('binary');
		var hmac_digest	= hmac.update(path + hash_digest, 'binary').digest('base64');

		return hmac_digest;
	}

	/**
	 * This method sends the actual HTTP request
	 * @param  {String}   url      The URL to make the request
	 * @param  {Object}   headers  Request headers
	 * @param  {Object}   params   POST body
	 * @param  {Function} callback A callback function to call when the request is complete
	 */
	function rawRequest(url, headers, params, callback) {
		// Set custom User-Agent string
		headers['User-Agent'] = `Mozilla/4.0 (compatible; Kraken Node.js bot; ${process.platform}; Node.js/${process.version})`

		var options

		options = Object.assign({}, parse_url(url), {
			method: 'POST',
			headers: headers,
			timeout: config.timeoutMS,
			agent: false
		})

		try {
			const req = https.request(options, (res) => {
				var data = ''

				res.setEncoding('utf8')
				res.on('data', (chunk) => {
					data += chunk
				})
				res.on('end', () => {
					data = JSON.parse(data)

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
							throw new Error('Kraken API returned error: ' + krakenError)
						}
						else {
							throw new Error(JSON.stringify(data.error))
						}
					}
					else {
						return callback.call(self, null, data)
					}
				})
			})

			req.on('error', (e) => {
				throw e
			})

			req.write(querystring.stringify(params))
			req.end()
		}
		catch(error){
			return callback.call(self, error, null)
		}
	}

	self.api		= api;
	self.publicMethod	= publicMethod;
	self.privateMethod	= privateMethod;
}

module.exports = KrakenClient;
