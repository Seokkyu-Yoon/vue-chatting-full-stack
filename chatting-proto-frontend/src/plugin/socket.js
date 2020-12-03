import store from '@/store';
import io from 'socket.io-client';

const $socket = io(store.serverIp);

const SocketPlugin = {
  install(vue) {
    function $join($payload) {
      $socket.emit('join', $payload);
    }
    function $leave($payload) {
      $socket.emit('leave', $payload);
    }
    function $write($payload) {
      $socket.emit('write', $payload);
    }

    vue.mixin({});

    Object.assign(
      vue.prototype,
      {
        $socket,
        $join,
        $leave,
        $write,
      },
    );
  },
};

export default SocketPlugin;
