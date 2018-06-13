import Vue from "vue";
import VueI18n from "vue-i18n";
import VueCookie from "vue-cookie";
import letCn from "let-ui/lib/locale/lang/zh-CN.min";
import letEn from "let-ui/lib/locale/lang/en-US.min";
import letLocale from "let-ui/lib/locale/index.min";
Vue.use(VueI18n);
Vue.use(VueCookie);

const i18n = new VueI18n({
  locale: VueCookie.get('locale') || 'cn',
  messages: {
    en: Object.assign(require('../../../locale/en.json'), letEn),
    cn: Object.assign(require('../../../locale/cn.json'), letCn)
  }
});

letLocale.i18n((key, value) => i18n.t(key, value));

export default i18n

