<template>
  <div id="app">
    <app-header></app-header>

    <!-- 切换 tab 缓存接口（主要为左侧目录树） -->
    <keep-alive>
      <router-view class="main-width"></router-view>
    </keep-alive>

    <!-- <app-footer class="app_index__footer"></app-footer> -->
  </div>
</template>

<script>
  import AppHeader from '../../components/app/sso-header';
  import AppFooter from '../../components/app/footer';

  export default {
    name: 'App',
    components: {
      AppHeader,
      AppFooter,
    },
  };
</script>

<style lang="postcss">
  @import '../../assets/font/lato/Lato.css';
  @import '../../assets/css/reset.css';
  @import '../../assets/css/variable.css';

  .clearfix {
    *zoom: 1;

  &
  :after,

  &
  :before {
    display: table;
    content: ' ';
  }

  &
  :after {
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
    display: flex;
    flex: 1;
    flex-flow: column;
    margin: 0 auto;
    /* max-width: var(--main-width); */
    padding: 0 var(--gap-small);
    width:100%;
  }

  #app {
    display: flex;
    flex-flow: column;
    overflow: hidden;
    position: relative;
    height: 100%;
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
</style>
