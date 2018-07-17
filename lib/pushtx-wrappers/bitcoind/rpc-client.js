/*!
 * lib/pushtx-wrappers/bitcoind/rpc-client.js
 */
'use strict'

const rpc = require('bitcoind-rpc-client')


/**
 * Wrapper for bitcoind rpc client
 */
class RpcClient {

  /**
   * Constructor
   * @param {object} options - configuration optopns
   */
  constructor(options) {
    // Initiliaze the rpc client
    this.client = new rpc({
      host: options.host,
      port: options.port
    })

    this.client.set('user', options.user)
    this.client.set('pass', options.pass)

    // Initialize a proxy postprocessing api calls
    return new Proxy(this, {
      get: function(target, name, receiver) {
        const origMethod = target.client[name];
        return function(...args) {
          return Promise.resolve().then(() => {
            return origMethod.apply(target.client, args)
          }).then(result => {
            if (result.result) {
              return Promise.resolve(result.result)
            } else if (result.error) {
              try {
                delete result.result
              } catch(e) {}
              return Promise.reject(result)
            } else {
              return Promise.reject(result)
            }
          })
        }
      }
    })
  }

}

module.exports = RpcClient
