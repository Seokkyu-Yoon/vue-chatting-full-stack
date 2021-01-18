module.exports = {
  apps: [
    {
      name: 'server',
      script: './dist/bin/www.js',
      instances: 0,
      exec_mode: 'cluster',
      env: {
        REDIS_IP: '172.31.24.243',
        REDIS_PORT: 6379,
        MYSQL_IP: '172.31.14.88',
        MYSQL_PORT: 3306,
        MYSQL_DATABASE: 'chatting-proto'
      }
    }
  ]
}
