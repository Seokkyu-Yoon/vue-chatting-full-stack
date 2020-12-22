<template>
  <div class='jumbotron d-flex flex-column flex-fill overflow-hidden p-2'>
    <div id="chat-board" class="flex-fill p-2">
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
            {{message.text}}
          </div>
        </div>
        <div class="access-record" v-else>
          {{message.userName}}님이 {{message.type === 'join' ? '입장' : '퇴장'}}하였습니다.
        </div>
      </div>
    </div>
    <div class="form-group mt-1">
      <textarea
        class="form-control"
        v-model="newMessage"
        v-on:keydown.enter.exact="(e) => {
          e.preventDefault();
          send();
        }"/>
      <div class="d-flex mt-1">
        <p>~~~~~에게 전송합니다</p>
        <button class="btn btn-info ml-auto" v-on:click="send">전송</button>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store';

export default {
  name: 'MessageList',
  props: ['messages'],
  data() {
    return {
      scrollToBottom: true,
      newMessage: '',
    };
  },
  methods: {
    send() {
      if (this.newMessage.trim() === '') return;
      this.$request(
        'req:room:write',
        {
          roomKey: store.joiningRoomKey,
          text: this.newMessage.trim(),
        },
      );
      console.log(this.roomKey, this.newMessage);
      this.newMessage = '';
    },
  },
  mounted() {
    const chatBoard = document.querySelector('#chat-board');
    this.scrollTop = chatBoard.scrollHeight - chatBoard.clientHeight;
    chatBoard.scrollTop = this.scrollTop;
  },
  beforeUpdate() {
    const chatBoard = document.querySelector('#chat-board');
    this.scrollToBottom = chatBoard.scrollTop === chatBoard.scrollHeight - chatBoard.clientHeight;
    this.scrollTop = chatBoard.scrollTop;
  },
  updated() {
    const chatBoard = document.querySelector('#chat-board');
    if (this.scrollToBottom) {
      this.scrollTop = chatBoard.scrollHeight - chatBoard.clientHeight;
    }
    chatBoard.scrollTop = this.scrollTop;
  },
};
</script>

<style scoped>
#chat-board {
  overflow-y: scroll;
  background-color: lightblue;
  border-radius: 10px;
}
.form-control {
  resize: none;
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
