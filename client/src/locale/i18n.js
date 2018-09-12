import Vue from "vue";
import VueI18n from "vue-i18n";
import VueCookie from "vue-cookie";
import Ajax from '@/lib/ajax';
Vue.use(VueI18n);
Vue.use(VueCookie);

export const i18n =  new VueI18n({});

export var localeMessages = [];

export function loadLang(){
  return new Promise((resolve, reject)=>{
    Ajax.getJSON('/server/api/get_locale').then((locales) => {
      let locale = VueCookie.get('locale');
      if(Object.prototype.toString.call(locales) == '[object Object]'){
        for(var localeCode in locales){
          i18n.setLocaleMessage(localeCode, locales[localeCode]);
          localeMessages.push({
            localeCode: localeCode,
            localeName: locales[localeCode]['localeName'],
            localeMessages: locales
          })
        }
        locale = locales[locale] ? locale : 'cn';
        localeMessages = locales;
      }
      i18n.locale = locale;
      resolve();
    }).catch((err)=>{
      reject(err);
    });
  })
};


