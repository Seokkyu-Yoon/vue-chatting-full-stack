<template>
  <div id="cover-users" class="d-flex flex-fill flex-column bg-users p-2">
    <div class="d-flex flex-column flex-fill overflow-auto p-1 holder align-items-center">
      <p class="h6">목록</p>
      <div
        class="d-flex w-100 align-items-center mb-1 user p-2"
        v-for="({id, name}, idx) in store.users"
        v-bind:key="`user-${id}`">
        <b-img
          class="tumbnail"
          :src='`https://picsum.photos/id/${idx}/100`'/>
        <p class="h5 m-0 p-0 ml-auto user-name">{{name}}</p>
      </div>
    </div>
    <div class="d-flex flex-column mt-3 flex-fill p-1 holder overflow-hidden align-items-center">
      <p class="h6">귓속말</p>
      <button class="btn btn-sm btn-info ml-auto mb-1">선택 해제</button>
      <div class="flex-fill overflow-auto w-100">
      <div
        class="d-flex align-items-center mb-1 user p-2"
        v-for="({id, name}, idx) in store.users"
        v-bind:key="`user-${id}`">
        <b-img
          class="tumbnail"
          :src='`https://picsum.photos/id/${idx}/100`'/>
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

.user-name {
  font-weight: bold;
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
