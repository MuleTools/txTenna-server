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
   * @param {string} name - name identifying the wrapper
   */
  constructor(options, name) {
    super(options, name)
    this._rpcClient = new RpcClient(options.rpc)
  }

  /**
   * Push a transaction
   * @param {string} rawTx - transaction in hex format
   * @returns {boolean} returns true if transaction has been successfully pushed, false otherwise
   */
  async pushTx(rawTx) {
    Logger.info(`Trying to push a transaction over ${this.name}`)

    try {
      const result = await this._rpcClient.sendRawTransaction(rawTx)
      // Returned data is "<txid>"
      Logger.info(`Successfully pushed ${result} over ${this.name}`)
      return true
    } catch(err) {
      try {
        const error = JSON.parse(err.message)
        Logger.error(
          error.message,
          `A problem (error code ${error.code}) was met while trying to push a transaction over ${this.name}`
        )
      } catch(e) {
        Logger.error(
          null,
          `A problem was met while trying to push a transaction over ${this.name}`
        )
      } finally {
        return false
      }
    }
  }

}

module.exports = Wrapper
