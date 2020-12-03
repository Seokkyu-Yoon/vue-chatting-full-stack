import Vue from 'vue';
import App from './App.vue';
import router from './router';
import PluginSocket from './plugin/socket';

Vue.config.productionTip = false;

Vue.use(PluginSocket);

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
