/*!
 * lib/http-server/http-server.js
 */
'use strict'

const fs = require('fs')
const https = require('https')
const express = require('express')
const helmet = require('helmet')
const Logger = require('../logger')


/**
 * HTTP server
 */
class HttpServer {

  /**
   * Constructor
   * @param {int} port - port used by the http server
   * @param {object} httpsOptions - https options
   */
  constructor(port, httpsOptions) {
    // Initialize server port
    this.port = port

    // Store https options
    this.httpsOptions = httpsOptions

    // Listening server instance
    this.server = null

    // Initialize the express app
    this.app = express()
    this.app.set('trust proxy', 'loopback')

    // Middlewares for json responses and requests logging
    this.app.use('/static', express.static('../static'));
    this.app.use(HttpServer.setJSONResponse)
    this.app.use(HttpServer.requestLogger)
    this.app.use(HttpServer.setCrossOrigin)
    this.app.use(helmet(HttpServer.HELMET_POLICY))
  }


  /**
   * Start the http server
   * @returns {object} returns the listening server instance
   */
  start() {
    // Error handler, should be final middleware
    this.app.use(function(err, req, res, next) {
      if (res.headersSent) return next(err)
      Logger.error(err.stack, 'HttpServer.start()')
      const ret = {status: 'Server error'}
      HttpServer.sendError(res, ret, 500)
    })

    if (this.httpsOptions == null || !this.httpsOptions.active) {
      // Start a http server
      this.server = this.app.listen(this.port, () => {
        Logger.info('HTTP server listening on port ' + this.port)
      })
    } else {
      // Start a https server
      const options = {
        key: fs.readFileSync(this.httpsOptions.keypath),
        cert: fs.readFileSync(this.httpsOptions.certpath),
        requestCert: false,
        rejectUnauthorized: false
      }
      
      if (this.httpsOptions.capath)
        options.ca = fs.readFileSync(this.httpsOptions.capath)

      if (this.httpsOptions.passphrase)
        options.passphrase = this.httpsOptions.passphrase

      this.server = https.createServer(options, this.app).listen(this.port, () => {
        Logger.info('HTTPS server listening on port ' + this.port)
      })
    }

    this.server.timeout = 600 * 1000
    return this.server
  }

  /**
   * Stop the http server
   */
  stop() {
    if (this.app === null) return
    this.app.close()
  }

  /**
   * Return a http response without data
   * @param {object} res - http response object
   */
  static sendOk(res) {
    const ret = {status: 'ok'}
    res.status(200).json(ret)
  }

  /**
   * Return a http response without status
   * @param {object} res - http response object
   */
  static sendOkDataOnly(res, data) {
    res.status(200).json(data)
  }

  /**
   * Return a http response with status and data
   * @param {object} res - http response object
   * @param {object} data - data object
   */
  static sendOkData(res, data) {
    const ret = {
      status: 'ok',
      data: data
    }
    res.status(200).json(ret)
  }

  /**
   * Return a http response with raw data
   * @param {object} res - http response object
   * @param {object} data - data object
   */
  static sendRawData(res, data) {
    res.status(200).send(data)
  }

  /**
   * Return an error response
   * @param {object} res - http response object
   * @param {object} data - data object
   */
  static sendError(res, data, errorCode) {
    if (errorCode == null)
      errorCode = 400

    const ret = {
      status: 'error',
      error: data
    }

    res.status(errorCode).json(ret)
  }

  /*
   * A middleware returning an authorization error response
   * @param {string} err - error
   * @param {object} req - http request object
   * @param {object} res - http response object
   * @param {function} next - callback function
   */
  static sendAuthError(err, req, res, next) {
    if (err) {
      HttpServer.sendError(res, err, 401)
    }
  }

  /**
   * Express middleware returnsing a json response 
   * @param {object} req - http request object
   * @param {object} res - http response object
   * @param {function} next - next middleware
   */
  static setJSONResponse(req, res, next) {
    res.set('Content-Type', 'application/json')
    next()
  }

  /**
   * Express middleware adding cors header
   * @param {object} req - http request object
   * @param {object} res - http response object
   * @param {function} next - next middleware
   */
  static setCrossOrigin(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*')
    next()
  }

  /**
   * Express middleware logging url and methods called
   * @param {object} req - http request object
   * @param {object} res - http response object
   * @param {function} next - next middleware
   */
  static requestLogger(req, res, next) {
    Logger.info(`${req.method} ${req.url}`)
    next()
  }

}

/**
 * Helmet Policy
 */
HttpServer.HELMET_POLICY = {
  'contentSecurityPolicy' : {
    'directives': {
      'defaultSrc': ['"self"'],
      'styleSrc' : ['"self"', '"unsafe-inline"'],
      'img-src' : ['"self" data:']
    }
  },
  'dnsPrefetchControl': true,
  'frameguard': true,
  'hidePoweredBy': true,
  'hpkp': false,
  'hsts': true,
  'ieNoOpen': true,
  'noCache': true,
  'noSniff': true,
  'referrerPolicy': true,
  'xssFilter': true
}


module.exports = HttpServer
