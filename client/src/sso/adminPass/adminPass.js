import Vue from 'vue';

import '../../plugins/ui';
import '../../plugins/ajax';

import adminPass from './adminPass.vue';
import {i18n, loadLang} from '../../locale/i18n'

Vue.config.productionTip = false;

/* eslint-disable no-new */
loadLang.call(this).then(()=> {
  new Vue({
    el: '#admin-pass-app',
    i18n,
    components: {adminPass},
    template: '<admin-pass/>',
  });
});
