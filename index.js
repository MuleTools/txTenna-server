/*!
 * index.js
 */
'use strict'

const Logger = require('./lib/logger')
// Check in command if we run in testnet mode
const network = (process.argv.indexOf('testnet') > 1) ? 'testnet' : 'bitcoin'
const keys = require('./keys')[network]
const HttpServer = require('./lib/http-server/http-server')
const GatewayRestApi = require('./gateway/gateway-rest-api')
const gateway = require('./gateway/gateway')


Logger.info('Process ID: ' + process.pid)
Logger.info(`${network} mode activated`)

// Initialize the http server
const port = keys.ports.gatewayApi
const httpsOptions = keys.https
const httpServer = new HttpServer(port, httpsOptions)

// Initialize the gateway
gateway.init(keys)

// Initialize the gateway api endpoint
const gatewayRestApi = new GatewayRestApi(httpServer)

// Start the http server
httpServer.start()
