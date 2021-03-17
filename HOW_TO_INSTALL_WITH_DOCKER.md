# 설치 절차
1. 사전 준비를 한다
2. 본인이 사용할 환경에 맞게 설정을 변경한다
3. init.sh 파일을 실행한다
4. 서버 실행
   1. 배포 모드  
      `chatting-proto-backend 디렉토리`로 이동하여 `npm start`를 입력한다
   2. 개발 모드  
      `chatting-proto-backend 디렉토리`로 이동하여 `npm run dev`를 입력한다  
      - chatting-proto-frontend, chatting-proto-backend에 수정사항이 있을 시  
        각 수정된 부분이 포함된 디렉토리에서 `npm run build` 명령어를 입력하면 배포파일이 생성된다

# 디렉토리 구조
```
├─chatting-proto-backend
│  ├─docker-compose.yml
│  ├─ecosystem.config.js
│  └─nodemon.json
├─chatting-proto-frontend
├─.env
├─init.sh
├─HOW_TO_INSTALL.md
├─HOW_TO_INSTALL_WITH_DOCKER.md
└─README.md
```

# 사전 준비
- server engine
  - node 12.X.X
- docker
  - `chatting-proto-backend 디렉토리`에서
    - `npm run docker-up` 명령어로 mysql과 redis 가 올라간다
    - `npm run docker-down` 명령어로 mysql과 redis 가 내려간다
  - `chatting-proto-backend/docker-compose.yml` 파일에서 docker관련 설정을 변경할 수 있다  

## mysql을 띄운 docker에 bash로 접근하기
- 해당 명령어로 chatting-proto-db, chatting-proto-redis가 올라온것을 확인한다
```
$ docker container ls
```
- 해당 명령어로 chatting-proto-db에 접근한다
```
$ docker exec -it chatting-proto-db bash
```
- 디폴트는 현재 root / qwer1234 (유저 명 / 유저 비밀번호)로되어있으며, docker-compose.yml에서 수정할 수 있다

## ※ 주의사항
- mysql 유저의 권한이 허용되어 있는지 꼭 확인해야한다  
  디폴트 포트는 3306으로 3306 포트를 사용한다면 `-P {포트 번호}` 옵션을 입력하지 않아도 된다
  ```
  $ mysql -u {유저 명} -P {포트 번호} -p
  ```
  ```
  유저명: root / 유저 비밀번호: qwer1234 일 경우
  > ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'qwer1234';
  > FLUSH PRIVILEGES;
  ```

# 설정 변경
> ## server
> ### path
> - .env
> ### contents
> |변수 명|설명|값 예시|비고|
> |--|--|--|--|
> |SERVER_PROTOCOL|사용할 프로토콜|'http:'|-|
> |SERVER_IP|사용할 서버 IP|'192.168.1.2'|client에서 파일 공유 시 사용되므로 반드시 설정해야함<br/>(localhost, 127.0.0.1 안됨)|
> |SERVER_PORT|사용할 포트 번호|3000|-|
---
> ## development
> ### path
> - chatting-proto-backend/nodemon.json
> ### contents
> - env  
> 환경 변수로 주입할 것들
> 
> |변수 명|설명|값 예시|비고|
> |--|--|--|--|
> |NODE_ENV|노드 실행 모드|'development'|-|
> |REDIS_IP|Redis IP|'localhost'|-|
> |REDIS_PORT|Redis Port번호|3032|redis 설치 시 기본 6379<br/>(설치 시 포트 확인)|
> |MYSQL_IP|mysql IP|'localhost'|-|
> |MYSQL_PORT|mysql PORT번호|3031|mysql 설치 시 기본 3306<br/>(설치 시 포트 확인)|
> |MYSQL_DATABASE|mysql에서 사용할 database|'chatting-dev'|-|
> |MYSQL_USER|mysql 유저명|'root'|-|
> |MYSQL_PASSWORD|mysql 유저 비밀번호|'qwer1234'|-|
> |MYSQL_TIMEZONE|mysql 타임존|'Asia/Seoul'|-|
> |MYSQL_CHARSET|mysql 문자 인코딩|'utf8mb4'|-|
---
> ## distrubute
> ### path
> - chatting-proto-frontend/ecosystem.config.js
> ### contents
> - instance
>   - pm2 cluster로 동작하므로 숫자를 입력한 만큼 서버가 뜬다  
>   (0 을 입력하면 cpu 숫자에 맞춰서 뜬다)
> - env
> 환경 변수로 주입할 것들
> 
> |변수 명|설명|값 예시|비고|
> |--|--|--|--|
> |REDIS_IP|Redis IP|'localhost'|-|
> |REDIS_PORT|Redis Port번호|3032|redis 설치 시 기본 6379<br/>(설치 시 포트 확인)|
> |MYSQL_IP|mysql IP|'localhost'|-|
> |MYSQL_PORT|mysql PORT번호|3031|mysql 설치 시 기본 3306<br/>(설치 시 포트 확인)|
> |MYSQL_DATABASE|mysql에서 사용할 database|'chatting'|-|
> |MYSQL_USER|mysql 유저명|'root'|-|
> |MYSQL_PASSWORD|mysql 유저 비밀번호|'qwer1234'|-|
> |MYSQL_TIMEZONE|mysql 타임존|'Asia/Seoul'|-|
> |MYSQL_CHARSET|mysql 문자 인코딩|'utf8mb4'|-|
