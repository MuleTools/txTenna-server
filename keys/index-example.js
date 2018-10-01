/**
 * keys/index-example.js
 * Desired structure of /keys/index.js, which is ignored in the repository.
 */
module.exports = {
  /*
   * TCP Ports
   */
  ports: {
    // Port used by the Gateway REST API
    gatewayApi: 8091
  },
  /*
   * HTTPS
   * Activate only if node js is used as frontend web server
   * (no nginx proxy server)
   */
  https: {
    // Activate https
    active: false,
    // Filepath of server private key 
    // (shoud be stored in keys/sslcert)
    keypath: '',
    // Passphrase of the private key
    passphrase: '',
    // Filepath of server certificate
    // (shoud be stored in keys/sslcert)
    certpath: '',
    // Filepath of CA certificate
    // (shoud be stored in keys/sslcert)
    capath: ''
  },
  /*
   * Component used for temporary storage of segments
   * Multiple options should be available in the future
   * Currently available: 
   *   Memory Cache Storage
   *   An in-memory cache with a fixed-size
   *   Segments which haven't been accessed for a while are removed first
   *   Parameters:
   *   {
   *     type: "memory-cache",
   *     // Configuration of the storage
   *     options: {
   *       // Max number of transactions stored in cache
   *       cacheSize: 50000,
   *       // Maximum age for entries in the cache (in ms)
   *       ttl: 3600000
   *     }
   *   }
   */
  storage: {
    type: "memory-cache",
    options: {
      cacheSize: 10000,
      ttl: 3600000
    }
  },
  /*
   * List of wrappers around misc pushtx services
   * The gateway randomly selects one of these wrappers
   * when it needs to push a transaction on the bitcoin network
   * Note: several wrappers of the same type can be added to the list
   *
   * Currently available: 
   *   BITCOIN FULL NODE (BITCOIND)
   *   A wrapper pushing the transaction thanks to the RPC API of a bitcoind instance
   *   Parameters:
   *   {
   *     type: "bitcoind",
   *     // Network supported by the wrapper
   *     //   Bitcoin mainnet = 'm'
   *     //   Bitcoin testnet = 't'
   *     network: '',
   *     // Name identifying the wrapper
   *     name:'my bitcoind mainnet',
   *     // Configuration of the wrapper
   *     options: {
   *       // RPC API configuration
   *       rpc: {
   *         // Login for the RPC API
   *         user: '',
   *         // Password for the RPC API
   *         pass: '',
   *         // IP address of the bitcoin node
   *         host: '',
   *         // TCP port of the RPC API
   *         port: 8332
   *       }
   *     }
   *   }
   *
   *   SAMOURAI BACKEND
   *   A wrapper pushing the transaction thanks to the pushtx endpoint of a Samourai backend server
   *   Parameters:
   *   {
   *     type: "samourai-backend",
   *     // Network supported by the wrapper
   *     //   Bitcoin mainnet = 'm'
   *     //   Bitcoin testnet = 't'
   *     network: '',
   *     // Name identifying the wrapper
   *     name:'samourai backend mainnet',
   *     // Configuration of the wrapper
   *     options: {
   *       // URL of the pushtx endpoint
   *       url: "https://api.samouraiwallet.com/v2/pushtx",
   *       // API key requested by the backend
   *       // or null if the backend doesn't require authentication
   *       apiKey: null
   *     }
   *   }
   */
  pushtxWrappers: []
}
