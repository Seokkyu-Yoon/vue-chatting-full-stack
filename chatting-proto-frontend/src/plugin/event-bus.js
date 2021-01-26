const plugin = {
  install (Vue) {
    const { prototype } = Vue
    prototype.$eventBus = new Vue()
  }
}

export default plugin
