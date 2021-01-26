<template>
  <div id="cover-users" class="d-flex flex-fill flex-column bg-files p-2">
    <p class="h5 mt-3" v-if="fileList.length === 0">첨부된 파일이 없습니다</p>
    <b-list-group>
      <b-list-group-item
        v-for="(itm, idx) in fileList"
        :key="idx"
      >
      <div class="row">
        <div class="col-2 lock-icon">
          <b-icon v-if="itm.passwd === 'none'" icon="unlock-fill"></b-icon>
          <b-icon v-else icon="lock-fill"></b-icon>
        </div>
        <div class="col-8">
          <b-link class="file-link" @click="downloadFile(itm)">{{itm.filename}}<br/>{{itm.size}} Byte</b-link>
        </div>
        <div class="col-2 operations">
          <b-icon icon="share" class="share-icon icon" @click="test"></b-icon>
          <b-icon icon="trash" class="delete-icon icon" @click="deleteFile(itm)"></b-icon><br/>
        </div>
      </div>
      </b-list-group-item>
    </b-list-group>
    <form name="frmData" id="frmData" method="post"></form>
  </div>
</template>
<script src="./file-list"></script>

<style scoped>
#cover-users {
  border-radius: 10px;
  overflow-y: scroll;
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
</style>
