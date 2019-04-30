<template>
  <section style="display: inline">
    <let-button theme="primary" :disabled="disabled" @click="init">{{$t('dcache.offline')}}</let-button>
    <let-modal
      v-model="show"
      :footShow="false"
      :closeOnClickBackdrop="true"
      :width="'1000px'"
      :title="$t('dcache.nonServerMigration')"
    >
      abc
    </let-modal>
  </section>
</template>
<script>
  export default {
    props: {
      disabled: Boolean,
      checkedServers: Array
    },
    data() {
      return {
        show: false,
      }
    },
    computed: {
      activeServers() {
        return this.checkedServers.filter(server => server.present_state === 'active' || server.setting_state === 'active')
      },
    },
    methods: {
      init() {
        const { activeServers, $t } = this;
        // 如果有没有下线的服务，不允许下线
        if (activeServers.length) return this.$tip.error($t('dcache.cantOffline'));
        this.show = true;
      },
    }
  }
</script>
<style>

</style>
