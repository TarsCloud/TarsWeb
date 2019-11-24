import Vue from 'vue';

import '../../plugins/ui';
import '../../plugins/ajax';

import index from './index.vue';
import {i18n, loadLang} from '../../locale/i18n'

Vue.config.productionTip = false;

/* eslint-disable no-new */
loadLang.call(this).then(()=>{
  new Vue({
    el: '#index-app',
    i18n,
    components: { index },
    template: '<index/>',
  });
});

