import store from '@/store';
import io from 'socket.io-client';

const $socket = io(store.serverIp);

const SocketPlugin = {
  install(vue) {
    function $request(type, $payload) {
      $socket.emit(type, $payload);
    }

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
