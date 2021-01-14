module.exports = {
  apps: [
    {
      name: 'server',
      script: './dist/bin/www.js',
      instances: 0,
      exec_mode: 'cluster'
    }
  ]
}
