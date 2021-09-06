<!--服务管理-> 告警配置  -->
<template>
  <div style="margin:2px 2px">
    <table v-if="tableSHow" class="let-table let-table_stripe">
      <tbody>
      <tr>
        <td style="width:30%;"><a href="javascript:void(0)" @click="link('/user/person')">{{$t('alarmConfig.alarmcontact')}}</a></td>
        <td style="width:40%;"><a href="javascript:void(0)" @click="link(`/alarm/conf?app=${application}&server=${serverName}`)"> {{$t('alarmConfig.alarmUser')}} </a></td>
        <td style="width:30%;"><a href="javascript:void(0)" @click="link(`/alarm/shield?app=${application}&server=${serverName}`)">
          <font color="red"> {{$t('alarmConfig.shieldAlarm')}} </font></a>
        </td>
      </tr>
      </tbody>
    </table>
    <iframe v-bind:src="linkUrl" width="100%" height="100%" frameborder="0" scrolling="auto" v-if="urlShow"></iframe>
  </div>
</template>

<script>
  export default {
    name: "AlarmConfig",
    data() {
      return {
        application: "",
        serverName: "",
        alarmHost: "",
        linkUrl: "",
        tableSHow: true,
        urlShow: false
      }
    },
    computed: {},
    watch: {},
    mounted() {
      const {treeid} = this;
      this.application = treeid && treeid.split('.')[0] && treeid.split('.')[0].slice(1);
      const arr = treeid.split('.');
      this.serverName = treeid && arr[arr.length - 1] && arr[arr.length - 1].slice(1);
      this.$ajax.getJSON('/server/api/get_alarm_conf', {}).then((res) => {
        this.alarmHost = res;
      }).catch((err) => {
        this.$tip.error(`${this.$t('common.error')}: ${err.err_msg || err.message}`);
      });
    },
    props: ['treeid'],
    methods: {
      link(param) {
        this.urlShow = true;
        this.tableSHow = false;
        this.linkUrl = this.alarmHost + param
      }
    }
  }
</script>
<style>

</style>
