<template>
  <div class="page_server_property_monitor">
    <iframe :src="panshiDomain+'/open-page.html#/mon/curve/'+monitorName+':4'" frameborder="0" width="100%" height="1300px"></iframe>
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
    this.monitorName = this.serverData.server_name +'_tp';
    this.$parent.getPanshiUrl().then(data => {
      this.panshiDomain = data;
    })
  }
};
</script>

<style>
.page_server_property_monitor {
  padding-bottom: 20px;

}
</style>