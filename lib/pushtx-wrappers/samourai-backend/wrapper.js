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
   * @param {string} name - name identifying the wrapper
   */
  constructor(options, name) {
    super(options, name)

    this._jwtAccessToken = null
    this._jwtRefreshToken = null
    this.refreshTimeout = null

    // Authentication to backend
    if (this.options.apiKey != null) {
      this.getAuthTokens()
    }
  }

  /**
   * Push a transaction
   * @param {string} rawtx - transaction in hex format
   * @returns {boolean} returns true if transaction has been successfully pushed, false otherwise
   */
  async pushTx(rawtx) {
    Logger.info(`Trying to push transaction over ${this.name}`)

    try {
      const params = {
        url: `${this.options.url}/pushtx/`,
        method: 'POST',
        form: {
          tx: `${rawtx}`
        },
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      }

      // Add access token to params
      if (this._jwtAccessToken != null) {
        params['form']['at'] = this._jwtAccessToken
      }

      const res = await rp(params)
      const result = JSON.parse(res)

      if (result.status == 'ok') {
        // Returned data is "<txid>"
        Logger.info(`Successfully pushed ${result.data} over ${this.name}`)
        return true
      } else {
        Logger.error(null, `A problem was met while trying to push a transaction over ${this.name}`)
        Logger.error(null, `${result.error.message} (error code: ${result.error.code})`)
        return false
      }

    } catch(err) {
      try {
        Logger.error(err)
        const error = JSON.parse(err.error)
        Logger.error(
          error.error.message,
          `A problem (error code ${error.error.code}) was met while trying to push a transaction over ${this.name}`
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

  /**
   * Authentication to the backend thanks to an API key
   * @returns {boolean} returns true if authentication was successful, false otherwise
   */
  async getAuthTokens() {
    Logger.info(`Trying to authenticate to the backend`)

    try {
      this.clearRefreshTimeout()

      const params = {
        url: `${this.options.url}/auth/login?apikey=${this.options.apiKey}`,
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      }
      const res = await rp(params)
      const result = JSON.parse(res)

      this._jwtAccessToken = result['authorizations']['access_token']
      this._jwtRefreshToken = result['authorizations']['refresh_token']

      // Schedule next refresh of the access token
      await this.scheduleNextRefresh()

      Logger.info(`Successfully authenticated to the backend`)
      return true

    } catch(err) {
      try {
        const error = JSON.parse(err.error)
        Logger.error(
          error.error.message,
          `A problem (error code ${error.error.code}) was met while trying to authenticate to the backend`
        )
      } catch(e) {
        Logger.error(
          null,
          `A problem was met while trying to authenticate to the backend`
        )
      } finally {
        return false
      }
    }
  }

  /**
   * Refresh the JWT access token
   * @returns {boolean} returns true if refresh was successful, false otherwise
   */
  async refreshAuthToken() {
    Logger.info(`Trying to refresh the access token`)

    try {
      if (this._jwtRefreshToken == null)
        return this.getAuthTokens()

      const params = {
        url: `${this.options.url}/auth/refresh?rt=${this._jwtRefreshToken}`,
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      }
      const res = await rp(params)
      const result = JSON.parse(res)

      this._jwtAccessToken = result['authorizations']['access_token']

      // Schedule next refresh of the access token
      this.clearRefreshTimeout()
      await this.scheduleNextRefresh()

      Logger.info(`Successfully refreshed the access token`)
      return true

    } catch(err) {
      Logger.error(
        null,
        `A problem was met while trying to refresh the access token`
      )
      // Try a new authentication
      return this.getAuthTokens()
    }
  }

  /**
   * Clear refreshTimeout
   */
  clearRefreshTimeout() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
      this.refreshTimeout = null
    }
  }

  /**
   * Schedule next refresh of the access token
   */
  async scheduleNextRefresh() {
    this.refreshTimeout = setTimeout(async function() {
      await this.refreshAuthToken()
    }.bind(this), 600000)
  }

}

module.exports = Wrapper
