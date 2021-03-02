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