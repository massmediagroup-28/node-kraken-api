#!/usr/bin/env node

const KrakenClient = require('../../kraken')

const kraken = new KrakenClient('my_key', 'my_secret', {timeout: 10000})

// public API methods

const pair = 'GNOETH'
var methods, i

const call_API = function(method, params){
  kraken.api(method, params)
  .then((result) => {
    console.log("\n\n", `[Success] API method "${method}" returned the following response:`, "\n", JSON.stringify(result))
  })
  .catch((error) => {
    console.log("\n\n", `[Error] API method "${method}" produced the following error message:`, "\n", error.message)
    if (error.code === 'JSON-PARSE') console.log('Server response:', "\n", error.api_response)
    if (error.code === 'ECONNRESET') console.log('Server timeout')
  })
}

methods = ['Time', 'Assets', 'AssetPairs']
for (i=0; i<methods.length; i++){
  call_API(methods[i])
}

methods = ['Ticker', 'OHLC', 'Depth', 'Trades', 'Spread']
for (i=0; i<methods.length; i++){
  call_API(methods[i], {pair})
}
