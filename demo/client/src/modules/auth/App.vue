<template>
  <div id="app">
    <div class="main-width" style="margin-top:20px;height:60px;">
        <div style="float:right;width: 400px;position:relative;clear:both;">
          <div class="language-wrap">
                 <locale-select></locale-select>
          </div>
          <div class="user-wrap">
            <p class="user-info" @click="userOptOpen = !userOptOpen">
              <span class="name toe">{{uid}} </span>
              <i class="let-icon let-icon-caret-down" :class="{up: userOptOpen}" v-show="enableLogin"></i>
              <transition name="fade">
                <div class="user-pop-wrap" v-show="enableLogin && userOptOpen">
                  <a href="/logout">{{$t('login.logout')}}</a>
                </div>
              </transition>
            </p>
          </div>
      </div>
    </div>

    <keep-alive>
      <router-view class="main-width"></router-view>
    </keep-alive>
    <app-footer class="app_index__footer"></app-footer>
  </div>
</template>

<script>
import localeSelect from '../../components/locale-select.vue';
import AppFooter from '../../components/app/footer';

export default {
  name: 'App',
  data(){
    return {
       enableLogin: true,
       uid: '--',
       userOptOpen: false,
    }
  },
  methods:{
      getLoginUid(){
        this.$ajax.getJSON('/api/getLoginUid').then((data) => {
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
          this.$ajax.getJSON('/api/isEnableLogin').then((data) => {
              this.enableLogin = data.enableLogin || false;
          }).catch((err)=>{

          });
        },
  },
  components: {
    AppFooter,
    localeSelect,
  },
  mounted(){
     this.getLoginUid();
     this.checkEnableLogin();
  }
};
</script>

<style>
@import "../../assets/font/lato/Lato.css";
@import '../../assets/css/reset.css';
@import '../../assets/css/variable.css';

.clearfix {
  *zoom: 1;

  &:after, &:before {
    display: table;
    content: ' ';
  }

  &:after {
    clear: both;
  }
}
.toe {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-all;
}
.disabled {
  opacity: 0.65;
  pointer-events: none;
}
.hidden {
  display: none;
}

.main-width {
  margin: 0 auto;
  max-width: var(--main-width);
  padding: 0 var(--gap-small);
}

#app {
  position: relative;
  padding-bottom: 48px;
  min-height: 100%;
  font-size: 14px;
}
.app_index__footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}

/* 调换弹窗确定取消左右顺序 */
.let-dialog .let-dialog__foot .let-align__inner {
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;

  .let-button:first-child {
    margin-right: 0;
    margin-left: 16px;
  }
}
.user-wrap ,.language-wrap {
    position: absolute;
    top: 0;
    height: 80px;
    width: 300px;
  }
.language-wrap{
    right: 150px;
    width: 150px;
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
    right: 0px;
    top: 30px;
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

</style>
