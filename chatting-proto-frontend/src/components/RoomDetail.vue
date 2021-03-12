<template>
  <div id="cover-users" class="d-flex flex-fill flex-column bg-detail p-2">
    <h5 class="text-center">{{store.room.title}}</h5>
    <div class="flex-1 p-2 d-flex flex-column overflow-auto holder">
      <h5>
        <b-badge :variant="store.room.pw ? 'dark' : 'info'">{{store.room.pw ? '비밀' : '공개'}}</b-badge> &nbsp;
        <b-badge variant="dark">{{`${store.room.joining} / ${store.room.maxJoin || '∞'}`}}</b-badge>
      </h5>
      <div class="d-flex">
        {{store.room.description}}
      </div>
    <p class="">
      <small class="text-muted">
        {{store.room.createAt}} 생성됨
      </small>
    </p>
    </div>
  </div>
</template>
<script src="./room-detail.js"></script>

<style scoped>
#cover-users {
  border-radius: 10px;
  overflow-y: scroll;
}

.holder {
  background-color: white;
  border-radius: 10px;
}

.white-space-pre-wrap {
  white-space: pre-wrap;
}

</style>
