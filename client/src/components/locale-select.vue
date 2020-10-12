<template>
  <div>
    <let-select ref="localSelect" v-model="locale" @change="changeLocale" :clearable="false" size="small">
      <template v-for="locale in localeMessages">
        <let-option :value="locale.localeCode" v-bind:key="locale.localeCode">{{locale.localeName}}</let-option>
      </template>
    </let-select>
  </div>
</template>

<script>
//import locales from '@/locale/index';
import {localeMessages} from '@/locale/i18n';
export default {
  data() {
    return {
      locale: this.$cookie.get('locale') || 'cn',
      localeMessages: localeMessages
    };
  },
  methods:{
    changeLocale(){
      this.$cookie.set('locale', this.locale, {expires: '1Y'});
      location.reload();
    }
  }
};
</script>

<style>
</style>
