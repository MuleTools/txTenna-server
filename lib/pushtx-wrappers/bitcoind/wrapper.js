/*!
 * lib/spushtx-wrappers/bitcoind/wrapper.js
 */
'use strict'

const RpcClient = require('./rpc-client')
const Logger = require('../../logger')
const AbstractPushTxWrapper = require('../abstract-pushtx-wrapper')


/**
 * Bitcoind PushTx service
 */
class Wrapper extends AbstractPushTxWrapper {

  /**
   * Constructor
   * @param {object} options - Configuration options
   */
  constructor(options) {
    super(options)
    this._rpcClient = new RpcClient(options.rpc)
  }

  /**
   * Push a transaction
   * @param {string} rawTx - transaction in hex format
   * @returns {boolean} returns true if transaction has been successfully pushed, false otherwise
   */
  async pushTx(rawTx) {
    Logger.info(`Trying to push transaction over bitcoind ${this.options.rpc.host}`)
    try {
      const result = await this._rpcClient.sendRawTransaction(rawTx)
      // Returned data is "<txid>"
      Logger.info(`Successfully pushed ${result}`)
      return true
    } catch(err) {
      try {
        const error = JSON.parse(err.message)
        Logger.error(error.message, `A problem (error code ${error.code}) was met while trying to push a transaction`)
      } catch(e) {
        Logger.error(null, `A problem was met while trying to push a transaction`)
      } finally {
        return false
      }
    }
  }

}

module.exports = Wrapper
