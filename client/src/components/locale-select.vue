<template>
  <div>
    <el-select v-model="locale" @change="changeLocale" style="width:100px">
      <el-option
        v-for="locale in localeMessages"
        :key="locale.localeCode"
        :value="locale.localeCode"
        :label="locale.localeName"
      >
      </el-option>
    </el-select>
  </div>
</template>

<script>
import { localeMessages } from "@/locale/i18n";
export default {
  data() {
    return {
      locale: this.$cookie.get("locale") || "cn",
      localeMessages: localeMessages,
    };
  },
  methods: {
    changeLocale() {
      // console.log("locale", this.locale);
      this.$cookie.set("locale", this.locale, { expires: "1Y" });
      location.reload();
    },
  },
};
</script>

<style></style>
