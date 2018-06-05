import Vue from 'vue';
import VueI18n from 'vue-i18n';
import locales from './locale';
import VueCookie from 'vue-cookie';
Vue.use(VueI18n);
Vue.use(VueCookie);

const i18n = new VueI18n({
  locale: VueCookie.get('locale') || 'cn',
  messages: locales,
});

export default i18n

