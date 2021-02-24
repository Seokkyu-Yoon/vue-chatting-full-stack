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
      ROOM: 'res:user:room',
      SIGNIN: 'res:user:signin',
      SIGNUP: 'res:user:signup'
    },
    Room: {
      LIST: 'res:room:list',
      CREATE: 'res:room:create',
      DELETE: 'res:room:delete',
      MESSAGES: 'res:room:messages',
      SEARCH: 'res:room:search',
      JOINED: 'res:room:joined'
    },
    Member: {
      Online: {
        ROOM: 'res:member:online:room'
      }
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
      ROOM: 'req:user:room',
      SIGNIN: 'req:user:signin',
      SIGNUP: 'req:user:signup'
    },
    Room: {
      LIST: 'req:room:list',
      JOIN: 'req:room:join',
      CREATE: 'req:room:create',
      UPDATE: 'req:room:update',
      LEAVE: 'req:room:leave',
      DELETE: 'req:room:delete',
      SEARCH: 'req:room:search',
      JOINED: 'req:room:joined'
    },
    Member: {
      Online: {
        ROOM: 'req:member:online:room'
      }
    },
    Message: {
      LIST: 'req:message:list',
      WRITE: 'req:message:write',
      RECONNECT: 'req:message:reconnect'
    }
  }
}

export default Interface
