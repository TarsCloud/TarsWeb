<template>
  <div class="login-page">
    <h1 class="top-title">
      {{$t('login.loginTitle')}}
      <div class="locale-wrap">
        <locale-select></locale-select>
      </div>
    </h1>
    <let-form
      ref="form"
      inline
      label-position="top"
      itemWidth="440px"
      @submit.native.prevent="login"
    >
      <let-form-item :label="$t('login.userName')" required>
        <let-input
          size="small"
          v-model="uid"
          required
          :required-tip="$t('login.userNameTips')"
          pattern="^[a-zA-Z0-9_]+$"
          :pattern-tip="$t('login.userNameRegTips')"
          @keydown.enter="login"
        ></let-input>
      </let-form-item>
      <let-form-item :label="$t('login.password')" required>
        <let-input
          type="password"
          size="small"
          v-model="password"
          required
          :required-tip="$t('login.passwordTips')"
          @keydown.enter="login"
        ></let-input>
      </let-form-item>
      <let-form-item :label="$t('login.captcha')" required>
        <div class="captcha_box">
          <let-input
            type="text"
            size="small"
            v-model="captcha"
            required
            :required-tip="$t('login.captchaTips')"
            @keydown.enter="login"
          ></let-input>
          <img class="captcha_code" title="点击刷新" :src="captchaUrl" @click="reloadCaptcha" />
        </div>
      </let-form-item>

      <let-button type="submit" theme="primary">{{$t('login.login')}}</let-button>
      <!-- <let-button type="button" @click.prevent="toRegisterPage" style="float:right;margin-right:12px;">{{$t('login.toRegisterPage')}}</let-button> -->
    </let-form>
  </div>
</template>

<script>
import localeSelect from '../../components/locale-select.vue';
export default {
  name: 'loginPage',
  data() {
    return {
      uid: '',
      password: '',
      captcha: '',
      captchaUrl: `/captcha?${Math.random()}`,
    };
  },
  computed: {
    redirectUrl(){
      return this.getQueryParam('redirect_url', '/');
      // var key = 'redirect_url=';
      // var idx = location.search.indexOf(key);
      // if(idx > -1){
      //   return decodeURIComponent(location.search.substring(idx + key.length));
      // }else{
      //   return '/';
      // }
    }
  },
  components: {
    localeSelect
  },
  methods: {
    login() {
      if(!this.$refs.form.validate()){
        return;
      }
      const loading = this.$Loading.show();
      this.$ajax.postJSON('/server/api/login', {
        uid: this.uid,
        password: this.password,
        captcha: this.captcha,
      }).then((data)=>{
        loading.hide();
        var redirectUrl = this.redirectUrl;
        var href = redirectUrl + (redirectUrl.indexOf('?') === -1?'?':'&') + 'ticket=' + data.ticket;
        // console.log(data, redirectUrl, href);

        location.href = href;
      }).catch((err)=>{
        loading.hide();
//        this.reloadCaptcha()
        this.$tip.error(`${this.$t('login.loginFailed')}: ${err.err_msg || err.message}`);
      })
    },
    getQueryParam(key, def) {
      if (!key) {
          return def;
      }

      var value = def;
      var paramStr = window.location.search ? window.location.search.substr(1) : '';

      if (paramStr) {
          paramStr.split('&').forEach(function (param) {
              var arr = param.split('=');
              if (arr[0] == key) {
                  value = decodeURIComponent(arr[1]);
              }
          });
      }

      return value;
    },
    reloadCaptcha() {
      this.captchaUrl = `/captcha?${Math.random()}`
    },
  },
  mounted() {
    this.uid = this.getQueryParam('user', '');
  }
};
</script>
<style>
  @import "../../assets/font/lato/Lato.css";
  @import '../../assets/css/reset.css';
  @import '../../assets/css/variable.css';
  .top-title{
    margin: 16px 0;
    line-height: 2.5;
    font-size: 18px;
    border-bottom: 1px solid #c5d9e8;
    position:relative;
  }
  .login-page{
    width: 450px;
    margin: 100px auto;
  }
  .locale-wrap{
    position:absolute;
    right: 10px;
    top: -5px;
  }
  .captcha_box{display:flex;}
  .captcha_code{cursor:pointer;display:block;height:32px;margin-left:20px;}
</style>
