# sky-chatting-proto

## supplies
redis
nodejs 12.x
vsCode

## backend
### use socket.io to plugin
### express server

### install
```bash
$ npm install
```

### run with development mode
```bash
$ npm run dev
```

### run with product mode
```bash
$ npm start
```

## frontend
### use socket.io-client to plugin

if run it on your server
1. install node
2. install redis
3. change serverIp in chatting-proto-frontend/store/index.js

# aws
- public IPv4 address: 3.35.173.46
- public IPv4 DNS: ec2-3-35-173-46.ap-northeast-2.compute.amazonaws.com
- sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
  80포트로 들어온 사람을 내부 3000 포트로 연결시킴
- access to aws EC2
```bash
# connect
$ ssh -i ~/.ssh/chatting-proto.pem ubuntu@3.35.173.46

# ping to redis to ElastiCache 
$ redis-cli -h 172.31.14.82 ping
PONG # if response PONG accessable

# mysql
mysql -u root --host 172.31.14.88 -P 3306 -p
```


# Trouble shooting 
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'qwer1234';  
flush privileges;

# When first time install this app (pm2)
1. build frontend and backend
   1. input `$npm run build` at chatting-proto-frontend and chatting-proto-backend directories
2. set db path
   1. check chatting-proto-backend/ecosystem.config.js
   2. if want to use with docker-mysql
      1. go to chatting-proto-backend directory
      2. `$npm run predev` or `$docker-compose up -d`
      3. `$docker exec it chatting-proto-db bash`
      4. `$mysql -u root -p` pw: qwer1234
      5. `$create database chatting`
3. check port
   1. if you want to change go to chatting-proto-backend/encosystem.config.js
   2. add env `SERVER_PORT:{if you want}`
4. npm start
5. http://{serverIP}/{server_port(=default 3000)}
