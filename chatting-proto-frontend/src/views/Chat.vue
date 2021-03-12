<template>
  <div class="d-flex flex-fill p-2">
    <UpsertRoom ref="upsertRoom" v-bind:modifing="true"/>
    <div class="d-flex flex-fill flex-column overflow-hidden">

      <div class='jumbotron d-flex flex-column flex-fill p-2 overflow-hidden-y'>
        <div class="d-flex m-2">
          <h4>{{(store.room || {}).title || ''}}</h4>
          <div class="flex-fill d-flex align-items-center justify-content-end overflow-hidden">
            <button
              v-show="store.room !== null && store.user.id === store.room.createBy || ''"
              type="button"
              class="btn btn-sm btn-secondary mr-1"
              v-on:click="updateRoom">
              <b-icon icon="gear"></b-icon>
            </button>
            <button type="button" class="btn btn-sm btn-danger" v-on:click="leaveRoom">나가기
            </button>
          </div>
        </div>
        <MessageList v-bind:sended="sended"/>
        <div class="d-flex mt-1">
          <div class="flex-fill">
            <textarea
              ref="text"
              class="form-control"
              v-model="content"
              v-on:keydown.enter.exact="(e) => {
                e.preventDefault()
                send()
              }"/>
          </div>
          <button class="btn btn-sm btn-primary ml-1" v-on:click="send">보내기</button>
        </div>
        <div class="pt-2">
          <h3>
          <a href="#" v-for="imoji of imojis" :key="imoji" @click="enterImoji(imoji)">
            <span>{{ imoji }}</span>
          </a>
          </h3>
        </div>
      </div>
    </div>
    <div class="col-4 d-flex ml-1 mt-2 right-menu overflow-hidden">
      <div class="mt-3">
        <p v-bind:class="getClassTapItem('users')" @click="() => changeShowType('users')">참가자</p>
        <p v-bind:class="getClassTapItem('files')" @click="() => changeShowType('files')">파일</p>
        <p v-bind:class="getClassTapItem('detail')" @click="() => changeShowType('detail')">방정보</p>
      </div>
      <div class="d-flex flex-fill overflow-hidden">
        <UserList v-if="showType === 'users'" v-bind:send="send"/>
        <FileList v-if="showType === 'files'"
          :roomId="store.room.title"
          :user="store.user.name"
        />
        <RoomDetail v-if="showType === 'detail'"/>
      </div>
    </div>
  </div>
</template>

<script src="./chat.js"></script>

<style scoped>
.form-control {
  resize: none;
}
.bg-jumbotron {
  background-color: #E9ECEF;
  border-radius: 10px;
}
.bg-users {
  background-color: #B4C9E4;
}
.bg-files {
  background-color: #E4DFB4;
}
.bg-detail {
  background-color: #E4BFB4;
}
.tap-item {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  writing-mode: vertical-rl;
  text-orientation: upright;
  color: #080E15;
  cursor: pointer;
}
.right-menu {
  margin-bottom: 2rem;
}
.curr-show-type {
  padding-left: 0.75rem !important;
}
.overflow-hidden-y {
  overflow-y: hidden;
}
</style>
