import Vue from 'vue';

import '../../plugins/ui';
import '../../plugins/ajax';

import ElementUI from 'element-ui';
import "@/assets/theme/element-to-let/index.css"

import App from './App';
import router from './router';


import {
  i18n,
  loadLang
} from '../../locale/i18n'

Vue.config.productionTip = false;

/* eslint-disable no-new */
loadLang.call(this).then(() => {
  Vue.use(ElementUI, {
    i18n: (key, value) => i18n.t(key, value)
  });

  new Vue({
    el: '#auth-app',
    router,
    i18n,
    components: {
      App
    },
    template: '<App/>',
  });
});