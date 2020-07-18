import Vue from 'vue';

import '../../plugins/ui';
import '../../plugins/ajax';

import App from './App';
import router from './router';
import { i18n, loadLang} from '../../locale/i18n'

Vue.config.productionTip = false;

/* eslint-disable no-new */
loadLang.call(this).then(()=>{
  new Vue({
    el: '#auth-app',
    router,
    i18n,
    components: { App },
    template: '<App/>',
  });
});

