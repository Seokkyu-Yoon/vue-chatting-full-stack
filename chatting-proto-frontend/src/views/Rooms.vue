<template>
  <div class="flex-fill d-flex p-3 overflow-hidden">
    <Password ref="password" :room="selectedRoom" :join="join"/>
    <UpsertRoom ref="upsertRoom" />
    <div class="flex-fill d-flex mb-2 flex-column">
      <div class="d-flex mb-2">
        <div class="mr-1">
          <b-btn type="button" variant="primary" v-on:click="createRoom">방 만들기
          <b-icon icon="plus"></b-icon>
          </b-btn>
        </div>
        <div class="flex-fill"><input type="text" v-model="store.searchRoomText" @input="getRoomsSearched" class="form-control" placeholder="검색"/></div>
        <p class="h4 m-0 p-0 d-none d-sm-flex align-items-center justify-content-center joined" v-if="!searching">
          최근 방문
        </p>
      </div>
      <div class="d-flex flex-fill overflow-hidden">
        <RoomList class="d-flex"
          v-if="!searching"
          :rooms="store.rooms"
          :getRooms="getRooms"
          :join="join"
          emptyMessage="생성된 방이 없습니다"
          scroll
        />
        <RoomList class="d-none d-sm-flex joined"
          v-if="!searching"
          :rooms="store.roomsJoined"
          :getRooms="getRoomsJoined"
          :join="join"
          mini
          emptyMessage="최근방문한 방이 없습니다"
        />
        <RoomList
          class="d-flex"
          v-if="searching"
          :rooms="store.roomsSearched"
          :getRooms="getRoomsSearched"
          :join="join"
          emptyMessage="검색된 방이 없습니다"
        />
      </div>
    </div>
  </div>
</template>

<script src="./rooms.js"></script>

<style scoped>
.joined {
  min-width: 17rem !important;
  max-width: 17rem !important;
  margin-left: 0.5rem !important;
}

</style>
