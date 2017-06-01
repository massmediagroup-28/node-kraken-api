### [Node.js Kraken API](https://github.com/warren-bank/node-kraken-api)

Node.js Client Library for the Kraken (kraken.com) API

This is an asynchronous Promise-based Node.js client for the kraken.com API.

#### Installation:

```bash
npm install --save @warren-bank/node-kraken-api
```

#### Usage:

* class constructor:
  * input: `api_key` (required), `api_secret` (required), `config` (optional: `{otp, agent, timeout}`)
* `api()` method:
  * input: `method` (required), `params` (varies by method)<br>
    where: `method` is one of the following values (as specified in the [official API docs](https://www.kraken.com/help/api) ):
    * public:
      * 'Time', `{}`
      * 'Assets', `{info, aclass, asset}`
      * 'AssetPairs', `{info, pair}`
      * 'Ticker', `{pair}`
      * 'OHLC', `{pair, interval, since}`
      * 'Depth', `{pair, count}`
      * 'Trades', `{pair, since}`
      * 'Spread', `{pair, since}`
    * private:
      * 'Balance', `{}`
      * 'TradeBalance', `{aclass, asset}`
      * 'OpenOrders', `{trades, userref}`
      * 'ClosedOrders', `{trades, userref, start, end, ofs, closetime}`
      * 'QueryOrders', `{trades, userref, txid}`
      * 'TradesHistory', `{type, trades, start, end, ofs}`
      * 'QueryTrades', `{txid, trades}`
      * 'OpenPositions', `{txid, docalcs}`
      * 'Ledgers', `{aclass, asset, type, start, end, ofs}`
      * 'QueryLedgers', `{id}`
      * 'TradeVolume', `{pair, "fee-info"}`
      * 'AddOrder', `{pair, type, ordertype, price, price2, volume, leverage, oflags, starttm, expiretm, userref, validate, close: {ordertype, price, price2}}`
      * 'CancelOrder', `{txid}`
      * 'DepositMethods, `{aclass, asset}`'
      * 'DepositAddresses', `{aclass, asset, method, new}`
      * 'DepositStatus', `{aclass, asset, method}`
      * 'WithdrawInfo', `{aclass, asset, key, amount}`
      * 'Withdraw', `{aclass, asset, key, amount}`
      * 'WithdrawStatus', `{aclass, asset, method}`
      * 'WithdrawCancel', `{aclass, asset, refid}`
  * output: Promise

#### Example:

```javascript
const KrakenClient = require('@warren-bank/node-kraken-api')
const kraken = new KrakenClient('api_key', 'api_secret', {timeout: 10000})

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
* license: [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt)
