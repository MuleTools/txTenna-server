/*!
 * lib/segments-storages/abstract-segments-storage.js
 */
'use strict'


/**
 * An abstract class defining a Segments Storage
 */
class AbstractSegmentsStorage {

  /**
   * Constructor
   * @param {object} options - Configuration options
   */
  constructor(options) {
    this.options = options
  }

  /**
   * Store a segment
   * @param {object} segment
   */
  addSegment(segment) {}

  /**
   * Remove a segement
   * @param {string} bundleId - bundle id
   * @param {integer} segmentId - segment id
   */
  deleteSegment(bundleId, segmentId) {}

  /**
   * Check if a segment is already stored
   * @param {string} bundleId - bundle id
   * @param {integer} segmentId - segment id
   * @returns {boolean} returns true if the segment is already stored, false otherwise
   */
  hasSegment(bundleId, segmentId) {}

  /**
   * Get a segment
   * @param {string} bundleId - bundle id
   * @param {integer} segmentId - segment id
   * @returns {object} returns a segment if it's stored in cachen null otherwise
   */
  getSegment(bundleId, segmentId) {}

  /**
   * Create a new bundle of segments for a transaction
   * @param {string} bundleId - bundle id
   */
  addBundle(bundleId) {}

  /**
   * Delete a bundle of segments
   * @param {string} bundleId - bundle id
   */
  deleteBundle(bundleId) {}

  /**
   * Check if a bundle is already stored
   * @param {string} bundleId - bundle id
   * @returns {boolean} returns true if the bundle is already stored, false otherwise
   */
  hasBundle(bundleId) {}

  /**
   * Get a bundle
   * @param {string} bundleId - bundle id
   * @returns {object} returns a bundle if it's stored in cachen null otherwise
   */
  getBundle(bundleId) {}

  /**
   * Check if we have received all the segments for a bundle
   * @param {string} bundleId - bundle id
   * @returns {boolean} returns true if all segment have been received, false otherwise
   */
  hasAllSegments(bundleId) {}

}

module.exports = AbstractSegmentsStorage
