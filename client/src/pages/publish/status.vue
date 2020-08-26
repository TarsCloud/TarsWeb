<template>

<div>
     <!-- 发布结果弹出框 -->
     <let-modal
     v-model="finishModal.show"
     :title="$t('serverList.table.th.result')"
     width="880px"
     @on-cancel="onClose"
     @close="onClose"
     :footShow="false">
   <let-table
       v-if="finishModal.model"
       :title="$t('serverList.servant.taskID') + finishModal.model.task_no"
       :data="finishModal.model.items">
       <let-table-column :title="$t('serverList.table.th.ip')" prop="node_name"  width="200px"></let-table-column>
       <let-table-column :title="$t('common.status')" width="120px">
         <template slot-scope="scope">
           <let-tag
             :theme="scope.row.status == 2 ? 'success' : (scope.row.status == 3 ? 'danger' : '')" checked>
             {{statusConfig[scope.row.status] + (scope.row.status != 2 && scope.row.status != 3 ? scope.row.desc: '')}}
           </let-tag>
         </template>
       </let-table-column>
       <let-table-column :title="$t('serverList.table.th.result')"  prop="execute_info"> </let-table-column>
   </let-table>
 </let-modal>


</div>

</template>

<script>

export default {
  name: 'PublishStatus',

  data() {
    return {
      closeCallback: null,
      finishModal: {
        show: false,
        model: {
            task_no : '',
            items : []
        },
      },
      statusConfig: {
        0: this.$t('serverList.restart.notStart'),
        1: this.$t('serverList.restart.running'),
        2: this.$t('serverList.restart.success'),
        3: this.$t('serverList.restart.failed'),
        4: this.$t('serverList.restart.cancel'),
        5: this.$t('serverList.restart.parial'),
      },
      statusMap: {
        0: 'EM_T_NOT_START',
        1: 'EM_T_RUNNING',
        2: 'EM_T_SUCCESS',
        3: 'EM_T_FAILED',
        4: 'EM_T_CANCEL',
        5: 'EM_T_PARIAL',
      },
    }
  },
  methods: {
    onClose() {
      if(this.closeCallback) {
        this.closeCallback();
      }
    },
    savePublishServer(publishModal, callback, group_name, patch_id) {
      group_name = group_name || '';
      patch_id = patch_id || publishModal.model.patch_id.toString();
      this.closeCallback = callback;
      // 发布
      var items = [];
      publishModal.model.serverList.forEach((item) => {
          items.push({
            server_id: item.id.toString(),
            command: publishModal.command || 'patch_tars',
            parameters: {
              patch_id: patch_id,
              bak_flag: item.bak_flag || false,
              update_text: publishModal.model.update_text || '',
              group_name: group_name
            },
          });
        });
        const loading = this.$Loading.show();
        this.$ajax.postJSON('/server/api/add_task', {
          serial: true,
          items,
        }).then((data) => {
          loading.hide();
        //   this.closePublishModal();
          this.finishModal.model.task_no = data;
          this.finishModal.show = true;
          // 实时更新状态
          this.getTaskRepeat(data);
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
    },
    getTaskRepeat(taskId) {
      let timerId;
      timerId && clearTimeout(timerId);
      const getTask = () => {
        this.$ajax.getJSON('/server/api/task', {
          task_no: taskId,
        }).then((data) => {
          let done = true;
          data.items.forEach((item) => {
            if (![2, 3].includes(item.status)) {
              done = false;
            }

            if(item.percent) {
              item.desc = "(" + item.percent + "%)" 
            } else {
              item.desc = "...";
            }
          });
          done ? clearTimeout(timerId) : timerId = setTimeout(getTask, 2000);
          this.finishModal.model.items = data.items;
        }).catch((err) => {
          clearTimeout(timerId);
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      };
      getTask();
    },
  }
}

</script>