import Vue from 'vue';
import VueCookies from 'vue-cookies';

import App from './App.vue';
import router from './router';
import PluginSocket from './plugin/socket';

Vue.config.productionTip = false;

Vue.use(VueCookies);
Vue.use(PluginSocket);

Vue.$cookies.config('7d');

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
