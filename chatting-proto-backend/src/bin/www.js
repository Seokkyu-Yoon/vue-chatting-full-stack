import './module-alias'

import path from 'path'
import fs from 'fs'
import http from 'http'
import dotenv from 'dotenv'

/**
 * Module dependencies.
 */
import { logger } from '@/core'
import plugins from '@/plugins'
import app from '@/app'

/**
 * Get port from environment and store in Express.
 */

if (process.env.NODE_ENV === 'development') {
  const dotenvPath = path.join(__dirname, '..', '..', '..', '.env')
  const env = dotenv.parse(fs.readFileSync(dotenvPath))
  Object.assign(process.env, env)
}

const port = process.env.SERVER_PORT || 3000
app.set('port', port)

/**
 * Create HTTP server.
 */
const server = http.createServer(app)
plugins.socket(server, plugins.db)

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
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`)
      process.exit(1)
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
  logger.debug(`Listening on ${bind}`)
  logger.info(`http://localhost:${port}`)
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
