/*!
 * gatweway/gateway.js
 */
'use strict'

const bitcoin = require('bitcoinjs-lib')
const Logger = require('../lib/logger')
const Z85 = require('../lib/z85')


/**
 * A singleton implementing a TxTenna gateway
 */
class Gateway {

  /**
   * Constructor
   */
  constructor() {
    this.storage = null
    this.pushTxServices = []
  }

  /**
   * Initialize the gateway
   * @param {object} config - configuration options
   * @returns {boolean} returns true if the gateway has been successfully initialized
   * otherwise returns false
   */
  init(config) {
    // Initialize the storage
    const configStorage = config.storage

    try {
      const Storage = require(`../lib/segments-storages/${configStorage.type}/storage`)
      this.storage = new Storage(configStorage.options)
      Logger.info(`Initialized storage ${configStorage.type}`)
    } catch(e) {
      Logger.error(e, 'A problem was met while trying to initialize the storage')
      return false
    }
    
    // Initialize the wrappers for the pushtx services
    const configWrappers = config.pushtxWrappers

    for (let confWrapper of configWrappers) {
      try {
        const Wrapper = require(`../lib/pushtx-wrappers/${confWrapper.type}/wrapper`)
        const wrapper = new Wrapper(confWrapper.options)
        this.pushTxServices.push(wrapper)
        Logger.info(`Initialized pushtx wrapper ${confWrapper.type}`)
      } catch(e) {
        Logger.error(e, `A problem was met while trying to initialize the pushtx wrapper ${confWrapper.type}`)
        return false
      }
    }

    if (this.pushTxServices.length == 0)
      return false

    return true
  }

  /**
   * Process a segment
   * @param {object} segment - segment
   * @returns {boolean} returns true if segment has been successfully processed (pushtx included), false otherwise
   */
  async processSegment(segment) {
    // Checks structure of segment
    if (!segment.i) return false
    if (!segment.t) return false
    
    const bundleId = segment.i
    const segmentIdx = segment.c ? segment.c : 0

    if (segmentIdx == 0) {
      if (!segment.s) return false
      if (!segment.h) return false
    }

    // Check if tranaction has already been processed
    if (this.storage.hasProcessedTx(bundleId)) {
      Logger.info(`Bundle ${bundleId} already processed. Skipped processing of segment ${bundleId}-${segmentIdx}`)
      return true
    }
      

    // Store the segment
    this.storage.addSegment(segment)

    Logger.info(`Stored segment ${bundleId}-${segmentIdx}`)

    // Check if all segments have been received for the transaction
    if (this.storage.hasAllSegments(bundleId)) {
      Logger.info(`Trying to push bundle ${bundleId}`)

      // Get the bundle from storage
      const bundle = this.storage.getBundle(bundleId)

      if (!bundle) {
        Logger.error(
          null,
          `Failed to push a transaction. Unable to find the bundle ${bundleId} in storage`
        )
      }

      // Build the raw tx from its segments
      const rawTx = this.buildTx(bundle)
      if (!rawTx) return false

      // Push the transaction
      const resultPush = await this.pushTx(rawTx)

      if (resultPush)
        Logger.info(`Successfully pushed tx ${bundle.h} (${bundleId})`)

      // Marks the transaction as processed
      this.storage.addProcessedTx(bundleId, bundle.h)

      return resultPush
    }

    return true
  }


  /**
   * Push a transaction over a service
   * @param {string} rawTx - transaction in hex format
   * @returns {boolean} returns true if transaction has been successfully pushed, false otherwise
   */
  async pushTx(rawTx) {
    const nbServices = this.pushTxServices.length

    // No service available
    if (nbServices == 0) {
      Logger.error('Failed to push a transaction. No pushtx service available')
      return false
    }      

    // A single service is available
    if (nbServices == 1)
      return await this.pushTxServices[0].pushTx(rawTx)

    // Multiple services are available
    // Select a random service and try to push the transaction
    let success = false
    let nbAttempts = 0

    while (!success && nbAttempts < 3) {
      const idx = Math.floor(Math.random() * nbServices)
      const success = await this.pushTxServices[idx].pushTx(rawTx)
      nbAttempts++
    }

    if (!success)
      Logger.info('Failed to push a transaction after 3 random attempts')

    return success
  }

  /**
   * Build a raw tx from a bundle of segments
   * @param {object[]} bundle - bundle of segments
   * @returns {string} returns the raw transaction in hex format or null if a problem was met
   */
  buildTx(bundle) {
    if (!bundle) return null

    const expectedNbSegments = bundle.s
    const nbSegments = Object.keys(bundle.segments).length

    if (nbSegments != expectedNbSegments) return null

    let expectedTxid = ''
    if (Z85.isZ85(bundle.h))
      expectedTxid = Z85.decode(bundle.h).toString('hex')
    else
      expectedTxid = bundle.h
    
    let serTx = ''
    for (let i = 0; i < nbSegments; i++) {
      const segment = bundle.segments[i.toString()]
      serTx += segment.t
    }

    if (Z85.isZ85(serTx))
      serTx = Z85.decode(serTx).toString('hex')

    const buffRawTx = Buffer.from(serTx, 'hex')

    const tx = bitcoin.Transaction.fromBuffer(buffRawTx)
    const txid = tx.getId()

    if (txid != expectedTxid) return null

    return buffRawTx.toString('hex')
  }

}

module.exports = new Gateway()