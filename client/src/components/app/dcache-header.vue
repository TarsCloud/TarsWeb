<template>
  <div class="app_index__header">
    <div class="main-width">

      <h1 class="hidden">TARS</h1>

      <div class="logo-wrap">
        <a href="/"><img class="logo" src="/static/img/tars-logo.png"></a>
        <a class="active" href="/dcache.html"><img class="logo" alt="dcache" src="/static/img/dcache-logo.png"></a>
      </div>

      <let-tabs class="tabs" :center="true" @click="clickTab"
                :activekey="$route.matched[0]? $route.matched[0].path : '/server'">
        <let-tab-pane :tab="$t('header.tab.tab1')" tabkey="/server" :icon="serverIcon"></let-tab-pane>
        <let-tab-pane :tab="$t('header.dcache.tab2')" tabkey="/operation" :icon="opaIcon"></let-tab-pane>
        <let-tab-pane :tab="$t('header.tab.tab3')" tabkey="/releasePackage" :icon="releaseIcon"></let-tab-pane>
        <let-tab-pane :tab="$t('header.tab.tab4')" tabkey="/config" :icon="cacheIcon"></let-tab-pane>
        <let-tab-pane :tab="$t('header.tab.tab5')" tabkey="/operationManage" :icon="operatorIcon"></let-tab-pane>
      </let-tabs>
      <div class="language-wrap">
        <let-select v-model="locale" @change="changeLocale" :clearable="false">
          <template v-for="locale in localeMessages">
            <let-option :value="locale.localeCode">{{locale.localeName}}</let-option>
          </template>
        </let-select>
      </div>
      <div class="user-wrap">
        <p class="user-info" @click="userOptOpen = !userOptOpen">
          <span class="name toe">{{uid}} </span>
          <i class="let-icon let-icon-caret-down" :class="{up: userOptOpen}" v-show="enableLogin"></i>
          <transition name="fade">
            <div class="user-pop-wrap" v-show="enableLogin && userOptOpen">
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
  import releaseIcon from '@/assets/img/package-l.png';
  import cacheIcon from '@/assets/img/cache-l.png';
  import operatorIcon from '@/assets/img/operator-l.png';

  import {localeMessages} from '@/locale/i18n';

  export default {
    data() {
      return {
        // 图标
        serverIcon,
        opaIcon,
        releaseIcon,
        cacheIcon,
        operatorIcon,
        locale: this.$cookie.get('locale') || 'cn',
        uid: '--',
        userOptOpen: false,
        enableLogin: false,
        localeMessages: localeMessages
      };
    },
    methods: {
      clickTab(tabkey) {
        this.$router.replace(tabkey);
      },
      getLoginUid(){
        this.$ajax.getJSON('/server/api/get_login_uid').then((data) => {
          if (data && data.uid) {
            this.uid = data.uid;
          } else {
            this.uid = '***';
          }
        }).catch((err) => {
          this.$tip.error(`获取用户登录信息: ${err.err_msg || err.message}`);
        });
      },
      changeLocale(){
        this.$cookie.set('locale', this.locale, {expires: '1Y'});
        // this.$i18n.locale = this.locale;
        location.reload();
      },
      checkEnableLogin(){
        this.$ajax.getJSON('/server/api/is_enable_login').then((data) => {
          this.enableLogin = data.enableLogin || false;
        }).catch((err) => {

        });
      },
    },
    mounted() {
      this.getLoginUid();
      this.checkEnableLogin();
    }
  };
</script>

<style lang="postcss">
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

    .logo-wrap, .user-wrap, .language-wrap {
      position: absolute;
      top: 0;
      height: 80px;
      width: 300px;
      padding: 26px var(--gap-small);
    }

    .logo-wrap {
      left: 0;
      width: auto;
      z-index: 100;
      padding: 0px;

      a {
        display: inline-block;
        height: 80px;
        padding: 30px 20px 0;
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
          height: 25px;
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
