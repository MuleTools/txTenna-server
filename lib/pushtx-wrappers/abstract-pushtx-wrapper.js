/*!
 * lib/spushtx-wrappers/abstract-pushtx-wrapper.js
 */
'use strict'


/**
 * An abstract class defining a wrapper for a PushTx service
 */
class AbstractPushTxWrapper {

  /**
   * Constructor
   * @param {object} options - configuration options
   * @param {string} name - name identifying the wrapper
   */
  constructor(options, name) {
    this.options = options
    this.name = name
  }

  /**
   * Push a transaction
   * @param {string} rawtx - transaction in hex format
   * @returns {boolean} returns true if transaction has been successfully pushed, false otherwise
   */
  async pushTx(rawtx) {}

}

module.exports = AbstractPushTxWrapper
