<template>
<div class="d-flex flex-column h-50 mt-1 p-1 holder overflow-hidden">
  <p class="h6 text-center">그룹메시지</p>
  <button
    class="btn btn-sm btn-info ml-auto"
    v-on:click="removeAllRecipients()">
    전체 제외
  </button>
  <div class="flex-fill my-1 overflow-auto">
    <div
      class="d-flex align-items-center mb-1 user p-2"
      v-for="({id, name, idx}, index) in store.recipients"
      v-bind:key="`recipient-${id}`">
      <b-img
        class="tumbnail"
        :src='`https://picsum.photos/id/${idx}/100`'/>
      <div class="d-flex flex-column ml-2 flex-fill">
        <div class="d-flex mb-1">
          <button
            class="btn btn-sm btn-danger ml-auto pt-1 pb-0 px-2"
            v-text="'제외'"
            v-on:click="removeRecipient(index)"
            />
        </div>
        <p class="h5 m-0 p-0 ml-auto user-name">{{name}}</p>
      </div>
    </div>
  </div>
  <div class="flex-shrink-0 recipient-text">{{recipientsText}}</div>
  <div class="d-flex">
    <div class="flex-fill">
      <textarea
        class="form-control"
        v-model="content"
        v-on:keydown.enter.exact="(e) => {
          e.preventDefault()
          send()
        }"/>
    </div>
    <button class="btn btn-sm btn-info ml-1" v-on:click="send" v-bind:disabled="store.recipients.length === 0">전송</button>
  </div>
</div>
</template>

<script src="./group-chat.js"></script>

<style scoped>
.form-control {
  resize: none;
}
.tumbnail {
  width: 46px;
  height: 46px;
  border-radius: 23px;
}

.selected {
  background-color: aquamarine;
}

.user {
  border-radius: 5px;
  padding: 5px;
  height: 4rem;
  background-color: #B4E4DF;
}

.recipient-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
