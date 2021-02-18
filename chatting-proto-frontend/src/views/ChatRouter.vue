<template>
  <div/>
</template>

<script>
export default {
  name: 'ChatRouter',
  beforeCreate () {
    this.$router.replace({ name: 'Chat', params: this.$route.params })
  }
}
</script>

<style scoped>
</style>
