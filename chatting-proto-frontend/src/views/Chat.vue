<template>
  <div class="d-flex flex-fill overflow-hidden">
    <div class="d-flex flex-column col-12 col-md-8 overflow-hidden">
      <UpsertRoom ref="upsertRoom" title="방 수정" v-bind:modifing="true"/>
      <div class="d-flex align-items-center mt-2 mb-4">
        <p class="h3">{{(store.room || {}).roomName || ''}}</p>
        <div class="ml-auto">
          <button
            v-show="store.userName === store.room.createBy || ''"
            type="button"
            class="btn btn-sm btn-secondary mr-1"
            v-on:click="updateRoom">
            설정
          </button>
          <button type="button" class="btn btn-sm btn-danger" v-on:click="leaveRoom">나가기</button>
        </div>
      </div>
      <div class='jumbotron d-flex flex-column flex-fill overflow-hidden p-2'>
        <MessageList v-bind:sended="sended"/>
        <div class="mt-1">
          <textarea
            class="form-control"
            v-model="newMessage"
            v-on:keydown.enter.exact="(e) => {
              e.preventDefault()
              send()
            }"/>
          <div class="d-flex mt-1">
            <p>{{recipients}}에게 전송합니다</p>
            <button class="btn btn-info ml-auto" v-on:click="send">전송</button>
          </div>
        </div>
      </div>
    </div>
    <div class="d-flex col-6 col-md-4 p-3 overflow-hidden">
      <div class="d-flex mt-3 flex-column">
        <div class="p-1 tap-item bg-users">참가자</div>
        <div class="mt-1 p-1 tap-item bg-users">파일</div>
        <div class="mt-1 p-1 tap-item bg-users">방정보</div>
      </div>
      <UserList />
    </div>
  </div>
</template>

<script src="./chat.js"></script>

<style scoped>
.form-control {
  resize: none;
}

.bg-users {
  background-color: #e9ecef
}

.tap-item {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  writing-mode: vertical-rl;
  text-orientation: upright;
}
</style>
