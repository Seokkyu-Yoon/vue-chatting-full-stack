<template>
  <b-modal
    ref="modal"
    v-model="show"
    v-bind:title="modifing ? '방 수정' : '방 생성'"
    centered size="xl"
    @shown="initInputs">
    <template #modal-header={}>
    </template>

    <template>
      <div class="container">
        <div class="row">
          <div class="col-3 my-auto text-right">
            제목
          </div>
          <div class="flex-fill">
            <input class="form-control" v-model="title"/>
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-3 my-auto text-right">
            공개여부
          </div>
          <div class="flex-fill">
            <button
              v-bind:class="getBtnClass('public')"
              v-on:click="setPublic">
              공개방
            </button>
            <button
              v-bind:class="getBtnClass('private')"
              v-on:click="setPrivate">
              비밀방
            </button>
          </div>
        </div>
        <div class="row mt-3" v-if="isPrivate">
          <div class="col-3 my-auto text-right">
            비밀번호
          </div>
          <div class="flex-fill">
            <input type="password" class="form-control" v-model="pw"/>
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-3 my-auto text-right">
            최대인원
          </div>
          <div class="flex-fill d-flex align-items-center">
            <b-check id="infinity" v-model="isInfinity">무제한</b-check>
            <div v-visible="!isInfinity" class="ml-3 d-flex">
              <input type="number" class="form-control mr-1" min="0" v-model="maxJoin"/>
              <div class="my-auto">명</div>
            </div>
          </div>
        </div>
        <!-- <div class="row mt-3">
          <div class="col-3 col-md-2 text-right">
            썸네일
          </div>
          <div class="col-15 col-md-10">
            <input class="form-control"/>
          </div>
        </div> -->
        <div class="row mt-3">
          <div class="col-3 my-auto text-right">
            설명
          </div>
          <div class="flex-fill">
            <textarea class="form-control" v-model="description"/>
          </div>
        </div>
      </div>
    </template>

    <template #modal-footer="{ ok }">
      <button
        type="button"
        v-bind:class="modifing ? 'btn btn-sm btn-warning' : 'btn btn-sm btn-success'"
        v-on:click="() => {
          if (modifing) {
            // 수정
            updateRoom()
            ok()
            return
          }
          createRoom()
          ok()
        }">
        {{modifing ? '수정' : '등록'}}
      </button>
      <button
        type="button"
        class="btn btn-sm btn-danger"
        v-if="modifing"
        v-on:click="() => {
          deleteRoom()
          ok()
        }">
        삭제
      </button>
    </template>
  </b-modal>
</template>

<script src="./upsert-room.js"></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.form-control {
  resize: none;
}
</style>
