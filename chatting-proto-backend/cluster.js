const cluster = require('cluster');
const os = require('os');

const server = require('./bin/www');

cluster.schedulingPolicy = cluster.SCHED_RR;
if (cluster.isMaster) {
  os.cpus().forEach((cpu) => {
    cluster.fork();
    cluster.on('exit', (worker, code, signal) => {
      console.log('worker has stopped :', worker.id);
      if (code === 200) {
        cluster.fork();
        console.log('worker has restarted');
      }
    });
  });
} else {
  console.log('worker has created :', cluster.worker.id);
  server.listen(3000);
}
