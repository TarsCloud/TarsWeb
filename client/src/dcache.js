import Vue from 'vue';
import './plugins/ui';
import './plugins/ajax';
// import './plugins/charts';

import App from './dcacheApp';
import router from './router/dcache';
import {i18n, loadLang} from './locale/i18n'


Vue.config.productionTip = false;

/* eslint-disable no-new */
loadLang.call(this).then(()=>{
  new Vue({
    i18n : i18n,
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
  });
})

