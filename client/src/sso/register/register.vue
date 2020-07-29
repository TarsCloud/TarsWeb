<template>
  <div class="login_page">
    <h1 class="top-title">
      {{$t('login.registerTitle')}}
      <div class="locale-wrap">
        <locale-select></locale-select>
      </div>
    </h1>
    <let-form
      ref="form"
      inline
      label-position="top"
      itemWidth="440px"
      @submit.native.prevent="register"
    >
      <let-form-item :label="$t('login.userName')" required>
        <let-input
          size="small"
          v-model="uid"
          required
          :required-tip="$t('login.userNameTips')"
          pattern="^[a-zA-Z0-9_]+$"
          :pattern-tip="$t('login.userNameRegTips')"
          @keydown.enter="register"
        ></let-input>
      </let-form-item>
      <let-form-item :label="$t('login.password')" required>
        <let-input
          type="password"
          size="small"
          v-model="password"
          required
          :required-tip="$t('login.passwordTips')"
          @keydown.enter="register"
        ></let-input>
      </let-form-item>
      <let-form-item :label="$t('login.repeatPassword')" required>
        <let-input
          type="password"
          size="small"
          v-model="repeatPassword"
          required
          :required-tip="$t('login.repeatPasswordTips')"
          @keydown.enter="register"
        ></let-input>
      </let-form-item>

      <let-button type="submit" theme="primary">{{$t('login.register')}}</let-button>
      <let-button type="button" @click.prevent="toLoginPage" style="float:right;margin-right:12px;">{{$t('login.toLoginPage')}}</let-button>
    </let-form>

  </div>
</template>

<script>
import localeSelect from '../../components/locale-select.vue';
export default {
  name: 'login_page',

  data() {
    return {
      uid: '',
      password: '',
      repeatPassword: ''
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
    register() {
        if(!this.$refs.form.validate()){
          return;
        }
        if(!this.checkRepeatPwdValid()){
           this.$tip.error(`${this.$t('login.passwordDiff')}`);
           return;
        }
        const loading = this.$Loading.show();
        this.$ajax.postJSON('/server/api/register',  {uid: this.uid, password: this.password, repeat_password: this.repeatPassword}).then((data)=>{
            loading.hide();
            this.$tip.success(`${this.$t('login.registerSucc')}`);
            setTimeout(()=>{
              this.toLoginPage();
            }, 1000);
        }).catch((err)=>{
            loading.hide();
            this.$tip.error(`${this.$t('login.registerFailed')}: ${err.err_msg || err.message}`);
        })
    },
    checkRepeatPwdValid(){
      return this.repeatPassword === this.password;
    },
    toLoginPage(){
      location.href="/login.html?redirect_url=" + encodeURIComponent(this.redirectUrl);
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
  .login_page{
    width: 450px;
    margin: 100px auto;
  }
  .locale-wrap{
    position:absolute;
    right: 10px;
    top: -5px;
  }
</style>
