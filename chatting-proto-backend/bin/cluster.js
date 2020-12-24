import path from 'path'
import cluster from 'cluster'
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
const serverPort = process.env.SERVER_PORT
app.set('port', serverPort)

/**
 * Event listener for HTTP server "error" event.
 */
function onError (port, error) {
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
function onListening (server) {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`
  debug(`Listening on ${bind}`)
}

cluster.schedulingPolicy = cluster.SCHED_RR

if (cluster.isMaster) {
  console.log(cluster.worker.id)
  os.cpus().forEach((cpu) => {
    cluster.fork()
    cluster.on('exit', (worker, code, signal) => {
      console.log('worker has stopped :', worker.id)
      if (code === 200) {
        cluster.fork()
        console.log('worker has restarted')
      }
    })
  })
} else {
  console.log('worker has created :', cluster.worker.id)

  /**
   * Create HTTP server.
   */
  const server = http.createServer(app)
  plugins.socket(server, redis)

  /**
   * Listen on provided port, on all network interfaces.
   */
  server.on('error', onError.bind(null, serverPort))
  server.on('listening', onListening.bind(null, server))

  server.listen(serverPort)
}
