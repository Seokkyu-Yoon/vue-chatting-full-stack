<template>
  <div class="d-flex flex-fill overflow-hidden">
    <div class="d-flex flex-column col-13.5 col-md-9 overflow-hidden">
      <UpsertRoom ref="upsertRoom" title="방 수정" v-bind:modifing="true"/>
      <div class="d-flex align-items-center mt-2 mb-4">
        <p class="h3">{{(store.roomMap[store.joiningRoomKey] || {}).roomName || ''}}</p>
        <div class="ml-auto">
          <button v-show="store.userName === (store.roomMap[store.joiningRoomKey] || {}).createBy || ''" type="button" class="btn btn-sm btn-secondary mr-1" v-on:click="updateRoom">
            설정
          </button>
          <button type="button" class="btn btn-sm btn-danger" v-on:click="leaveRoom">나가기</button>
        </div>
      </div>
      <MessageList v-bind:messages="store.messages"/>
    </div>
    <div class="d-flex flex-column col-4.5 col-md-3 ml-3 p-3 overflow-hidden">
      <UserList />
    </div>
  </div>
</template>

<script src="./chat.js"></script>

<style scoped></style>
