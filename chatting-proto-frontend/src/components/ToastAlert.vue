<template>
  <b-toast :id="alertId" :variant="variant" solid :auto-hide-delay="1500" :no-close-button="true">
    <template #toast-title>
      <div class="d-flex flex-grow-1 align-items-baseline">
        <b-img blank :blank-color="noticeColor" class="mr-2" width="12" height="12"></b-img>
        <strong class="mr-auto">Notice</strong>
        <!-- <small class="text-muted mr-2">42 seconds ago</small> -->
      </div>
    </template>
    {{message}}
  </b-toast>
</template>

<script src="./toast-alert"></script>
