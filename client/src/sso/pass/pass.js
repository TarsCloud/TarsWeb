import Vue from 'vue';

import '../../plugins/ui';
import '../../plugins/ajax';

import pass from './pass.vue';
import { i18n, loadLang} from '../../locale/i18n'

Vue.config.productionTip = false;

/* eslint-disable no-new */
loadLang.call(this).then(()=> {
  new Vue({
    el: '#pass-app',
    i18n,
    components: {pass},
    template: '<pass/>',
  });
});
