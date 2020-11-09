<template>
  <section style="display: inline" class="batch-publish">
    <let-button :size="size" theme="primary" :disabled="disabled" @click="init">{{$t(`dcache.batch.${type}`)}}</let-button>
    <let-modal
      v-model="show"
      @on-confirm="confirm"
      :closeOnClickBackdrop="true"
      :width="'1000px'"
      :title="$t(`dcache.batch.${type}`)"
    >
      <let-form>
        <let-form-item :label="$t('service.serverName')">
          <p v-for="server in checkedServers">{{ server.application + "." + server.server_name + "_" + server.node_name }}</p>
        </let-form-item>
      </let-form>
    </let-modal>
    <let-modal
      v-model="releaseIng"
      :footShow="false"
      :closeOnClickBackdrop="true"
      :width="'1000px'"
      :title="$t(`dcache.batch.${type}`)"
    >
      <tars-release-progress v-if="!!releaseId && releaseIng" :release-id="releaseId" @close-fn="this.getServerList"></tars-release-progress>
    </let-modal>
  </section>
</template>
<script>
  import { addTask } from '@/dcache/interface.js'
  import tarsReleaseProgress from './../components/tarsReleaseProgress.vue'
  import Mixin from './mixin.js'

  export default {
    components: { tarsReleaseProgress },
    mixins: [Mixin],
    props: {
      size: String,
      disabled: Boolean,
      expandServers: {
        required: false,
        type: Array
      },
      checkedServers: {
        required: false,
        type: Array
      },
      type: String
    },
    data() {
      return {
        versionList: [],
        releaseId: null,
        show: false,
        publishModal: {
          moduleName: 'DCacheServerGroup',
          application: 'DCache',
          totalPatchPage: 0,
          pageSize: 5,
          currPage: 1,
        },
        releaseIng: false,
      }
    },
    methods: {
      init() {
        this.show = true;
        this.releaseId = null;
        this.releaseIng = false;
      },
      async confirm() {
        const items = [];
        const { checkedServers } = this;
        checkedServers.forEach((item) => {
          items.push({
            server_id: item.id.toString(),
            command: this.type
          });
        });

        try {
          const releaseId = await addTask({ items });
          this.releaseIng = true;
          this.releaseId = releaseId;
        }
        catch(err){
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);        
        }
      },
      getServerList () {
        this.show = false;
        this.$emit('success-fn');
      }
    }
  }
</script>
<style lang="postcss">

</style>
