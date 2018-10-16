<template>
  <div class="page_server_business_monitor">
    <iframe :src="panshiDomain+'/cft_oss2/queryMonitView.do?module='+monitorName" frameborder="0" width="100%" height="1300px"></iframe>
  </div>
</template>

<script>



export default {
  name: 'ServerBisMonitor',
  data() {
    return {
      serverData : null,
      monitorName : '',
      panshiDomain : ''
    }
  },
  created() {
    this.serverData = this.$parent.getServerData();
    this.monitorName = this.serverData.server_name +'_sys';
    this.$parent.getPanshiUrl().then(data => {
      this.panshiDomain = data;
    })
  }
};
</script>

<style>
.page_server_business_monitor {
  padding-bottom: 20px;

}
</style>