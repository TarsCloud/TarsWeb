import Vue from 'vue';

import './plugins/ui';
import './plugins/ajax';
// import './plugins/charts';

import App from './App';
import router from './router';
import i18n from './locales'


Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  i18n : i18n,
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
