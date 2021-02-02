<template>
<span>
  <div style="text-align: right;">
    <b-button @click="modal = true" class="mb-2">파일 공유</b-button>
  </div>

  <b-modal v-model="modal" title="File Upload">
    <form class="m-2" ref="uploadForm" enctype="multipart/form-data">
      <input type="file" class="btn btn-secondary btn-sm p-1" name="upFile" id="upFile">
      <!-- <button class="btn btn-secondary" @click.prevent="uploadFile">Upload</button> -->
    </form>

    <b-form class="mt-2 p-2">
      <b-form-checkbox class="mb-3 mt-3" v-model="isProtected">
        비밀번호 설정
      </b-form-checkbox>

      <div v-if="isProtected">
      <b-form-group
        id="input-group-1"
        label="비밀번호"
        label-for="input-1"
      >
        <b-form-input
          id="input-1"
          v-model="passwd"
          type="password"
          placeholder="비밀번호를 입력하세요."
          required
        ></b-form-input>
      </b-form-group>

      <b-form-group
        id="input-group-2"
        label="비밀번호 확인"
        label-for="input-1"
      >
        <b-form-input
          id="input-2"
          v-model="validate"
          :state="validate ? validate === passwd : null"
          type="password"
          placeholder="비밀번호를 다시 한 번 입력하세요."
          required
        ></b-form-input>
      </b-form-group>
      </div>

      <b-form-group
        id="input-date-picker"
        label="다운로드 만료 날짜"
      >
        <b-form-datepicker v-model="expireDate" :min="new Date()"></b-form-datepicker>
      </b-form-group>
    </b-form>

    <template #modal-footer>
      <b-button @click="uploadFile">
        UPLOAD
      </b-button>
    </template>
  </b-modal>

  <toast-alert alertId="upload-alert" message="업로드 완료"></toast-alert>
</span>
</template>

<script src="./file-upload-modal"></script>
