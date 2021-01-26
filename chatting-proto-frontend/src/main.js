import Vue from 'vue'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'
import router from './router'
import PluginSocket from './plugin/socket'
import PluginEventBus from './plugin/event-bus'

const {
  VUE_APP_SERVER_PROTOCOL,
  VUE_APP_SERVER_IP,
  VUE_APP_SERVER_PORT
} = process.env

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
Vue.use(PluginSocket)
Vue.use(PluginEventBus)

Vue.prototype.$http = axios
Vue.prototype.$localUrl = `${VUE_APP_SERVER_PROTOCOL}//${VUE_APP_SERVER_IP}:${VUE_APP_SERVER_PORT}`

Vue.directive('visible', function (el, binding) {
  el.style.visibility = binding.value ? 'visible' : 'hidden'
})
new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
