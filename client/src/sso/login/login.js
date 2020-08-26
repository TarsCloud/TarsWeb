import Vue from 'vue';

import '../../plugins/ui';
import '../../plugins/ajax';

import login from './login.vue';
import { i18n, loadLang} from '../../locale/i18n'

Vue.config.productionTip = false;

/* eslint-disable no-new */
loadLang.call(this).then(()=>{
  new Vue({
    el: '#login-app',
    i18n,
    components: { login },
    template: '<login/>',
  });
});

