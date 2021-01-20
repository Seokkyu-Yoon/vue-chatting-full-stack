<template>
  <div id="cover-users" class="d-flex flex-fill flex-column bg-users p-1 pl-2">
    <button class="btn btn-sm btn-info m-2 ml-auto">선택 해제</button>
    <div class="overflow-auto pr-2">
      <div
        class="d-flex align-items-center mb-1 user p-2"
        v-for="({id, name}, idx) in store.users"
        v-bind:key="`user-${id}`">
        <b-img
          class="tumbnail"
          :src="'https://picsum.photos/200/100?random=' + idx"/>
        <p class="h5 ml-auto user-name">{{name}}</p>
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
