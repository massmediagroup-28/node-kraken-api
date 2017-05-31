### [Node.js Kraken API](https://github.com/warren-bank/node-kraken-api)

Node.js Client Library for the Kraken (kraken.com) API

This is an asynchronous Promise-based Node.js client for the kraken.com API.

#### Installation:

```bash
npm install --save @warren-bank/node-kraken-api
```

#### Usage:

* class constructor:
  * input: `api_key` (required), `api_secret` (required), `config` (optional: `{otp, timeoutMS}`)
* `api()` method:
  * input: `method` (required), `params` (varies by method)<br>
    where: `method` is one of the following values (as specified in the [official API docs](https://www.kraken.com/help/api) ):
    * public:
      * 'Time'
      * 'Assets'
      * 'AssetPairs'
      * 'Ticker'
      * 'Depth'
      * 'Trades'
      * 'Spread'
      * 'OHLC'
    * private:
      * 'Balance'
      * 'TradeBalance'
      * 'OpenOrders'
      * 'ClosedOrders'
      * 'QueryOrders'
      * 'TradesHistory'
      * 'QueryTrades'
      * 'OpenPositions'
      * 'Ledgers'
      * 'QueryLedgers'
      * 'TradeVolume'
      * 'AddOrder'
      * 'CancelOrder'
      * 'DepositMethods'
      * 'DepositAddresses'
      * 'DepositStatus'
      * 'WithdrawInfo'
      * 'Withdraw'
      * 'WithdrawStatus'
      * 'WithdrawCancel'
  * output: Promise

#### Example:

```javascript
const KrakenClient = require('@warren-bank/node-kraken-api')
const kraken = new KrakenClient('api_key', 'api_secret', {timeoutMS: 10000})

// Public API method: Get Ticker Info
kraken.api('Ticker', {"pair": 'GNOETH'})
.then((result) => {
  console.log('Ticker (GNOETH):', result)
})
.catch((error) => {
  console.log('Error:', error.message)
})

// Private API method: Display user's balance
kraken.api('Balance')
.then((result) => {
  console.log('Balance:', result)
})
.catch((error) => {
  console.log('Error:', error.message)
})
```

#### Credits:

* [Robert Myers](https://github.com/nothingisdead) wrote the original callback-based client library for Node.js: [npm-kraken-api](https://github.com/nothingisdead/npm-kraken-api)

* His work used the [PHP](https://github.com/payward/kraken-api-client) and [Python](https://github.com/veox/python3-krakenex) client libraries for references

#### Legal:

* copyright:
  * [Robert Myers](https://github.com/nothingisdead)
  * [Warren Bank](https://github.com/warren-bank)
* license: [GPLv2](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt)
