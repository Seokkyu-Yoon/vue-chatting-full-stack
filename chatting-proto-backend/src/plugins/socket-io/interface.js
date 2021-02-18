const Interface = {
  CONNECT: 'connect',
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  Broadcast: {
    User: {
      LIST: 'broadcast:user:list'
    },
    Room: {
      LIST: 'broadcast:room:list',
      JOIN: 'broadcast:room:join',
      CREATE: 'broadcast:room:create',
      LEAVE: 'broadcast:room:leave',
      UPDATE: 'broadcast:room:update',
      DELETE: 'broadcast:room:delete'
    },
    Message: {
      WRITE: 'broadcast:message:write'
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
      MESSAGES: 'res:room:messages',
      SEARCH: 'res:room:search'
    },
    Message: {
      LIST: 'res:message:list',
      WRITE: 'res:message:write',
      RECONNECT: 'res:message:reconnect'
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
      UPDATE: 'req:room:update',
      LEAVE: 'req:room:leave',
      DELETE: 'req:room:delete',
      SEARCH: 'req:room:search'
    },
    Message: {
      LIST: 'req:message:list',
      WRITE: 'req:message:write',
      RECONNECT: 'req:message:reconnect'
    }
  }
}

export default Interface
