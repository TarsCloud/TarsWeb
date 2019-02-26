<template>
  <section class="page_operation_create_service">
    <let-form label-position="top" ref="detailForm">
      <let-form-group :title="$t('apply.RouterConfigInfo')" inline label-position="top">
        <let-form-item :label="$t('service.serverName')" itemWidth="240px" required>
          <let-input
            size="small"
            v-model="apply.Router.server_name"
            required
            :required-tip="$t('deployService.table.tips.empty')"
          >
          </let-input>
        </let-form-item>
        <let-form-item :label="$t('service.serverIp')" itemWidth="240px" required>
          <let-input
            size="small"
            v-model="apply.Router.server_ip"
            required
            :required-tip="$t('deployService.table.tips.empty')"
          >
          </let-input>
        </let-form-item>
        <let-form-item :label="$t('deployService.form.template')" itemWidth="240px" required>
          <let-select
            size="small"
            v-model="apply.Router.template_file"
            required
            :required-tip="$t('deployService.form.templateTips')"
          >
            <let-option v-for="d in templates" :key="d" :value="d">{{d}}</let-option>
          </let-select>
        </let-form-item>
        <br>
        <span style="margin-left:20px;">{{$t('service.routerDbNameTip')}}</span>
        <br>
        <let-form-item :label="$t('service.routerDbName')" itemWidth="240px" required>
          <let-input
            size="small"
            v-model="apply.Router.router_db_name"
            required
            :required-tip="$t('deployService.table.tips.empty')"
          >
          </let-input>
        </let-form-item>
        <let-form-item :label="$t('service.routerDbIp')" itemWidth="240px" required>
          <let-input
            size="small"
            v-model="apply.Router.router_db_ip"
            required
            :required-tip="$t('deployService.table.tips.empty')"
          >
          </let-input>
        </let-form-item>
        <let-form-item :label="$t('service.routerDbPort')" itemWidth="240px" required>
          <let-input
            size="small"
            v-model="apply.Router.router_db_port"
            required
            :required-tip="$t('deployService.table.tips.empty')"
          >
          </let-input>
        </let-form-item>
        <let-form-item :label="$t('service.routerDbUser')" itemWidth="240px" required>
          <let-input
            size="small"
            v-model="apply.Router.router_db_user"
            required
            :required-tip="$t('deployService.table.tips.empty')"
          >
          </let-input>
        </let-form-item>
        <let-form-item :label="$t('service.routerDbPass')" itemWidth="240px" required>
          <let-input
            size="small"
            v-model="apply.Router.router_db_pass"
            required
            :required-tip="$t('deployService.table.tips.empty')"
          >
          </let-input>
        </let-form-item>

      </let-form-group>
      <let-form-group :title="$t('apply.ProxyConfigInfo')" inline label-position="top">
        <let-table ref="table" :data="apply.Proxy" :empty-msg="$t('common.nodata')">
          <let-table-column :title="$t('service.serverName')" prop="server_name" width="25%">
            <template slot-scope="scope">
              <let-input
                size="small"
                v-model="scope.row.server_name"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              >
              </let-input>
            </template>
          </let-table-column>
          <let-table-column :title="$t('service.multipleIp')" prop="server_ip" width="25%">
            <template slot-scope="scope">
              <let-input
                size="small"
                v-model="scope.row.server_ip"
                required
                :required-tip="$t('deployService.table.tips.empty')"
              >
              </let-input>
            </template>
          </let-table-column>
          <let-table-column :title="$t('region.idcArea')" prop="idc_area">
            <template slot-scope="scope">
              {{scope.row.idc_area}}
            </template>
          </let-table-column>
          <let-table-column :title="$t('deployService.form.template')" prop="template_file">
            <template slot-scope="scope">
              <let-select
                size="small"
                v-model="scope.row.template_file"
                required
                :required-tip="$t('deployService.form.templateTips')"
              >
                <let-option v-for="d in templates" :key="d" :value="d">{{d}}</let-option>
              </let-select>
            </template>
          </let-table-column>
        </let-table>
      </let-form-group>
      <let-button size="small" theme="primary" @click="createService">{{$t('apply.createRouterProxyService')}}
      </let-button>
    </let-form>
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
        templates: [],
        applyId,
        apply: {
          Router: routerModel(),
          Proxy: [proxyModel()],
        }
      }
    },
    methods: {
      templateNameList () {
        return this.$ajax.getJSON('/server/api/template_name_list').then((data) => {
          this.templates = data;
          this.apply.Router.template_file = data[0];
          this.apply.Proxy.forEach(item => item.template_file = data[0]);
        }).catch((err) => {
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      },
      getApplyInfo () {
        let {applyId} = this;
        return this.$ajax.getJSON('/server/api/get_apply_and_router_and_proxy', {applyId}).then((apply) => {
          this.apply = apply || {}
        }).catch((err) => {
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      },
      createService () {
        if (this.$refs.detailForm.validate()) {
          const model = this.apply;
          const url = '/server/api/save_router_proxy';
          const loading = this.$Loading.show();
          this.$ajax.postJSON(url, model).then((data) => {
            loading.hide();
            let {applyId} = this;
            this.$router.push('/operation/apply/installAndPublish/' + applyId);
          }).catch((err) => {
            loading.hide();
            this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
          });
        }
      }
    },
    async created () {
      await this.getApplyInfo();
      await this.templateNameList();
    }
  }
</script>

<style>
  .let-form-cols-1 .let-form-item__label {
    width: 140px;
  }
</style>
