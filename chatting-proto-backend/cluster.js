const cluster = require('cluster');
const os = require('os');

const server = require('./bin/www');

const numCPUs = os.cpus().length;
if (cluster.isMaster) {
  // Master:
  // Let's fork as many workers as you have CPU cores console.log(numCPUs);
  console.log(numCPUs);
  for (let i = 0; i < numCPUs; i += 1) {
    cluster.fork();
    console.log('fork');
  }
} else {
  // Worker:
  // Let's spawn a HTTP server
  // (Workers can share any TCP connection.
  // In this case its a HTTP server)
  console.log('else');
  server.listen(3000);
}
