const Interface = {
  CONNECT: 'connect',
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  Broadcast: {
    User: {
      LIST: 'broadcast:user:list'
    },
    Room: {
      LIST: 'broadcast:room:list',
      DELETE: 'broadcast:room:delete',
      MESSAGES: 'broadcast:room:messages'
    }
  },
  Response: {
    User: {
      LIST: 'res:user:list',
      LOGIN: 'res:user:login',
      IS_VALID: 'res:user:isValid'
    },
    Room: {
      LIST: 'res:room:list',
      CREATE: 'res:room:create',
      DELETE: 'res:room:delete',
      MESSAGES: 'res:room:messages'
    }
  },
  Request: {
    User: {
      LIST: 'req:user:list',
      LOGIN: 'req:user:login',
      IS_VALID: 'req:user:isValid'
    },
    Room: {
      LIST: 'req:room:list',
      JOIN: 'req:room:join',
      CREATE: 'req:room:create',
      LEAVE: 'req:room:leave',
      DELETE: 'req:room:delete',
      WRITE: 'req:room:write',
      MESSAGES: 'req:room:messages'
    }
  }
}

export default Interface
