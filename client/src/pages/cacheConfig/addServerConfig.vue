<template>
  <section>
    <let-form
      ref="addConfigForm"
      type="medium"
      :title="$t('cache.config.addConfig')"
    >
      <let-form-item :label="$t('cache.config.item')" required>
        <let-select v-model="itemId" size="small" required>
          <let-option v-for="item in list" :value="item.id">{{item.path}}__{{item.item}}({{item.remark}})</let-option>
        </let-select>
      </let-form-item>
      <let-form-item :label="$t('cache.config.itemValue')" required>
        <let-input size="small" v-model="configValue" required></let-input>
      </let-form-item>
      <br>
      <let-form-item label=" ">
        <let-button theme="primary" @click="submit">{{$t('cache.add')}}</let-button>
      </let-form-item>
    </let-form>
  </section>
</template>

<script>
  export default {
      props: {
          serverName: {type: String, required: false},
          nodeName: {type: String, required: false},
          appName: {type: String, required: false},
          moduleName: {type: String, required: false},
      },
    data () {
      return {
        itemId: '',
        list: [],
        configValue: '',
      }
    },
    methods: {
      async submit () {
        if (this.$refs.addConfigForm.validate()) {
          try {
            let option = {
              itemId: this.itemId,
              configValue: this.configValue,
              serverName: this.serverName,
              nodeName: this.nodeName,
              appName: this.appName,
              moduleName: this.moduleName,
            };
            await this.$ajax.postJSON('/server/api/cache/addServerConfigItem', option);
            this.$tip.success(`${this.$t('cache.config.addSuccess')}`);
            this.configValue = null;
            this.$emit('call-back');
          } catch (err) {
            console.error(err)
            this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
          }
        }
      },
      async getConfig () {
        try {
          let configItemList = await this.$ajax.getJSON('/server/api/cache/getConfig');
          this.list = configItemList;
        } catch (err) {
          console.error(err)
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        }
      }
    },
    created() {
      this.getConfig()
    }
  }
</script>

<style>

</style>
