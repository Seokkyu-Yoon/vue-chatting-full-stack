<template>
  <div ref="board" class="flex-fill p-2 chat-board" >
    <div v-if="store.messages.length === 0" class="d-flex w-100 h-100">
      <div class="m-auto">
        <p class="h4">대화내용 불러오는 중...</p>
      </div>
    </div>
    <div v-for="(message, index) in store.messages" v-bind:key="`message-${index}`">
      <div v-if="isShown(message)">
        <div v-if="isDateChanged(index)" >
          <div class="mt-3" v-if="index === 0"></div>
          <div>{{getDateFormatted(message)}}</div>
          <div class="mb-1"/>
        </div>
        <div :class="`message mb-2 p-2 ${message.recipients.length > 0 ? 'message-to-group' : 'message-to-all'}`" v-if="message.type === 'text'">
          <div class="d-flex justify-content-between align-items-end mb-2">
            <div class="message-header-name">{{message.writter}}</div>
            <div class="message-header-time d-flex justify-content-center align-items-center p-1">
              {{getTimeFormatted(message)}}
            </div>
          </div>
          <div class="text mt-1">{{message.content}}</div>
        </div>
        <div v-else>
          <h5>{{message.content}}</h5>
          <small>{{ new Date() }} </small>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./message-list.js"></script>

<style scoped>
.chat-board {
  overflow-y: scroll;
  background-color: lightblue;
  border-radius: 10px;
}

.message {
  background-color:lightcyan;
  border-radius: 20px;
}
.message-to-all {
  background-color: lightcyan;
}
.message-to-group {
  background-color: lightgoldenrodyellow;
}

.message-header-name {
  font-size: 14px;
  font-weight: bold;
}

.message-header-time {
  font-size: 10px;
  background-color: dimgray;
  border-radius: 0.75rem;
  color: white;
}

.text {
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
