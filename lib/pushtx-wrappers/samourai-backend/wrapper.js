/*!
 * lib/spushtx-wrappers/samourai-backend/wrapper.js
 */
'use strict'

const rp = require('request-promise-native')
const Logger = require('../../logger')
const AbstractPushTxWrapper = require('../abstract-pushtx-wrapper')


/**
 * Wrapper for a Samourai backend pushTx endpoint
 */
class Wrapper extends AbstractPushTxWrapper {

  /**
   * Constructor
   * @param {object} options - Configuration options
   */
  constructor(options) {
    super(options)
  }

  /**
   * Push a transaction
   * @param {string} rawtx - transaction in hex format
   * @returns {boolean} returns true if transaction has been successfully pushed, false otherwise
   */
  async pushTx(rawtx) {
    Logger.info(`Trying to push transaction over Samourai backend ${this.options.url}`)
    try {
      const params = {
        url: `${this.options.url}`,
        method: 'POST',
        form: {
          tx: `${rawtx}`
        },
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      }
      const res = await rp(params)
      const result = JSON.parse(res)
      if (result.status == 'ok') {
        // Returned data is "<txid>"
        Logger.info(`Successfully pushed ${result.data}`)
        return true
      } else {
        Logger.error(`A problem was met while trying to push a transaction`)
        return false
      }
    } catch(err) {
      try {
        const error = JSON.parse(err.error)
        Logger.error(error.error.message, `A problem (error code ${error.error.code}) was met while trying to push a transaction`)
      } catch(e) {
        Logger.error(null, `A problem was met while trying to push a transaction`)
      } finally {
        return false
      }
    }
  }

}

module.exports = Wrapper
