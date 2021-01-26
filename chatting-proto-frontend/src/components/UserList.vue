<template>
  <div id="cover-users" class="d-flex flex-fill flex-column bg-users p-2">
    <div class="d-flex flex-column flex-fill overflow-auto p-1 holder align-items-center">
      <p class="h6">목록</p>
      <div
        class="d-flex align-items-center w-100 mb-1 user p-2"
        v-for="({id, name}, idx) in store.users"
        v-bind:key="`user-${id}`">
        <b-img
          class="tumbnail"
          :src='`https://picsum.photos/id/${idx}/100`'/>
        <div class="d-flex flex-column ml-2 flex-fill">
          <div class="d-flex mb-1">
            <button
              class="btn btn-sm btn-success ml-auto pt-1 pb-0 px-2"
              v-text="'귓속말'"
              v-on:click="addRecipient({id, name, idx})"
              v-bind:disabled="isDisableToAddRecipient(name)"
              />
          </div>
          <p class="h5 m-0 p-0 ml-auto user-name">{{name}}</p>
        </div>
      </div>
    </div>
    <div class="d-flex flex-column mt-3 flex-fill p-1 holder overflow-hidden align-items-center">
      <p class="h6">귓속말</p>
      <button
        class="btn btn-sm btn-info ml-auto mb-1"
        v-on:click="removeAllRecipients()">
          선택 해제
        </button>
      <div
        class="d-flex align-items-center w-100 mb-1 user p-2"
        v-for="({id, name, idx}, index) in store.recipients"
        v-bind:key="`recipient-${id}`">
        <b-img
          class="tumbnail"
          :src='`https://picsum.photos/id/${idx}/100`'/>
        <div class="d-flex flex-column ml-2 flex-fill">
          <div class="d-flex mb-1">
            <button
              class="btn btn-sm btn-danger ml-auto pt-1 pb-0 px-2"
              v-text="'취소'"
              v-on:click="removeRecipient(index)"
              />
          </div>
          <p class="h5 m-0 p-0 ml-auto user-name">{{name}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script src='./user-list.js'></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#cover-users {
  border-radius: 10px;
  overflow-y: hidden;
}
.user {
  border-radius: 5px;
  padding: 5px;
  height: 4rem;
  background-color: #B4E4DF;
}

.selected {
  background-color: aquamarine;
}

.holder {
  background-color: white;
  border-radius: 10px;
}

.user-key {
  font-size: 12px;
  text-align: right;
  font-style: italic;
}

.tumbnail {
  width: 46px;
  height: 46px;
  border-radius: 23px;
}

</style>
