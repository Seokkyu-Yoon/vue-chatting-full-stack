const Interface = {
  CONNECT: 'connect',
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  Event: {
    User: {
      LIST: 'event:user:list',
    },
    Room: {
      LIST: 'event:room:list',
      MESSAGES: 'event:room:messages',
    },
  },
  Response: {
    User: {
      LIST: 'res:user:list',
      LOGIN: 'res:user:login',
      VALID: 'res:user:valid',
    },
    Room: {
      LIST: 'res:room:list',
      CREATE: 'res:room:create',
      MESSAGES: 'res:room:messages',
    },
  },
  Request: {
    User: {
      LIST: 'req:user:list',
      LOGIN: 'req:user:login',
      VALID: 'req:user:valid',
    },
    Room: {
      LIST: 'req:room:list',
      JOIN: 'req:room:join',
      CREATE: 'req:room:create',
      LEAVE: 'req:room:leave',
      WRITE: 'req:room:write',
      MESSAGES: 'req:room:messages',
    },
  },
};

module.exports = Interface;
