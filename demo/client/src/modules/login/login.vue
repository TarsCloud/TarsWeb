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

      <let-button type="submit" theme="primary">{{$t('login.login')}}</let-button>
      <let-button type="button" @click.prevent="toRegisterPage" style="float:right;margin-right:12px;">{{$t('login.toRegisterPage')}}</let-button>
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
      password: ''
    };
  },
  computed: {
    redirectUrl(){
      var key = 'redirect_url=';
      var idx = location.search.indexOf(key);
      if(idx > -1){
        return decodeURIComponent(location.search.substring(idx + key.length));
      }else{
        return '/';
      }
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
      this.$ajax.postJSON('/api/login', {uid: this.uid, password: this.password}).then((data)=>{
        loading.hide();
        var redirectUrl = decodeURIComponent(this.redirectUrl);
        location.href = redirectUrl + (redirectUrl.indexOf('?') === -1?'?':'&') + 'ticket=' + data.ticket;
      }).catch((err)=>{
        loading.hide();
        this.$tip.error(`${this.$t('login.loginFailed')}: ${err.err_msg || err.message}`);
      })
    },
    toRegisterPage(){
      location.href="/register.html?redirect_url=" + encodeURIComponent(this.redirectUrl);
    }
  },
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
</style>
