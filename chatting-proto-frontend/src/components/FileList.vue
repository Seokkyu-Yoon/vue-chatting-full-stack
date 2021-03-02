<template>
  <div id="cover-users" class="d-flex flex-fill flex-column bg-files p-2">
    <b-button @click="showUploadPannel = !showUploadPannel">share</b-button>
    <transition name="slide-fade-Y">
    <div v-if="showUploadPannel">
      <file-uploader :roomId="roomId" :user="user" @upload-success="uploadSuccess"></file-uploader>
    </div>
    </transition>

    <p class="h5 mt-2" v-if="fileList.length === 0">첨부된 파일이 없습니다</p>

    <b-list-group class="mt-2">
      <transition-group name="slide-fade">
      <b-overlay
        v-for="(itm, idx) in fileList"
        :key="itm.id"
        :show="fileList[idx].overlay"
        :no-center="true"
        class="list-itm"
      >
        <b-list-group-item>
          <div class="row">
            <div class="col-2 lock-icon">
              <b-icon v-if="itm.is_protected" icon="lock-fill"></b-icon>
              <b-icon v-else icon="unlock-fill"></b-icon>
            </div>
            <div class="col-8">
              <b-link class="file-link" @click="itm.is_protected ? displayOverlay(itm, 'passwd') : downloadFile(itm)">
                {{itm.filename}}<br/>{{itm.size}} Byte
              </b-link>
            </div>
            <div class="col-2 operations">
              <b-icon icon="share" class="share-icon icon" @click="copyToClipboard(itm)"></b-icon>
              <b-icon icon="trash" class="delete-icon icon" @click="displayOverlay(itm, 'delete')"></b-icon><br/>
            </div>
          </div>
        </b-list-group-item>
        <template #overlay>
          <div class="overlay-container" v-if="overlayId === 'delete'">
            <div class="overlay-text">삭제하시겠습니까?</div>
            <div class="mt-2">
              <b-button variant="outline-success" class="mr-3" size="sm" @click="deleteFile(itm)">네</b-button>
              <b-button variant="outline-danger" size="sm" @click="itm.overlay = false">
                아니오
              </b-button>
            </div>
          </div>

          <div class="overlay-container" v-else-if="overlayId === 'passwd'">
            <b-form-input class="p-2 overlay-input"
              size="sm" v-model="itm.inputPasswd"
              type="password"
              :state="itm.state"
              placeholder="Enter password"
            ></b-form-input>
            <div class="mt-1">
              <b-button variant="outline-success" class="mr-3" size="sm" @click="downloadFile (itm)" >다운로드</b-button>
              <b-button variant="outline-danger" size="sm" @click="closeDownloadOverlay(itm)">
                취소
              </b-button>
            </div>
          </div>
          <div v-else class="text-center p-3 upload-overlay position-relative">
            <b-spinner></b-spinner>
            <div>
              <b-progress class="mt-3 progress-custom"
                :value="downloadProgress" :max="100" show-progress animated
              ></b-progress>
              <b-icon class="delete-icon icon ml-2" icon="file-excel"
                @click="cancelTokens[itm.id].cancel()"
              ></b-icon>
            </div>
          </div>
        </template>
      </b-overlay>
      </transition-group>
    </b-list-group>

    <toast-alert alertId="clipboard-alert" message="다운로드 링크가 복사되었습니다."></toast-alert>
    <toast-alert alertId="delete-alert" message="파일이 삭제되었습니다."></toast-alert>
    <toast-alert alertId="upload-alert" message="업로드가 완료되었습니다."></toast-alert>
    <toast-alert alertId="download-alert" message="다운로드가 완료되었습니다."></toast-alert>
    <toast-alert alertId="download-cancel-alert" message="다운로드가 취소되었습니다."
      variant="danger"
      notice-color="#ff5555"
    ></toast-alert>
    <toast-alert alertId="invalid-passwd-alert" message="비밀번호가 일치하지 않습니다."
      variant="danger"
      notice-color="#ff5555"
    ></toast-alert>
  </div>
</template>
<script src="./file-list"></script>

<style scoped>
#cover-users {
  border-radius: 10px;
  overflow-y: auto;
  overflow-x: hidden;
}
.icon:hover {
  cursor: pointer;
  border-radius: 3px;
  color: white;
}
.delete-icon:hover {
  background-color: #fc3636;
}
.delete-icon {
  color: #fc3636;
}
.share-icon:hover {
  background-color: #22aafb;
}
.share-icon {
  color: #22aafb;
}
.lock-icon {
  margin-left: -10px;
}
.file-link {
  overflow: hidden;
  word-break: break-all;
}
.operations {
  text-align: right;
}
.overlay-container {
  text-align: center;
  margin-top: 3px;
}
.overlay-text {
  font-size: 13px;
}
.list-itm {
  transition: all .5s;
}
.progress-custom {
  width: 85%;
  display:inline-flex;
}
/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active,
.slide-fade-leave-active,
.slide-fade-Y-enter-active,
.slide-fade-Y-leave-active {
  overflow: hidden;
  transition: all .5s;
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(30%);
  opacity: 0.5s;
}
.slide-fade-Y-enter, .slide-fade-Y-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateY(-30%);
  max-height: 100%;
  opacity: 0;
}
</style>
