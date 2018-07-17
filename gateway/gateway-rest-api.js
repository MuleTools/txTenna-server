/*!
 * gateway/gateway-rest-api.js
 */
'use strict'

const bodyParser = require('body-parser')
const Logger = require('../lib/logger')
const HttpServer = require('../lib/http-server/http-server')
const gateway = require('./gateway')


/**
 * Gateway API endpoints
 */
class GatewayRestApi {

  /**
   * Constructor
   * @param {pushtx.HttpServer} httpServer - HTTP server
   */
  constructor(httpServer) {
    this.httpServer = httpServer

    // Establish routes
    const jsonParser = bodyParser.json()

    // Establish routes. Proxy server strips /pushtx
    this.httpServer.app.post('/segments', jsonParser, this.postSegments.bind(this))
  }


  /**
   * Handle segments POST request
   * @param {object} req - http request object
   * @param {object} res - http response object
   */
  async postSegments(req, res) {
    // Check request arguments
    if (!req.body) {
      Logger.error(null, 'Missing body in received request')
      HttpServer.sendError(res, 'Missing body in received request')
      return
    }
      

    // Build the segment object
    const segment = {}

    // Process the bundle id
    if (req.body.i) {
      segment.i = req.body.i
    } else {
      Logger.error(null, 'Parameter i is missing')
      HttpServer.sendError(res, 'Parameter i is missing')
      return
    }

    // Process the segment index
    segment.c = (req.body.c) ? parseInt(req.body.c) : 0

    // Get attributes for segment #0
    if (segment.c == 0) {

      // Process the number of segments
      if (req.body.s) {
        segment.s = parseInt(req.body.s)
      } else {
        Logger.error(null, 'Parameter s is missing')
        HttpServer.sendError(res, 'Parameter s is missing')
        return
      }

      // Process the txid
      if (req.body.h) {
        segment.h = req.body.h
      } else {
        Logger.error(null, 'Parameter s is missing')
        HttpServer.sendError(res, 'Parameter s is missing')
        return
      }

      // Process the network (optional)
      if (req.body.n)
        segment.n = req.body.n

    }

    // Process the tx segment
    if (req.body.t) {
      segment.t = req.body.t
    } else {
      Logger.error(null, 'Parameter t is missing')
      HttpServer.sendError(res, 'Parameter t is missing')
      return
    }

    // Process the segment (store + push tx if bundle is complete)
    const success = await gateway.processSegment(segment)

    if (success)
      HttpServer.sendOk(res)
    else
      HttpServer.sendError(res, 'A problem was met while trying to process the segment')
  }

}

module.exports = GatewayRestApi
