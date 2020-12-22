import store from '@/store';
import io from 'socket.io-client';

const $socket = io(store.serverIp, {
  transports: ['websocket'],
});

const SocketPlugin = {
  install(vue) {
    function $request(type, $payload) {
      $socket.emit(type, $payload);
    }

    $socket.on('connect', () => {
      if (store.userName === '') return;
      $request('req:user:login', {
        userName: store.userName,
        roomKey: store.joiningRoomKey,
      });
      $request('req:room:list');
      if (store.joiningRoomKey !== null) {
        $request('req:user:list', { roomKey: store.joiningRoomKey });
      }
    });
    $socket.on('res:room:create', (roomKey) => {
      store.joiningRoomKey = roomKey;
    });
    $socket.on('event:user:list', (userMap) => {
      if (store.joiningRoomKey !== null) return;
      store.userMap = userMap;
    });
    $socket.on('res:user:list', (userMap) => {
      store.userMap = userMap;
    });
    $socket.on('event:room:messages', (messages) => {
      store.messages = messages;
    });
    $socket.on('res:room:messages', (messages) => {
      store.messages = messages;
    });
    $socket.on('res:room:list', (roomMap) => {
      store.roomMap = roomMap;
    });
    $socket.on('event:room:list', (roomMap) => {
      store.roomMap = roomMap;
    });
    $socket.on('res:user:valid', (isValidUsername) => {
      store.isValidUsername = isValidUsername;
    });

    vue.mixin({});

    Object.assign(
      vue.prototype,
      {
        $socket,
        $request,
      },
    );
  },
};

export default SocketPlugin;
