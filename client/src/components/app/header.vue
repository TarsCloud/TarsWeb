<template>
  <div class="app_index__header">
    <div class="main-width">

      <h1 class="hidden">TARS</h1>

      <div class="logo-wrap">
        <img class="logo" src="@/assets/img/logo.png">
      </div>

      <let-tabs class="tabs" :center="true" @click="clickTab" :activekey="$route.matched[0].path">
        <let-tab-pane :tab="$t('header.tab.tab1')" tabkey="/server" :icon="serverIcon"></let-tab-pane>
        <let-tab-pane :tab="$t('header.tab.tab2')" tabkey="/operation" :icon="opaIcon"></let-tab-pane>
      </let-tabs>

      <div class="language-wrap">
        <let-select v-model="locale" @change="changeLocale" :clearable="false">
          <let-option value="cn">中文</let-option>
          <let-option value="en">English</let-option>
        </let-select>
      </div>
      <div class="user-wrap">
        <p class="user-info" @click="userOptOpen = !userOptOpen">
          <!--<img class="avatar" src="http://e.hiphotos.baidu.com/baike/w%3D268/sign=de2ee49318d5ad6eaaf963ecb9ca39a3/79f0f736afc379310660597ee8c4b74543a91158.jpg">-->
          <span class="name toe">{{uid}} </span>
          <i class="let-icon let-icon-caret-down" :class="{up: userOptOpen}"></i>
          <transition name="fade">
            <div class="user-pop-wrap" v-show="userOptOpen">
              <a href="/logout">{{$t('header.logout')}}</a>
            </div>
          </transition>
        </p>
      </div>

    </div>
  </div>
</template>

<script>
import serverIcon from '@/assets/img/server-icon.png';
import opaIcon from '@/assets/img/opa-icon.png';

export default {
  data() {
    return {
      // 图标
      serverIcon,
      opaIcon,
      locale: this.$cookie.get('locale') || 'cn',
      uid: '--',
      userOptOpen: false,
    };
  },

  methods: {
    clickTab(tabkey) {
      this.$router.replace(tabkey);
    },
    getLoginUid(){
      this.$ajax.getJSON('/server/api/get_login_uid').then((data) => {
        if(data && data.uid){
          this.uid = data.uid;
        }else{
          this.uid = '***';
        }
      }).catch((err) => {
          this.$tip.error(`获取用户登录信息: ${err.err_msg || err.message}`);
      });
    },
    changeLocale(){
      this.$cookie.set('locale', this.locale, {expires: '1Y'});
      this.$i18n.locale = this.locale;
    },
  },
  mounted() {
    this.getLoginUid();
  }
};
</script>

<style>
@import '../../assets/css/variable.css';

.app_index__header {
  height: 80px;
  border-bottom: 1px solid var(--border-color);

  .main-width {
    position: relative;
  }

  .tabs .let-tabs__header {
    border-bottom: none;
  }
  .logo-wrap, .user-wrap ,.language-wrap {
    position: absolute;
    top: 0;
    height: 80px;
    width: 300px;
    padding: 26px var(--gap-small);
  }
  .logo-wrap {
    left: 0;

    .logo {
      height: 100%;
    }
  }
  .language-wrap{
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

  .user-pop-wrap{
    position: absolute;
    right: 20px;
    top: 55px;
    border: 1px solid #d7dae0;
    border-radius: 4px;
    padding: 10px;
    background:#FFF;
    font-size: 12px;
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .4s;
  }
  .fade-enter, .fade-leave-to{
    opacity: 0;
  }
}
</style>
