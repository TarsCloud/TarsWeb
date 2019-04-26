export  default {
  data () {
    return {
      servers: [],
      transferData: false,
      migrationMethods: [
        { value: true, text: this.$t('dcache.migrationMethod1') },
        { value: false, text: this.$t('dcache.migrationMethod2') }
      ]
    }
  },
  props: {
    expandServers: {
      required: true,
      type: Array
    }
  },
  computed: {
    appName () {
      return this.expandServers[0].app_name
    },
    moduleName () {
      return this.expandServers[0].module_name
    },
    cache_version () {
      return this.expandServers[0].cache_version
    },
    srcGroupName () {
      return this.expandServers[0].group_name
    },
    dstGroupName () {
      return this.servers[0].group_name
    }
  },
  methods: {
    getServers () {
      let servers = this.expandServers.map((item, index) => {
        let {group_name, server_name} = item;

        //  **********name1    => *******name2
        group_name = group_name.replace(/^(.*?)(\d+)$/, function () {
          return arguments[1] + (+arguments[2] + 1)
        });

        // **********name1-1   =>  8888888888name2-1
        server_name = server_name.replace(/^(.*?)(\d+)-\d+$/, function () {
          return arguments[1] + (+arguments[2] + 1) + '-' + (index + 1)
        });

        return Object.assign({}, item, {group_name, server_name, server_ip: '', shmKey: ''})
      });
      this.servers = servers;
    },
    mapServerType (key) {
      if (key === 0) return this.$t('module.mainServer');
      else if (key === 1) return this.$t('module.backServer');
      else return this.$t('module.mirror');
    },
  },
}
