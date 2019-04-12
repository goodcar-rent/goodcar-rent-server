#!/usr/bin/env node

/**
 * Module dependencies.
 */

import Debug from 'debug'
import http from 'http'

import App from '../app'
import env from 'dotenv-safe'

const debug = Debug('goodcar-rent-server:server')

/**
 * Get port from environment and store in Express.
 */
env.config()

let app = {}
const port = normalizePort(process.env.PORT || '3000')

App(env)
  .then(_app => {
    app = _app
    app.set('port', port)
    app.serverPort = port
    app.serverAddress = `http://localhost:${app.serverPort}`

    const server = app.server = http.createServer(app)
    server.listen(port)
    server.on('error', onError)
    server.on('listening', onListening)
  })
  .catch((err) => { throw err })

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort (val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening () {
  const addr = app.server.address()
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  debug('Listening on ' + bind)
  const hostname = require('os').hostname()
  debug(`http://${hostname}:${addr.port.toString()}/`)
  app.serverAddress = `http://${hostname}:${addr.port.toString()}/`
}
