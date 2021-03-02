<template>
  <div id="cover-users" class="d-flex flex-fill flex-column bg-detail p-2">
    <div class="flex-1 p-2 d-flex flex-column overflow-auto holder">
      <div class="">
        <p class="h4 text-center">{{store.room.title}}</p>
      </div>
      <div class="d-flex">
        <div class="col-3">방장</div>
        <div class="flex-fill">{{store.room.createBy}}</div>
      </div>
      <div class="d-flex">
        <div class="col-3">비밀번호</div>
        <div class="flex-fill">{{store.room.pw}}</div>
      </div>
      <div class="d-flex">
        <div class="col-3">인원현황</div>
        <div class="flex-fill">{{`${store.room.joining} / ${store.room.maxJoin}`}}</div>
      </div>
      <div class="d-flex">
        <div class="col-3">생성일</div>
        <div class="flex-fill">{{store.room.createAt}}</div>
      </div>
      <div class="d-flex">
        <div class="col-3">설명</div>
        <div class="white-space-pre-wrap flex-fill">{{store.room.description}}</div>
      </div>
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
