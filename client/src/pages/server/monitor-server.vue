<template>
  <div class="page_server_server_monitor">
    <iframe :src="panshiDomain+'/jsp/biz/attrDataMonitChart.jsp?modulename='+monitorName+'&unit=m1'" frameborder="0" width="100%" height="1300px"></iframe>
  </div>
</template>

<script>



export default {
  name: 'ServerPropertyMonitor',
  data() {
    return {
      serverData : null,
      monitorName : '',
      panshiDomain : ''
    }
  },
  created() {
    this.serverData = this.$parent.getServerData();
    this.monitorName = this.serverData.server_name +'_ts';
    this.$parent.getPanshiUrl().then(data => {
      this.panshiDomain = data;
    })
  }
};
</script>

<style>
.page_server_server_monitor {
  padding-bottom: 20px;

}
</style>
