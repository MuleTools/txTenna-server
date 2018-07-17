/*!
 * lib/segments-storages/memory-cache/storage.js
 */
'use strict'

const LRU = require('lru-cache')
const AbstractSegmentsStorage = require('../abstract-segments-storage')


/**
 * An abstract class defining a Segments Storage
 */
class Storage extends AbstractSegmentsStorage {

  /**
   * Constructor
   * @param {object} options - Configuration options
   */
  constructor(options) {
    super(options)
    this._initCaches(options)
  }

  /**
   * Initialize memory caches
   * @param {object} options - Configuration options
   */
  _initCaches(options) {
    // Cache storing the segments
    this._cacheTxs = LRU({
      // Maximum number of txids to store in cache
      max: options.cacheSize,
      // Function used to compute length of item
      length: (n, key) => 1,
      // Maximum age for items in the cache. Items do not expire
      maxAge: options.ttl
    })

    // Cache storing the pushed ttansactions
    this._cachePushedTxs = LRU({
      // Maximum number of txids to store in cache
      max: options.cacheSize,
      // Function used to compute length of item
      length: (n, key) => 1,
      // Maximum age for items in the cache. Items do not expire
      maxAge: options.ttl
    })
  }
  

  /**
   * Store a segment
   * @param {object} segment
   */
  addSegment(segment) {
    const bundleId = segment.i
    const segmentId = segment.c

    // If bundle doesn't exit, create an empty one
    if (!this.hasBundle(bundleId))
      this.addBundle(bundleId)

    if (!this.hasSegment(bundleId, segmentId)) {
      // Get the bundle
      const bundle = this.getBundle(bundleId)

      // Add the segment to the bundle
      const newSegment = {
        t: segment.t
      }

      bundle.segments[segmentId.toString()] = newSegment

      // Process case of segment 0
      if (!('c' in segment) || (segment.c == 0)) {
        // Expected #segments
        bundle.s = segment.s
        // Expected hash of the transaction
        bundle.h = segment.h
        // Network to use
        if ('n' in segment)
          bundle.n = segment.n
      }

      // Store the updated bundle
      this._cacheTxs.set(bundleId, bundle)
    }
  }

  /**
   * Remove a segement
   * @param {string} bundleId - bundle id
   * @param {integer} segmentId - segment id
   */
  deleteSegment(bundleId, segmentId) {
    if (this.hasSegment(bundleId, segmentId)) {
      const bundle = this.getBundle(bundleId)
      delete bundle.segments[segmentId.toString()]
      this._cacheTxs.set(bundleId, bundle)
    }
  }

  /**
   * Check if a segment is already stored
   * @param {string} bundleId - bundle id
   * @param {integer} segmentId - segment id
   * @returns {boolean} returns true if the segment is already stored, false otherwise
   */
  hasSegment(bundleId, segmentId) {
    const bundle = this.getBundle(bundleId)

    if (bundle && (segmentId.toString() in bundle.segments))
      return true

    return false
  }

  /**
   * Get a segment
   * @param {string} bundleId - bundle id
   * @param {integer} segmentId - segment id
   * @returns {object} returns a segment if it's stored in cachen null otherwise
   */
  getSegment(bundleId, segmentId) {
    if (this.hasSegment(bundleId, segmentId)) {
      const bundle = this.getBundle(bundleId)
      const segment = bundle.segments[segmentId.toString()]
      return (typeof segment == 'undefined') ? null : segment
    }
    return null
  }

  /**
   * Create a new bundle of segments for a transaction
   * @param {string} id - bundle id
   */
  addBundle(bundleId) {
    if (this.hasBundle(bundleId))
      return

    const bundle = {
      // Expected #segments
      s: 0,
      // Expected hash of the transaction
      h: '',
      // Network to use (optional - t for tesnet3, null otherwise)
      n: null,
      // Mapping of segments (segmentId => segment)
      segments: {}
    }

    this._cacheTxs.set(bundleId, bundle)
  }

  /**
   * Delete a bundle of segments
   * @param {string} bundleId - bundle id
   */
  deleteBundle(bundleId) {
    if (this.hasBundle(bundleId))
      this._cacheTxs.del(bundleId)
  }

  /**
   * Check if a bundle is already stored
   * @param {string} bundleId - bundle id
   * @returns {boolean} returns true if the bundle is already stored, false otherwise
   */
  hasBundle(bundleId) {
    return this._cacheTxs.has(bundleId)
  }

  /**
   * Get a bundle
   * @param {string} bundleId - bundle id
   * @returns {object} returns a bundle if it's stored in cachen null otherwise
   */
  getBundle(bundleId) {
    if (this.hasBundle(bundleId)) {
       return this._cacheTxs.get(bundleId)
    }
    return null
  }

  /**
   * Check if we have received all the segments for a bundle
   * @param {string} bundleId - bundle id
   * @returns {boolean} returns true if all segment have been received, false otherwise
   */
  hasAllSegments(bundleId) {
    const bundle = this.getBundle(bundleId)

    if (bundle == null)
      return false

    const expectedNbSegments = bundle.s
    // Check case of segment #0 not received
    if (expectedNbSegments == 0) return false

    const nbSegments = Object.keys(bundle.segments).length

    return (nbSegments == expectedNbSegments)
  }

  /**
   * Store a processed transaction
   * @param {string} bundleId
   * @param {string} txid
   */
  addProcessedTx(bundleId, txid) {
    if (this.hasProcessedTx(bundleId)) return
    this._cachePushedTxs.set(bundleId, txid)
  }

  /**
   * Check if a transaction has already been processed
   * @param {string} bundleId - bundle id
   * @returns {boolean} returns true if the transaction has already been processed, false otherwise
   */
  hasProcessedTx(bundleId) {
    return this._cachePushedTxs.has(bundleId)
  }

}

module.exports = Storage
