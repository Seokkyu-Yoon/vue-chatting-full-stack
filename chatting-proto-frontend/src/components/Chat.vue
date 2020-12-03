<template>
  <div id="cover-chat">
    <h1>채팅</h1>
    <div id="chat-board">
      <div v-for="(message, index) in messages" v-bind:key="`message-${index}`">
        <div class="message" v-if="message.type === 'message'">
          <div class="message-header">
            <div class="message-header-name">{{message.userName}}</div>
            <div class="message-header-time">{{message.time}}</div>
          </div>
          <div class="text">{{message.text}}</div>
        </div>
        <div v-else-if="message.type === 'time'">
          <div>
            {{message.year}}년 {{message.month}}월 {{message.date}}일
          </div>
        </div>
        <div class="access-record" v-else>
          {{message.userName}}님이 {{message.type === 'join' ? '입장' : '퇴장'}}하였습니다.
        </div>
      </div>
    </div>
    <div id="chat-form">
      <textarea type="text" v-model="newText"/>
      <button v-on:click="send">전송</button>
    </div>
  </div>
</template>

<script>
import store from '@/store';
import myFetch from '@/core/fetch';

export default {
  name: 'Chat',
  data() {
    return {
      store,
      messages: [],
      newText: '',
      scrollToBottom: true,
    };
  },
  created() {
    myFetch.get(`${store.serverIp}/room`, {
      roomKey: store.getRoomKey(),
    }).then(({ messages }) => {
      console.log(messages);
      this.messages = messages;
    }).catch(console.error);

    this.$socket.on('message', (roomKey) => {
      console.log(roomKey);
      if (roomKey !== store.getRoomKey()) return;
      myFetch.get(`${store.serverIp}/room`, {
        roomKey,
      }).then(({ messages }) => {
        this.messages = messages;
      }).catch(console.error);
    });
  },
  beforeUpdate() {
    const chatBoard = document.querySelector('#chat-board');
    this.scrollToBottom = chatBoard.scrollTop === chatBoard.scrollHeight - chatBoard.clientHeight;
  },
  updated() {
    if (!this.scrollToBottom) {
      return;
    }
    const chatBoard = document.querySelector('#chat-board');
    chatBoard.scrollTop = chatBoard.scrollHeight - chatBoard.clientHeight;
  },
  methods: {
    send() {
      this.$write({ roomKey: store.getRoomKey(), text: this.newText.trim() });
      console.log(this.newText);
      this.newText = '';
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  text-align: center;
}
#cover-chat {
  display: flex;
  flex: 2;
  flex-direction: column;
  padding: 10px;
}
#chat-board {
  flex: 1;
  overflow-y: scroll;
  background-color: lightblue;
  padding: 10px;
  margin-bottom: 30px;
  border-radius: 10px;
}
#chat-form {
  display: flex;
  justify-content: space-between;
}
.access-record {
  display: flex;
  margin-bottom: 10px;
  border-radius: 20px;
  background-color: dimgray;
  color: white;
  align-items: center;
  justify-content: center;
}

.message {
  margin-bottom: 10px;
  background-color:lightcyan;
  border-radius: 20px;
  padding: 10px;
}
.message-header {
  display: flex;
  justify-content: space-between;
}
.message-header-name {
  font-size: 14px;
  font-weight: bold;
}
.message-header-time {
  display: flex;
  font-size: 10px;
  background-color: dimgray;
  justify-content: center;
  align-items: center;
  padding: 5px;
  border-radius: 20px;
  color: white;
}
.text {
  margin-top: 5px;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
