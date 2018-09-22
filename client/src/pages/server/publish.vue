<template>
  <div class="page_server_publish">
    <iframe :src="panshiDomain+'/open-page.html#/op/task_list'" frameborder="0" width="100%" height="1200px"></iframe>
  </div>
</template>

<script>

export default {
  name: 'ServerPublish',
  data() {
    return {
      serverData : null,
      monitorName : '',
      panshiDomain : ''
    }
  },
  created() {
    this.serverData = this.$parent.getServerData();
    this.$parent.getPanshiUrl().then(data => {
      this.panshiDomain = data;
    })
  }
};
</script>

<style>

.page_server_publish {

}
</style>
