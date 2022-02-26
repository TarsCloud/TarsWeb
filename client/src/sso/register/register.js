import Vue from 'vue';

import '../../plugins/ui';
import '../../plugins/ajax';

import register from './register.vue';
import {
  i18n,
  loadLang
} from '../../locale/i18n'
import ElementUI from 'element-ui';

import "@/assets/theme/element-to-let/index.css"

Vue.config.productionTip = false;

/* eslint-disable no-new */
loadLang.call(this).then(() => {
  Vue.use(ElementUI, {
    i18n: (key, value) => i18n.t(key, value)
  });
  new Vue({
    el: '#register-app',
    i18n,
    components: {
      register
    },
    template: '<register/>',
  });
});