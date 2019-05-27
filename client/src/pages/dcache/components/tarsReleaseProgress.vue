<template>
  <div class="progressTable">
    <let-table ref="ProgressTable" :data="items" :empty-msg="$t('common.nodata')">
      <let-table-column :title="$t('service.serverName')" prop="server_name" width="30%"></let-table-column>
      <let-table-column :title="$t('service.serverIp')" prop="node_name" width="30%"></let-table-column>
      <let-table-column :title="$t('common.status')">
        <template slot-scope="scope">
          <let-tag
            :theme="scope.row.status == 2 ? 'success' : (scope.row.status == 3 ? 'danger' : '')" checked>
            {{statusConfig[scope.row.status] + (scope.row.status != 2 && scope.row.status != 3 ? '...' : '')}}
          </let-tag>
        </template>
      </let-table-column>
    </let-table>
    <p ref="progressTip">{{$t(success ? 'dcache.executeSuccess' : 'dcache.execute') }}</p>
  </div>
</template>

<script>
  import { getTarsReleaseProgress } from '@/dcache/interface.js'
  export default {
    props: {
      releaseId: {
        type: [Number, String],
        required: true
      }
    },
    data () {
      return {
        items: [],
        timer: '',
        progressTip: '',
        success: false,
        statusConfig: {
          0: this.$t('serverList.restart.notStart'),
          1: this.$t('serverList.restart.running'),
          2: this.$t('serverList.restart.success'),
          3: this.$t('serverList.restart.failed'),
          4: this.$t('serverList.restart.cancel'),
          5: this.$t('serverList.restart.parial'),
        },
      }
    },
    methods: {
    	async getProgress () {
        try {
          let { items, serial, status, task_no } = await getTarsReleaseProgress({releaseId: this.releaseId});
          this.items = items;
          let done = true;
          items.forEach(item => ![2, 3].includes(item.status) ? done = false : '');
          if (done) {
            if (this.timer) window.clearTimeout(this.timer);
            this.success = true;
            this.$emit('done-fn');
          } else {
            this.timer = window.setTimeout(this.getProgress, 1000)

          }
        } catch (err) {
          this.success = true;
          console.error(err);
          this.$tip.error(err.message)
        }
      },


    },
    created () {
    	this.getProgress();
    },
    destroyed () {
    	if (this.timer) window.clearTimeout(this.timer);
      this.$emit('close-fn');
    }
  }
</script>

<style scoped>
.progressTable {
  margin-top: 20px;
}
</style>
