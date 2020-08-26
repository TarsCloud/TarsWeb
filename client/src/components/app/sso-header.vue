<template>
  <!-- <div id="app"> -->
    <div class="app_index__header">
      <div class="main-width">
          <!-- <div style="float:right;width: 400px;position:relative;clear:both;"> -->
        <h1 class="hidden">TARS</h1>

        <div class="logo-wrap">
          <a :class="{active: false}" href="/"><img class="logo" src="@/assets/img/tars-logo.png"></a>
        </div>

        <let-tabs class="tabs" :center="true" @click="clickTab" :activekey="$route.matched[0].path">
          <let-tab-pane :tab="$t('ssoHeader.tab.tab1')" tabkey="/" :icon="serverIcon"></let-tab-pane>
          <let-tab-pane v-if="isAdmin" :tab="$t('ssoHeader.tab.tab2')" tabkey="/user" :icon="userIcon"></let-tab-pane>
          <let-tab-pane v-if="isAdmin" :tab="$t('ssoHeader.tab.tab3')" tabkey="/auth" :icon="packageIcon"></let-tab-pane>
          <let-tab-pane :tab="$t('ssoHeader.tab.tab4')" tabkey="/token" :icon="tokenIcon"></let-tab-pane>
          <let-tab-pane  v-if="isAdmin" :tab="$t('ssoHeader.tab.tab5')" tabkey="/set" :icon="opaIcon"></let-tab-pane>
        </let-tabs>

        <div class="language-wrap">
          <let-select v-model="locale" @change="changeLocale" :clearable="false">
            <template v-for="locale in localeMessages">
              <let-option :value="locale.localeCode" :key="locale.localeCode">{{locale.localeName}}</let-option>
            </template>
          </let-select>
        </div>

        <!-- <div class="language-wrap">
                <locale-select></locale-select>
        </div> -->
        <div class="user-wrap">
          <p class="user-info" @click="userOptOpen = !userOptOpen">
            <span class="name toe">{{uid}} </span>
            <i class="let-icon let-icon-caret-down" :class="{up: userOptOpen}" v-show="enableLogin"></i>
            <transition name="fade">
              <div class="user-pop-wrap" v-show="enableLogin && userOptOpen">
              <div> <a href="/pass.html" v-if="!enableLdap">{{$t('ssoHeader.modifyPass')}}</a> </div>
              <div> <a href="/logout">{{$t('login.logout')}}</a> </div>
              </div>
            </transition>
          </p>
        </div>
      </div>
    </div>

</template>

<script>
import serverIcon from '@/assets/img/server-icon.png';
import userIcon from '@/assets/img/operator-l.png';
import opaIcon from '@/assets/img/opa-icon.png';
import tokenIcon from '@/assets/img/create-l.png';
import packageIcon from '@/assets/img/package.png'
import {localeMessages} from '@/locale/i18n';

export default {
  name: 'App',
  data(){
    return {
       serverIcon,
       opaIcon,
       userIcon,
       packageIcon,
       tokenIcon, 
       locale: this.$cookie.get('locale') || 'cn',
       localeMessages: localeMessages,
       enableLogin: true,
       isAdmin: false,
       uid: '--',
       userOptOpen: false,
       enableLdap: false,
    }
  },
  methods:{
    clickTab(tabkey) {
      this.$router.replace(tabkey);
    },
    changeLocale(){
      this.$cookie.set('locale', this.locale, {expires: '1Y'});
      location.reload();
    },
    getLoginUid(){
      this.$ajax.getJSON('/server/api/getLoginUid').then((data) => {
        if(data && data.uid){
          this.uid = data.uid;
        }else{
          this.uid = '***';
        }
      }).catch((err) => {
          this.$tip.error(`${this.$t('login.getUidFailed')}: ${err.err_msg || err.message}`);
      });
    },
    checkEnableLogin(){
        this.$ajax.getJSON('/server/api/isEnableLogin').then((data) => {
            this.enableLogin = data.enableLogin || false;
        }).catch((err)=>{

        });
      },
    checkEnableLdap(){
        this.$ajax.getJSON('/server/api/isEnableLdap').then((data) => {
            this.enableLdap = data.enableLdap || false;
        }).catch((err)=>{

        });
    },
    async checkAdmin(){
        this.isAdmin = false; 
        return this.$ajax.getJSON('/server/api/isAdmin').then((data) => {
          this.isAdmin = data.admin;
          // alert(this.isAdmin);
        }).catch((err) => {
      });
    },   
  },
  async mounted(){
     this.getLoginUid();
     this.checkEnableLogin();
     await this.checkAdmin();
     this.checkEnableLdap();
  }
};
</script>

<style lang="postcss">
  /* @import '../../assets/css/variable.css'; */

  .app_index__header {
    height: 80px;
    border-bottom: 1px solid;

  .main-width {
    position: relative;
  }

  .tabs .let-tabs__header {
    border-bottom: none;
  }

  .logo-wrap, .user-wrap, .language-wrap {
    position: absolute;
    top: 0;
    height: 80px;
    width: 300px;
    padding: 26px;
  }

  .logo-wrap {
    left: 0;
    width: auto;
    z-index: 100;
    padding: 0px;

  a {
    display: inline-block;
    height: 80px;
    padding: 20px 20px 0;
    position: relative;
  &.active {
  &::after {
     content: "";
     display: inline-block;
     height: 3px;
     width: 100%;
     background: #457FF5;
     position: absolute;
     top: 76px;
     left: 0px;

     }
  }

  .logo {
    height: 31px;
  }

  }
  .logo {
    height: 28px;
  }

  }
  .language-wrap {
    right: 150px;
    width: 150px;
    padding-top: 20px;
  }

  .user-wrap {
    right: 0;
    width: 150px;
    text-align: right;

  .user-info {
    max-width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 28px;
    cursor: pointer;

  .avatar {
    height: 100%;
    border-radius: 50%;
  }

  .name {
    margin: 0 8px;
  }

  .let-icon-caret-down {
    position: relative;
    right: auto;
    top: auto;
    padding-left: 0;
    margin-top: 0;
  }

  }
  }

  .user-pop-wrap {
    position: absolute;
    right: 20px;
    top: 55px;
    border: 1px solid #d7dae0;
    border-radius: 4px;
    padding: 10px;
    background: #FFF;
    font-size: 12px;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .4s;
  }

  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
  }
  
</style>
