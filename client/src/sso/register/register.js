import Vue from 'vue';

import '../../plugins/ui';
import '../../plugins/ajax';

import register from './register.vue';
import {i18n, loadLang} from '../../locale/i18n'

Vue.config.productionTip = false;

/* eslint-disable no-new */
loadLang.call(this).then(()=> {
  new Vue({
    el: '#register-app',
    i18n,
    components: {register},
    template: '<register/>',
  });
});
