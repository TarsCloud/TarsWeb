import Vue from "vue";
import VueI18n from "vue-i18n";
import VueCookie from "vue-cookie";
import locales from "./";
Vue.use(VueI18n);
Vue.use(VueCookie);

let message = {};
locales.forEach((locale)=> {
  message[locale.localeCode] = locale.path;
});

let locale = VueCookie.get('locale');
locale = message[locale] ? locale : 'cn';

const i18n = new VueI18n({
  locale: locale,
  messages: message
});

export default i18n
