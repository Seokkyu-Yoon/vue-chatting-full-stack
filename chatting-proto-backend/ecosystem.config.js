module.exports = {
  apps: [
    {
      name: 'server',
      script: './dist/bin/www.js',
      instances: 0,
      exec_mode: 'cluster',
      env: {
        // aws
        // REDIS_IP: '172.31.24.243',
        // REDIS_PORT: 6379,
        // MYSQL_IP: '172.31.14.88',
        // MYSQL_PORT: 3306,
        // MYSQL_DATABASE: 'chatting',

        // local with docker
        REDIS_IP: 'localhost',
        REDIS_PORT: '3032',
        MYSQL_IP: 'localhost',
        MYSQL_PORT: '3031',
        MYSQL_DATABASE: 'chatting'
      }
    }
  ]
}
