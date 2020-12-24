#!/usr/bin/env node

/**
 * Module dependencies.
 */
import path from 'path'
import fs from 'fs'
import logger from 'debug'
import http from 'http'
import dotenv from 'dotenv'

import plugins from '../plugin'
import redis from '../redis'
import app from '../app'

const debug = logger('chatting-proto-backend:server')

/**
 * Get port from environment and store in Express.
 */
const dotenvPath = path.join(__dirname, '..', '..', '.env')
const env = dotenv.parse(fs.readFileSync(dotenvPath))
Object.assign(process.env, env)
const port = process.env.SERVER_PORT
app.set('port', port)

/**
 * Create HTTP server.
 */
const server = http.createServer(app)
plugins.socket(server, redis)

/**
 * Event listener for HTTP server "error" event.
 */
function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`)
      process.exit(1)
    // eslint-disable-next-line no-fallthrough
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`)
      process.exit(1)
    // eslint-disable-next-line no-fallthrough
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening () {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`
  debug(`Listening on ${bind}`)
  debug(`http://192.168.1.77:${port}`)
}

/**
 * Listen on provided port, on all network interfaces.
 */
server.on('error', onError)
server.on('listening', onListening)

if (require.main === module) {
  server.listen(port)
}

export default server
