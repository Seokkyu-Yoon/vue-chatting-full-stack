<template>
  <b-modal ref="modal" v-bind:title="title" centered size="xl">
    <template #modal-header>
    </template>

    <template>
      <div class="container">
        <div class="row">
          <div class="col-3 col-md-2">
            제목
          </div>
          <div class="col-15 col-md-10">
            <input class="form-control"/>
          </div>
        </div>
        <div class="row">
          <div class="col-3 col-md-2">
            공개여부
          </div>
          <div class="col-15 col-md-10">
            <input class="form-control"/>
          </div>
        </div>
        <div class="row">
          <div class="col-3 col-md-2">
            비밀번호
          </div>
          <div class="col-15 col-md-10">
            <input class="form-control"/>
          </div>
        </div>
        <div class="row">
          <div class="col-3 col-md-2">
            최대인원
          </div>
          <div class="col-15 col-md-10">
            <input class="form-control"/>
          </div>
        </div>
        <div class="row">
          <div class="col-3 col-md-2">
            썸네일
          </div>
          <div class="col-15 col-md-10">
            <input class="form-control"/>
          </div>
        </div>
        <div class="row">
          <div class="col-3 col-md-2">
            설명
          </div>
          <div class="col-15 col-md-10">
            <input class="form-control"/>
          </div>
        </div>
      </div>
    </template>

    <template #modal-footer="{ ok }">
      <button
        type="button"
        v-bind:class="modifing ? 'btn btn-sm btn-warning' : 'btn btn-sm btn-success'"
        v-on:click="() => {
          ok();
        }">
        {{modifing ? '수정' : '등록'}}
      </button>
      <button
        type="button"
        class="btn btn-sm btn-danger"
        v-if="modifing"
        v-on:click="() => {
          ok();
        }">
        삭제
      </button>
    </template>
  </b-modal>
</template>

<script src="./upsert-room.js"></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
