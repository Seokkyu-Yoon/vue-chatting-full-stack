module.exports = {
  apps: [
    {
      name: 'chat-server',
      script: './dist/bin/www.js',
      instances: 0,
      exec_mode: 'cluster',
      env: {
        // local with docker
        REDIS_IP: 'localhost',
        REDIS_PORT: '3032',
        MYSQL_IP: 'localhost',
        MYSQL_PORT: '3031',
        MYSQL_DATABASE: 'chatting',
        MYSQL_USER: 'root',
        MYSQL_PASSWORD: 'qwer1234',
        MYSQL_TIMEZONE: 'Asia/Seoul',
        MYSQL_CHARSET: 'utf8mb4'
      }
    }
  ]
}
