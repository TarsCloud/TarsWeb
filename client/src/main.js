import Vue from 'vue';

import './plugins/ui';
import './plugins/ajax';
// import './plugins/charts';

import App from './App';
import router from './router';

import VueI18n from 'vue-i18n';
import locales from './locales/locale';

Vue.config.productionTip = false;

Vue.use(VueI18n);

const messages = {
  cn: {
    message: {
      hello: '你好，世界'
    }
  },
  en: {
    message: {
      hello: 'hello world'
    }
  },
  ja: {
    message: {
      hello: 'こんにちは、世界'
    }
  }
}


const i18n = new VueI18n({
  locale: 'cn', // set locale
  messages: messages, // set locale messages
});

/* eslint-disable no-new */
new Vue({
  i18n : i18n,
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
