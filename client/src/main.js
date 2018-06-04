import Vue from 'vue';
import VueI18n from 'vue-i18n';
import locales from './locales/locale';
import VueCookie from 'vue-cookie';
Vue.use(VueI18n);
Vue.use(VueCookie);

import './plugins/ui';
import './plugins/ajax';
// import './plugins/charts';



import App from './App';
import router from './router';

Vue.config.productionTip = false;
const i18n = new VueI18n({
  locale: VueCookie.get('locale') || 'cn', 
  messages: locales, 
});

/* eslint-disable no-new */
new Vue({
  i18n : i18n,
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
