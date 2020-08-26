<template>
  <div class="pass_page">
    <h1 class="top-title">
      {{$t('pass.title')}} 
      <div class="locale-wrap">
        <locale-select></locale-select>
      </div>
    </h1>
    <let-form
      ref="form"
      inline
      label-position="top"
      itemWidth="440px"
      @submit.native.prevent="modify"
    >
      <let-form-item :label="$t('pass.password')" required>
        <let-input
          type="password"
          size="small"
          v-model="password"
          required
          :required-tip="$t('pass.passwordTips')"
          @keydown.enter="register"
        ></let-input>
      </let-form-item>
      <let-form-item :label="$t('pass.repeatPassword')" required>
        <let-input
          type="password"
          size="small"
          v-model="repeatPassword"
          required
          :required-tip="$t('pass.repeatPasswordTips')"
          @keydown.enter="register"
        ></let-input>
      </let-form-item>

      <let-button type="submit" theme="primary">{{$t('pass.modify')}}</let-button>
      <let-button type="button" @click.prevent="toIndexPage" style="float:right;margin-right:12px;">{{$t('pass.toIndexPage')}}</let-button>
    </let-form>

  </div>
</template>

<script>
import localeSelect from '../../components/locale-select.vue';
export default {
  name: 'pass_page',

  data() {
    return {
      // uid: '',
      password: '',
      repeatPassword: ''
    };
  },
  components: {
    localeSelect
  },
  methods: {
    modify() {
        if(!this.$refs.form.validate()){
          return;
        }
        if(!this.checkRepeatPwdValid()){
           this.$tip.error(`${this.$t('pass.passwordDiff')}`);
           return;
        }
        const loading = this.$Loading.show();
        this.$ajax.postJSON('/server/api/modifyPass',  {password: this.password, repeat_password: this.repeatPassword}).then((data)=>{
            loading.hide();
            this.$tip.success(`${this.$t('pass.modifySucc')}`);
            setTimeout(()=>{
              this.toIndexPage();
            }, 1000);
        }).catch((err)=>{
            loading.hide();
            this.$tip.error(`${this.$t('pass.modifyFailed')}: ${err.err_msg || err.message}`);
        })
    },
    checkRepeatPwdValid(){
      return this.repeatPassword === this.password;
    },
    toIndexPage(){
      location.href="/index.html";
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
  .pass_page{
    width: 450px;
    margin: 100px auto;
  }
  .locale-wrap{
    position:absolute;
    right: 10px;
    top: -5px;
  }
</style>
