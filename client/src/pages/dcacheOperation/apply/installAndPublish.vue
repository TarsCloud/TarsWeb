<template>
  <section class="page_operation_install_and_publish">
    <let-form label-position="top" ref="detailForm">
      <let-form-group :title="$t('common.baseInfo')" inline label-position="top">
        <let-form-item :label="$t('apply.name')" itemWidth="240px" required>
          {{apply.name}}
        </let-form-item>
        <let-form-item :label="$t('common.admin')" itemWidth="240px" required>
          {{apply.admin}}
        </let-form-item>
        <let-form-item :label="$t('region.idcArea')" itemWidth="240px" required>
          {{apply.idc_area}}
        </let-form-item>
        <let-form-item :label="$t('region.setArea')" itemWidth="240px" required>
          {{apply.set_area.join(',')}}
        </let-form-item>
        <let-form-item :label="$t('common.createPerson')" itemWidth="240px" required>
          {{apply.create_person}}
        </let-form-item>
      </let-form-group>

      <let-form-group :title="$t('apply.RouterConfigInfo')" inline label-position="top">
        <let-form-item :label="$t('service.serverName')" itemWidth="240px" required>
          {{apply.Router.server_name}}
        </let-form-item>
        <let-form-item :label="$t('service.serverIp')" itemWidth="240px" required>
          {{apply.Router.server_ip}}
        </let-form-item>
        <let-form-item :label="$t('service.templateFile')" itemWidth="240px" required>
          {{apply.Router.template_file}}
        </let-form-item>
        <let-form-item :label="$t('service.routerDbName')" itemWidth="240px" required>
          {{apply.Router.router_db_name}}
        </let-form-item>
        <br>
        <let-form-item :label="$t('service.routerDbIp')" itemWidth="240px" required>
          {{apply.Router.router_db_ip}}
        </let-form-item>
        <let-form-item :label="$t('service.routerDbPort')" itemWidth="240px" required>
          {{apply.Router.router_db_port}}
        </let-form-item>
        <let-form-item :label="$t('service.routerDbUser')" itemWidth="240px" required>
          {{apply.Router.router_db_user}}
        </let-form-item>
        <let-form-item :label="$t('service.routerDbPass')" itemWidth="240px" required>
          {{apply.Router.router_db_pass}}
        </let-form-item>
      </let-form-group>

      <let-form-group :title="$t('apply.ProxyConfigInfo')" inline label-position="top">
        <let-table ref="table" :data="apply.Proxy" :empty-msg="$t('common.nodata')">
          <let-table-column :title="$t('service.serverName')" prop="server_name" width="25%">
            <template slot-scope="scope">
              {{scope.row.server_name}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('service.multipleIp')" prop="server_ip" width="25%">
            <template slot-scope="scope">
              {{scope.row.server_ip}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('region.idcArea')" prop="idc_area">
            <template slot-scope="scope">
              {{scope.row.idc_area}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('service.templateFile')" prop="template_file">
            <template slot-scope="scope">
              {{scope.row.template_file}}
            </template>
          </let-table-column>
        </let-table>
      </let-form-group>
      <let-button size="small" theme="primary" @click="installAndPublish">{{$t('apply.installAndPublish')}}
      </let-button>
    </let-form>
    <let-modal  :title="$t('publishLog.title')" v-model="showModal" width="800px" @on-confirm="confirmPublish">
      <let-table ref="ProgressTable" :data="items" :empty-msg="$t('common.nodata')" style="margin-top: 20px;">
        <let-table-column :title="$t('module.title')" prop="module" width="20%"></let-table-column>
        <let-table-column :title="$t('publishLog.releaseId')" prop="releaseId" width="20%"></let-table-column>
        <let-table-column :title="$t('publishLog.releaseProgress')" prop="percent"></let-table-column>
      </let-table>
    </let-modal>
  </section>
</template>

<script>
  const routerModel = () => {
    return {
      apply_id: 17,
      create_person: "adminUser",
      router_db_ip: "",
      router_db_name: "",
      router_db_pass: "",
      router_db_port: "",
      router_db_user: "",
      server_ip: "",
      server_name: "aswRouterServer",
      template_file: ""
    }
  };
  const proxyModel = () => {
    return {
      apply_id: 17,
      create_person: "adminUser",
      idc_area: "sz",
      server_ip: "",
      server_name: "aswRouterServer",
      template_file: "",
    }
  };
  export default {
    data () {
      let {applyId} = this.$route.params;
      return {
        applyId,
        showModal: false,
        items: [],
        apply: {
          set_area: [],
          Router: routerModel(),
          Proxy: [proxyModel()],
        }
      }
    },
    methods: {
      getApplyInfo () {
        let {applyId} = this;
        this.$ajax.getJSON('/server/api/get_apply_and_router_and_proxy', {applyId}).then((apply) => {
          this.apply = apply || {}
        }).catch((err) => {
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      },
      installAndPublish () {
        let {applyId} = this;
        this.$ajax.getJSON('/server/api/install_and_publish', {applyId}).then((data) => {
//          data = {proxy:{"releaseId":9,"errMsg":"sucess to release server"},
//          router:{"releaseId":9,"errMsg":"sucess to release server"}}
          let proxyReleaseId = data.proxy.releaseId;
          let routerReleaseId = data.router.releaseId;
//          this.$ajax.getJSON('/server/api/get_release_progress', {"proxyReleaseId": proxyReleaseId, "routerReleaseId": routerReleaseId}).then(data => {
//            this.showModal = true;
//            this.items = data.progress;
//          }).catch(err => {
//            this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
//          });
          this.getTaskRepeat({proxyReleaseId, routerReleaseId});
          //let interval = setInterval(getReleaseProgress, 1000);
          this.$tip.success(data.proxy.errMsg)
//          this.apply = apply || {}
        }).catch((err) => {
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      },
      getTaskRepeat({proxyReleaseId, routerReleaseId}) {
        let timerId;
        timerId && clearTimeout(timerId);
        this.showModal = true;
        const getTask = () => {
          this.$ajax.getJSON('/server/api/get_release_progress', {"proxyReleaseId": proxyReleaseId, "routerReleaseId": routerReleaseId}).then((data) => {
            data.progress.forEach((item) => {
              if (parseInt(item.percent, 10) === 100) {
                clearTimeout(timerId);
              } else {
                timerId = setTimeout(getTask, 3000);
              }
            });
            this.items = data.progress;
          }).catch((err) => {
            clearTimeout(timerId);
            this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
          });
        };
        getTask();
      },
      confirmPublish () {
        this.showModal = false;
        this.$router.push('/operation/module/createModule');
      }
    },
    created () {
      this.getApplyInfo()
    }
  }
</script>

<style>

</style>
