<template>
  <div class="page_operation_bwlist">
    <div class="between">
      <let-form
        ref="detailForm"
        inline
        itemWidth="200px"
        @submit.native.prevent="addItem"
      >
        <let-form-item label="IP" required>
          <let-input
            size="small"
            v-model="form.f_ip"
            :placeholder="$t('gateway.bwlist.ipTip')"
            required
            :required-tip="$t('gateway.bwlist.ipTip')"
            pattern="^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[1-9]|\*)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d|\*)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d|\*)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d|\*)$"
            :pattern-tip="$t('gateway.bwlist.ipTip')"
          ></let-input>
        </let-form-item>
        <let-form-item>
          <let-button size="small" type="submit" theme="primary">{{
            $t("operate.add")
          }}</let-button>
        </let-form-item>
        <let-form-item></let-form-item>
      </let-form>
      <div>
        <let-button size="small" theme="primary" @click="loadAll">{{
          $t("gateway.btn.loadAll")
        }}</let-button>
      </div>
    </div>
    <let-table ref="table" :data="items" :empty-msg="$t('common.nodata')">
      <let-table-column title="IP" prop="f_ip" width="300px"></let-table-column>
      <let-table-column
        :title="$t('cfg.btn.lastUpdate')"
        prop="f_update_time"
      ></let-table-column>
      <let-table-column :title="$t('operate.operates')" width="80px">
        <template slot-scope="scope">
          <let-table-operation @click="removeItem(scope.row)">{{
            $t("operate.delete")
          }}</let-table-operation>
        </template>
      </let-table-column>
    </let-table>
  </div>
</template>
<script>
export default {
  name: "BwList",
  props: {
    station: {
      type: Object,
      required: true,
    },
    //type: black / white
    type: {
      type: String,
      required: true,
    },
    gatewayObj: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      items: [],
      form: { f_ip: "" },
    };
  },
  methods: {
    fetchData() {
      return this.$ajax
        .getJSON("/server/api/bwlist", {
          f_station_id: this.station.f_station_id,
          type: this.type,
          gatewayObj: this.gatewayObj,
        })
        .then((data) => {
          this.items = data;
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    loadAll() {
      const loading = this.$Loading.show();
      this.$ajax
        .postJSON("/server/api/loadAll_conf", {
          gatewayObj: this.gatewayObj,
          command: "loadAll",
        })
        .then((res) => {
          loading.hide();
          const msg = res[0].err_msg.replace(/\n/g, "<br>");
          if (res[0].ret_code === 0) {
            const opt = {
              title: this.$t("common.success"),
              message: msg,
            };
            opt.duration = 0;
            this.$tip.success(opt);
          } else {
            throw new Error(msg);
          }
        })
        .catch((err) => {
          loading.hide();
          this.$tip.error(
            `${this.$t("common.error")}: ${err.message || err.err_msg}`
          );
        });
    },
    addItem() {
      if (this.$refs.detailForm.validate()) {
        const model = this.form;
        model.f_station_id = this.station.f_station_id;
        model.type = this.type;

        const url = "/server/api/add_bwlist";
        const loading = this.$Loading.show();
        model.gatewayObj = this.gatewayObj;
        this.$ajax
          .postJSON(url, model)
          .then(() => {
            loading.hide();

            this.$tip.success(this.$t("common.success"));
            this.form.f_ip = "";
            this.fetchData();
          })
          .catch((err) => {
            loading.hide();
            this.$tip.error(
              `${this.$t("common.error")}: ${err.message || err.err_msg}`
            );
          });
      }
    },
    removeItem(d) {
      this.$confirm(
        this.$t("gateway.delete.bwListConfirmTips"),
        this.$t("common.alert")
      )
        .then(() => {
          const loading = this.$Loading.show();
          this.$ajax
            .postJSON("/server/api/delete_bwlist", {
              f_id: d.f_id,
              type: this.type,
              gatewayObj: this.gatewayObj,
            })
            .then(() => {
              loading.hide();
              this.fetchData().then(() => {
                this.$tip.success(this.$t("common.success"));
              });
            })
            .catch((err) => {
              loading.hide();
              this.$tip.error(
                `${this.$t("common.error")}: ${err.message || err.err_msg}`
              );
            });
        })
        .catch(() => {});
    },
  },
  watch: {
    station() {
      this.items = [];
      this.fetchData();
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>
<style scoped lang="postcss">
.page_operation_bwlist {
  pre {
    color: #909fa3;
    margin-top: 32px;
  }

  .let_modal__body {
    overflow-y: visible;
  }
}
.between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
