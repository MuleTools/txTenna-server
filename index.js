/*!
 * index.js
 */
'use strict'

const Logger = require('./lib/logger')
const keys = require('./keys')
const HttpServer = require('./lib/http-server/http-server')
const GatewayRestApi = require('./gateway/gateway-rest-api')
const gateway = require('./gateway/gateway')

Logger.info('Process ID: ' + process.pid)

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
