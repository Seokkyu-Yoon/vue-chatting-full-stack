<template>
  <b-modal
    ref="modal"
    v-model="show"
    v-bind:title="title"
    centered size="xl"
    hide-footer
    @shown="shown"
    @hidden="hidden">
    <template #modal-header={}>
    </template>

    <template>
      <div class="d-flex form-inline pt-4 pb-4">
        <input
          type="password"
          ref="password"
          class="form-control flex-fill"
          v-model="password"
          placeholder="비밀번호를 입력해주세요"
          v-on:keydown.enter.exact="join"/>
        <button class="btn btn-primary ml-1" v-on:click="join">참가</button>
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
