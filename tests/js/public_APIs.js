#!/usr/bin/env node

const KrakenClient = require('../../kraken')

const kraken = new KrakenClient('my_key', 'my_secret')

// public API methods

const pair = 'GNOETH'
var methods, i

const call_API = function(method, params){
  kraken.api(method, params, function(error, data) {
    if(error) {
      console.log("\n\n", `[Error] API method "${method}" produced the following error message:`, "\n", error.message)
    }
    else {
      console.log("\n\n", `[Success] API method "${method}" returned the following response:`, "\n", JSON.stringify(data.result))
    }
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
