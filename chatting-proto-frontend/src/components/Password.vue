<template>
  <b-modal
    ref="modal"
    v-model="show"
    :title="room === null ? '' : room.title"
    centered size="xl"
    hide-footer
    @shown="shown"
    @hidden="hidden">
    <template #modal-header={}>
    </template>

    <template>
      <div class="d-flex pt-4 pb-4">
        <div class="flex-fill">
          <input
            type="password"
            ref="password"
            class="form-control"
            v-model="password"
            placeholder="비밀번호를 입력해주세요"
            v-on:keydown.enter.exact="join"/>
          </div>
        <div><button class="btn btn-primary ml-1" v-on:click="() => join(room, password)">참가</button></div>
      </div>
    </template>
  </b-modal>
</template>

<script src="./password.js"></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.form-control {
  resize: none;
}
</style>
