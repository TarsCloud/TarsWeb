<template>
  <div class="page_server_manage">
    <!-- 服务列表 -->
    <div class="table_head">
      <h4>
        {{ this.$t("serverList.title.serverList") }}

        <i
          class="el-icon-refresh-right"
          @click="getServerList(serverPageNum)"
        ></i>
      </h4>
    </div>

    <let-table
      class="dcache"
      v-if="serverList"
      :data="serverList"
      :empty-msg="$t('common.nodata')"
      stripe
      ref="serverListLoading"
    >
      <let-table-column>
        <template slot="head" slot-scope="props">
          <let-checkbox
            v-model="isCheckedAll"
            :value="isCheckedAll"
          ></let-checkbox>
        </template>
        <template slot-scope="scope">
          <let-checkbox
            v-model="scope.row.isChecked"
            :value="scope.row.id"
          ></let-checkbox>
        </template>
      </let-table-column>
      <let-table-column
        :title="$t('serverList.table.th.service')"
        prop="server_name"
      >
        <template slot-scope="scope">
          <a
            :href="
              '/static/logview/logview.html?app=' +
                [scope.row.application] +
                '&server_name=' +
                [scope.row.server_name] +
                '&node_name=' +
                [scope.row.node_name]
            "
            :title="$t('serverList.link.remoteLog')"
            target="_blank"
            class="buttonText"
          >
            {{ scope.row.server_name }}
          </a>
          <el-tooltip
            class="item"
            effect="dark"
            v-if="scope.row.source['tars.io/CloudInstall']"
            :content="
              scope.row.source['tars.io/CloudInstall'].group +
                '/' +
                scope.row.source['tars.io/CloudInstall'].name +
                ':' +
                scope.row.source['tars.io/CloudInstall'].version
            "
            placement="top-start"
          >
            <i
              class="el-icon-cloudy"
              style="cursor:pointer"
              @click="goMarket(scope.row)"
            ></i>
          </el-tooltip>
        </template>
      </let-table-column>
      <let-table-column
        :title="$t('serverList.table.th.ip')"
        prop="node_name"
        width="200px"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.is_node_ok">
            <a
              :href="
                '/static/logview/logview.html?app=' +
                  [scope.row.application] +
                  '&server_name=' +
                  [scope.row.server_name] +
                  '&node_name=' +
                  [scope.row.node_name]
              "
              :title="$t('serverList.link.nodeLog')"
              target="_blank"
              class="buttonText"
            >
              {{ scope.row.node_name }}
            </a>
          </span>
          <span v-else style="color: #FF0000">
            {{ scope.row.node_name }}{{ $t("serverList.link.invalidNode") }}
          </span>
        </template>
      </let-table-column>
      <let-table-column :title="$t('serverList.table.th.enableSet')">
        <template slot-scope="scope">
          <span v-if="!scope.row.enable_set">{{ $t("common.disable") }}</span>
          <p v-else style="max-width: 200px">
            {{ $t("common.set.setName") }}：{{ scope.row.set_name }}<br />
            {{ $t("common.set.setArea") }}：{{ scope.row.set_area }}<br />
            {{ $t("common.set.setGroup") }}：{{ scope.row.set_group }}
          </p>
        </template>
      </let-table-column>
      <let-table-column
        :title="$t('serverList.table.th.configStatus')"
        width="90px"
      >
        <template slot-scope="scope">
          <span
            v-if="scope.row.setting_state === 'Inactive'"
            style="color: #FF0000"
            >{{ scope.row.setting_state }}</span
          >
          <span v-else style="color: #49CC8F">{{
            scope.row.setting_state
          }}</span>
        </template>
      </let-table-column>
      <let-table-column
        :title="$t('serverList.table.th.currStatus')"
        width="90px"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.query_ret_code != '0'" style="color: #FF0000"
            >Inactive</span
          >
          <span
            v-else-if="scope.row.present_state_in_node === 'Active'"
            style="color: #49CC8F"
            >{{ scope.row.present_state_in_node }}</span
          >
          <span v-else style="color: #FF0000">{{
            scope.row.present_state_in_node
          }}</span>
        </template>
      </let-table-column>

      <let-table-column
        :title="$t('serverList.table.th.flowStatus')"
        width="90px"
      >
        <template slot-scope="scope">
          <span
            :class="
              scope.row.flow_state === 'inactive'
                ? 'status-off'
                : 'status-flowactive'
            "
          ></span>
        </template>
      </let-table-column>

      <let-table-column :title="$t('serverList.table.th.processID')">
        <template slot-scope="scope">
          {{ scope.row.process_id }}
          <el-tooltip
            class="item"
            effect="dark"
            content="Run In Container"
            v-if="scope.row.run_type == 'container'"
            placement="top-start"
          >
            <i class="el-icon-files"></i>
          </el-tooltip>
        </template>
      </let-table-column>

      <let-table-column
        :title="$t('serverList.table.th.version')"
        prop="patch_version"
      ></let-table-column>
      <let-table-column
        :title="$t('serverList.table.th.operator')"
        prop="patch_user"
      ></let-table-column>
      <let-table-column :title="$t('serverList.table.th.time')">
        <template slot-scope="scope">
          <span style="word-break: break-word">{{
            handleNoPublishedTime(scope.row.patch_time)
          }}</span>
        </template>
      </let-table-column>
      <let-table-column :title="$t('operate.operates')" width="300px">
        <template slot-scope="scope">
          <let-table-operation @click="configServer(scope.row.id)">{{
            $t("operate.update")
          }}</let-table-operation>
          <let-table-operation @click="restartServer(scope.row.id)">{{
            $t("operate.restart")
          }}</let-table-operation>
          <let-table-operation
            class="danger"
            @click="stopServer(scope.row.id)"
            >{{ $t("operate.stop") }}</let-table-operation
          >
          <let-table-operation
            v-if="scope.row.flow_state === 'active'"
            @click="updateFlowStatus(scope.row.id, false, scope.row.node_name)"
            >{{ $t("operate.pause") }}</let-table-operation
          >
          <let-table-operation
            v-if="scope.row.flow_state === 'inactive'"
            @click="updateFlowStatus(scope.row.id, true, scope.row.node_name)"
            >{{ $t("operate.resume") }}</let-table-operation
          >
          <let-table-operation @click="manageServant(scope.row)">{{
            $t("operate.servant")
          }}</let-table-operation>
          <let-table-operation @click="showStatusModal(scope.row)">{{
            $t("operate.statusView")
          }}</let-table-operation>
          <let-table-operation @click="showTemplateView(scope.row)">{{
            $t("operate.templateView")
          }}</let-table-operation>
          <let-table-operation @click="showMoreCmd(scope.row)">{{
            $t("operate.more")
          }}</let-table-operation>
        </template>
      </let-table-column>
      <template slot="operations">
        <let-button
          theme="primary"
          size="small"
          :disabled="!hasCheckedServer"
          @click="batchshowStatusModal"
          >{{ $t("operate.statusView") }}</let-button
        >
        <let-button
          theme="primary"
          size="small"
          :disabled="!hasCheckedServer"
          @click="batchShowMoreCmd"
          >{{ $t("operate.more") }}</let-button
        >
        <let-button
          theme="primary"
          size="small"
          :disabled="!hasCheckedServer"
          @click="batchConfigServer"
          >{{ $t("dcache.batch.edit") }}</let-button
        >
        <batch-operation
          size="small"
          :disabled="!hasCheckedServer"
          :checked-servers="checkedServers"
          @success-fn="getServerList"
          type="restart"
        ></batch-operation>
        <batch-operation
          size="small"
          :disabled="!hasCheckedServer"
          :checked-servers="checkedServers"
          @success-fn="getServerList"
          type="stop"
        ></batch-operation>
      </template>
    </let-table>
    <let-pagination
      v-if="!(serverNotifyList && showOthers)"
      :page="serverPageNum"
      @change="gotoServerPage"
      style="margin-bottom: 32px;"
      :total="serverTotal"
    >
    </let-pagination>

    <!-- 服务实时状态 -->
    <div class="table_head">
      <h4 v-if="serverNotifyList && showOthers">
        {{ this.$t("serverList.title.serverStatus") }}
        <i class="el-icon-refresh-right" @click="getServerNotifyList()"
          >&#xec08;</i
        >
      </h4>
    </div>
    <let-table
      v-if="serverNotifyList && showOthers"
      :data="serverNotifyList"
      stripe
      :empty-msg="$t('common.nodata')"
      ref="serverNotifyListLoading"
    >
      <let-table-column
        width="20%"
        :title="$t('common.time')"
        prop="notifytime"
      ></let-table-column>
      <let-table-column
        width="20%"
        :title="$t('serverList.table.th.serviceID')"
        prop="server_id"
      ></let-table-column>
      <let-table-column
        width="15%"
        :title="$t('serverList.table.th.threadID')"
        prop="thread_id"
      ></let-table-column>
      <let-table-column :title="$t('serverList.table.th.result')">
        <template slot-scope="scope">
          <span :style="statusStyle(scope.row.result)">{{
            scope.row.result
          }}</span>
        </template>
      </let-table-column>
    </let-table>
    <let-pagination
      v-if="serverNotifyList && showOthers"
      :page="pageNum"
      @change="gotoPage"
      style="margin-bottom: 32px;"
      :total="total"
    >
    </let-pagination>

    <!-- 编辑服务弹窗 -->
    <let-modal
      v-model="configModal.show"
      :title="$t('serverList.dlg.title.editService')"
      width="60%"
      :footShow="!!(configModal.model && configModal.model.server_name)"
      @on-confirm="saveConfig(batchEditConf.show)"
      @close="closeConfigModal"
      @on-cancel="closeConfigModal"
    >
      <let-form
        v-if="!!(configModal.model && configModal.model.server_name)"
        ref="configForm"
        itemWidth="50%"
        :columns="2"
        class="two-columns"
      >
        <let-form-item
          :label="$t('common.service')"
          v-if="batchEditConf.show"
          >{{ configModal.model.server_name }}</let-form-item
        >
        <let-form-item :label="$t('common.ip')" v-if="batchEditConf.show">{{
          configModal.model.node_name
        }}</let-form-item>

        <let-form-item :label="$t('serverList.dlg.useIdc')" required>
          <let-checkbox
            v-model="batchEditConf.itemEnable.enable_group"
            v-show="!batchEditConf.show"
            class="form_item_disabled"
          />
          <let-radio-group
            size="small"
            v-model="configModal.model.enable_group"
            v-bind:disabled="!batchEditConf.itemEnable.enable_group"
            :data="[
              { value: true, text: $t('common.yes') },
              { value: false, text: $t('common.no') },
            ]"
          >
          </let-radio-group>
        </let-form-item>

        <let-form-item :label="$t('serverList.dlg.groupName')">
          <let-checkbox
            v-model="batchEditConf.itemEnable.enable_group"
            v-show="!batchEditConf.show"
            class="form_item_disabled"
          />
          <let-select
            class="form_item_style"
            size="small"
            v-model="configModal.model.ip_group_name"
            v-bind:disabled="!configModal.model.enable_group"
          >
            <let-option
              v-for="t in configModal.model.groupList"
              :key="t.value"
              :value="t.key"
              >{{ t.value }}</let-option
            >
          </let-select>
        </let-form-item>

        <let-form-item :label="$t('serverList.dlg.isBackup')" required>
          <let-checkbox
            v-model="batchEditConf.itemEnable.bak_flag"
            v-show="!batchEditConf.show"
            class="form_item_disabled"
          />
          <let-radio-group
            size="small"
            class="form_item_style"
            v-bind:disabled="!batchEditConf.itemEnable.bak_flag"
            v-model="configModal.model.bak_flag"
            :data="[
              { value: true, text: $t('common.yes') },
              { value: false, text: $t('common.no') },
            ]"
          >
          </let-radio-group>
        </let-form-item>

        <let-form-item :label="$t('common.template')" required>
          <let-checkbox
            v-model="batchEditConf.itemEnable.template_name"
            v-show="!batchEditConf.show"
            class="form_item_disabled"
          />
          <let-select
            size="small"
            class="form_item_style"
            v-bind:disabled="!batchEditConf.itemEnable.template_name"
            v-model="configModal.model.template_name"
            v-if="
              configModal.model.templates && configModal.model.templates.length
            "
            required
          >
            <let-option
              v-for="t in configModal.model.templates"
              :key="t"
              :value="t"
              >{{ t }}</let-option
            >
          </let-select>
          <span v-else>{{ configModal.model.template_name }}</span>
        </let-form-item>

        <let-form-item :label="$t('serverList.dlg.serviceType')" required>
          <let-checkbox
            v-model="batchEditConf.itemEnable.server_type"
            v-show="!batchEditConf.show"
            class="form_item_disabled"
          />
          <let-select
            size="small"
            class="form_item_style"
            v-bind:disabled="!batchEditConf.itemEnable.server_type"
            v-model="configModal.model.server_type"
            required
          >
            <let-option v-for="t in serverTypes" :key="t" :value="t">{{
              t
            }}</let-option>
          </let-select>
        </let-form-item>

        <let-form-item :label="$t('serverList.table.th.enableSet')" required>
          <let-checkbox
            v-model="batchEditConf.itemEnable.enable_set"
            v-show="!batchEditConf.show"
            class="form_item_disabled"
          />
          <let-radio-group
            size="small"
            class="form_item_style"
            v-bind:disabled="!batchEditConf.itemEnable.enable_set"
            v-model="configModal.model.enable_set"
            :data="[
              { value: true, text: $t('common.enable') },
              { value: false, text: $t('common.disable') },
            ]"
          >
          </let-radio-group>
        </let-form-item>

        <let-form-item
          :label="$t('common.set.setName')"
          required
          v-if="configModal.model.enable_set"
        >
          <let-checkbox
            v-model="batchEditConf.itemEnable.set_name"
            v-show="!batchEditConf.show"
            class="form_item_disabled"
          />
          <let-input
            size="small"
            class="form_item_style"
            v-bind:disabled="!batchEditConf.itemEnable.set_name"
            v-model="configModal.model.set_name"
            :placeholder="$t('serverList.dlg.errMsg.setName')"
            required
            pattern="^[a-z]+$"
            :pattern-tip="$t('serverList.dlg.errMsg.setName')"
          ></let-input>
        </let-form-item>

        <let-form-item
          :label="$t('common.set.setArea')"
          required
          v-if="configModal.model.enable_set"
        >
          <let-checkbox
            v-model="batchEditConf.itemEnable.set_area"
            v-show="!batchEditConf.show"
            class="form_item_disabled"
          />
          <let-input
            size="small"
            class="form_item_style"
            v-bind:disabled="!batchEditConf.itemEnable.set_area"
            v-model="configModal.model.set_area"
            :placeholder="$t('serverList.dlg.errMsg.setArea')"
            required
            pattern="^[a-z]+$"
            :pattern-tip="$t('serverList.dlg.errMsg.setArea')"
          ></let-input>
        </let-form-item>

        <let-form-item
          :label="$t('common.set.setGroup')"
          required
          v-if="configModal.model.enable_set"
        >
          <let-checkbox
            v-model="batchEditConf.itemEnable.set_group"
            v-show="!batchEditConf.show"
            class="form_item_disabled"
          />
          <let-input
            size="small"
            class="form_item_style"
            v-bind:disabled="!batchEditConf.itemEnable.set_group"
            v-model="configModal.model.set_group"
            :placeholder="$t('serverList.dlg.errMsg.setGroup')"
            required
            pattern="^[0-9\*]+$"
            :pattern-tip="$t('serverList.dlg.errMsg.setGroup')"
          ></let-input>
        </let-form-item>

        <let-form-item :label="$t('serverList.dlg.run_type')" required>
          <let-checkbox
            v-model="batchEditConf.itemEnable.run_type_bool"
            v-show="!batchEditConf.show"
            class="form_item_disabled"
          />
          <let-radio-group
            size="small"
            class="form_item_style"
            v-bind:disabled="!batchEditConf.itemEnable.run_type_bool"
            v-model="configModal.model.run_type_bool"
            @change="changeRunType"
            :data="[
              { value: true, text: $t('pub.dlg.tgzRun') },
              { value: false, text: $t('pub.dlg.containerRun') },
            ]"
          >
          </let-radio-group>
        </let-form-item>

        <let-form-item
          :label="$t('deployService.form.baseImageId')"
          v-if="!configModal.model.run_type_bool"
        >
          <let-checkbox
            v-model="batchEditConf.itemEnable.run_type_bool"
            v-show="!batchEditConf.show"
            class="form_item_disabled"
          />
          <let-select
            size="small"
            v-bind:disabled="!batchEditConf.itemEnable.run_type_bool"
            v-model="configModal.model.base_image_id"
          >
            <let-option v-for="i in baseImageList" :key="i.id" :value="i.id">{{
              i.registry + "(" + i.image + ")"
            }}</let-option>
          </let-select>
        </let-form-item>

        <let-form-item :label="$t('serverList.dlg.asyncThread')" required>
          <let-checkbox
            v-model="batchEditConf.itemEnable.async_thread_num"
            v-show="!batchEditConf.show"
            class="form_item_disabled"
          />
          <let-input
            size="small"
            class="form_item_style"
            v-bind:disabled="!batchEditConf.itemEnable.async_thread_num"
            v-model="configModal.model.async_thread_num"
            :placeholder="$t('serverList.dlg.placeholder.thread')"
            required
            :pattern="
              configModal.model.server_type === 'tars_nodejs'
                ? '^[1-9][0-9]*$'
                : '^([3-9]|[1-9][0-9]+)$'
            "
            :pattern-tip="$t('serverList.dlg.placeholder.thread')"
          ></let-input>
        </let-form-item>

        <let-form-item :label="$t('serverList.dlg.defaultPath')">
          <let-checkbox
            v-model="batchEditConf.itemEnable.base_path"
            v-show="!batchEditConf.show"
            class="form_item_disabled"
          />
          <let-input
            size="small"
            class="form_item_style"
            v-bind:disabled="
              !batchEditConf.itemEnable.base_path ||
                !configModal.model.run_type_bool
            "
            v-model="configModal.model.base_path"
          ></let-input>
        </let-form-item>

        <let-form-item :label="$t('serverList.dlg.exePath')">
          <let-checkbox
            v-model="batchEditConf.itemEnable.exe_path"
            v-show="!batchEditConf.show"
            class="form_item_disabled"
          />
          <let-input
            size="small"
            class="form_item_style"
            v-bind:disabled="
              !batchEditConf.itemEnable.exe_path ||
                !configModal.model.run_type_bool
            "
            v-model="configModal.model.exe_path"
          ></let-input>
        </let-form-item>

        <let-form-item :label="$t('serverList.dlg.startScript')">
          <let-checkbox
            v-model="batchEditConf.itemEnable.start_script_path"
            v-show="!batchEditConf.show"
            class="form_item_disabled"
          />
          <let-input
            size="small"
            class="form_item_style"
            v-bind:disabled="
              !batchEditConf.itemEnable.start_script_path ||
                !configModal.model.run_type_bool
            "
            v-model="configModal.model.start_script_path"
          ></let-input>
        </let-form-item>

        <let-form-item :label="$t('serverList.dlg.stopScript')">
          <let-checkbox
            v-model="batchEditConf.itemEnable.stop_script_path"
            v-show="!batchEditConf.show"
            class="form_item_disabled"
          />
          <let-input
            size="small"
            class="form_item_style"
            v-bind:disabled="
              !batchEditConf.itemEnable.stop_script_path ||
                !configModal.model.run_type_bool
            "
            v-model="configModal.model.stop_script_path"
          ></let-input>
        </let-form-item>

        <let-form-item :label="$t('serverList.dlg.monitorScript')">
          <let-checkbox
            v-model="batchEditConf.itemEnable.monitor_script_path"
            v-show="!batchEditConf.show"
            class="form_item_disabled"
          />
          <let-input
            size="small"
            class="form_item_style"
            v-bind:disabled="
              !batchEditConf.itemEnable.monitor_script_path ||
                !configModal.model.run_type_bool
            "
            v-model="configModal.model.monitor_script_path"
          ></let-input>
        </let-form-item>

        <let-form-item
          :label="$t('serverList.dlg.privateTemplate')"
          labelWidth="150px"
          itemWidth="100%"
        >
          <let-checkbox
            v-model="batchEditConf.itemEnable.profile"
            v-show="!batchEditConf.show"
            class="form_item_disabled"
          />
          <let-input
            size="large"
            type="textarea"
            :rows="5"
            v-bind:disabled="!batchEditConf.itemEnable.profile"
            v-model="configModal.model.profile"
          ></let-input>
        </let-form-item>
      </let-form>
      <div v-else class="loading-placeholder" ref="configFormLoading"></div>
    </let-modal>

    <!-- Servant管理弹窗 -->
    <let-modal
      v-model="servantModal.show"
      :title="$t('serverList.table.servant.title')"
      width="1200px"
      :footShow="false"
      @close="closeServantModal"
    >
      <let-button
        size="small"
        theme="primary"
        class="tbm16"
        @click="configServant()"
        >{{ $t("operate.add") }} Servant</let-button
      >
      <let-table
        v-if="servantModal.model"
        :data="servantModal.model"
        :empty-msg="$t('common.nodata')"
      >
        <let-table-column
          :title="$t('operate.servant')"
          prop="servant"
        ></let-table-column>
        <let-table-column
          :title="$t('serverList.table.servant.adress')"
          prop="endpoint"
        ></let-table-column>
        <let-table-column
          :title="$t('serverList.table.servant.thread')"
          prop="thread_num"
        ></let-table-column>
        <let-table-column
          :title="$t('serverList.table.servant.connections')"
          prop="max_connections"
        ></let-table-column>
        <let-table-column
          :title="$t('serverList.table.servant.capacity')"
          prop="queuecap"
        ></let-table-column>
        <let-table-column
          :title="$t('serverList.table.servant.timeout')"
          prop="queuetimeout"
        ></let-table-column>
        <let-table-column :title="$t('operate.operates')" width="120px">
          <template slot-scope="scope">
            <let-table-operation
              v-clipboard:copy="scope.row.servant + '@' + scope.row.endpoint"
              v-clipboard:success="onCopy"
              v-clipboard:error="onError"
              >{{ $t("operate.copy") }}</let-table-operation
            >
            <let-table-operation @click="configServant(scope.row.id)">{{
              $t("operate.update")
            }}</let-table-operation>
            <let-table-operation
              class="danger"
              @click="deleteServant(scope.row.id)"
              >{{ $t("operate.delete") }}</let-table-operation
            >
          </template>
        </let-table-column>
      </let-table>
      <div v-else class="loading-placeholder" ref="servantModalLoading"></div>
    </let-modal>

    <!-- Servant新增、编辑弹窗 -->
    <let-modal
      v-model="servantDetailModal.show"
      :title="
        servantDetailModal.isNew
          ? `${$t('operate.title.add')} Servant`
          : `${$t('operate.title.update')} Servant`
      "
      width="800px"
      :footShow="!!servantDetailModal.model"
      @on-confirm="saveServantDetail"
      @close="closeServantDetailModal"
      @on-cancel="closeServantDetailModal"
    >
      <let-form
        v-if="servantDetailModal.model"
        ref="servantDetailForm"
        itemWidth="360px"
        :columns="2"
        class="two-columns"
      >
        <let-form-item
          :label="$t('serverList.servant.appService')"
          itemWidth="724px"
        >
          <span
            >{{ servantDetailModal.model.application }}·{{
              servantDetailModal.model.server_name
            }}</span
          >
        </let-form-item>
        <let-form-item :label="$t('serverList.servant.objName')" required>
          <let-input
            size="small"
            v-model="servantDetailModal.model.obj_name"
            :placeholder="$t('serverList.servant.c')"
            required
            :pattern-tip="$t('serverList.servant.obj')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('serverList.servant.numOfThread')" required>
          <let-input
            size="small"
            v-model="servantDetailModal.model.thread_num"
            :placeholder="$t('serverList.servant.thread')"
            required
            pattern="^[1-9][0-9]*$"
            :pattern-tip="$t('serverList.servant.thread')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('serverList.table.servant.adress')" required>
          <let-input
            ref="endpoint"
            size="small"
            v-model="servantDetailModal.model.endpoint"
            placeholder="tcp -h 127.0.0.1 -t 60000 -p 12000"
            required
            :extraTip="isEndpointValid ? '' : $t('serverList.servant.error')"
          ></let-input>
        </let-form-item>
        <let-form-item
          :label="$t('serverList.table.servant.nodeName')"
          required
        >
          <let-input
            ref="node_name"
            size="small"
            v-model="servantDetailModal.model.node_name"
            placeholder="127.0.0.1"
            required
            :disabled="!servantDetailModal.isNew"
          ></let-input>
        </let-form-item>
        <let-form-item
          :label="$t('serverList.servant.connections')"
          labelWidth="150px"
        >
          <let-input
            size="small"
            v-model="servantDetailModal.model.max_connections"
          ></let-input>
        </let-form-item>
        <let-form-item
          :label="$t('serverList.servant.lengthOfQueue')"
          labelWidth="150px"
        >
          <let-input
            size="small"
            v-model="servantDetailModal.model.queuecap"
          ></let-input>
        </let-form-item>
        <let-form-item
          :label="$t('serverList.servant.queueTimeout')"
          labelWidth="150px"
        >
          <let-input
            size="small"
            v-model="servantDetailModal.model.queuetimeout"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('serverList.servant.allowIP')">
          <let-input
            size="small"
            v-model="servantDetailModal.model.allow_ip"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('serverList.servant.protocol')" required>
          <let-radio-group
            size="small"
            v-model="servantDetailModal.model.protocol"
            :data="[
              { value: 'tars', text: 'TARS' },
              { value: 'not_tars', text: $t('serverList.servant.notTARS') },
            ]"
          >
          </let-radio-group>
        </let-form-item>
        <let-form-item
          :label="$t('serverList.servant.treatmentGroup')"
          labelWidth="150px"
        >
          <let-input
            size="small"
            v-model="servantDetailModal.model.handlegroup"
          ></let-input>
        </let-form-item>
      </let-form>
    </let-modal>

    <!-- 更多命令弹窗 -->
    <let-modal
      v-model="moreCmdModal.show"
      :title="$t('operate.title.more')"
      width="700px"
      class="more-cmd"
      @on-confirm="invokeMoreCmd"
      @close="closeMoreCmdModal"
      @on-cancel="closeMoreCmdModal"
    >
      <let-form v-if="moreCmdModal.model" ref="moreCmdForm">
        <let-form-item itemWidth="100%">
          <let-radio
            v-model="moreCmdModal.model.selected"
            label="setloglevel"
            >{{ $t("serverList.servant.logLevel") }}</let-radio
          >
          <let-select
            size="small"
            :disabled="moreCmdModal.model.selected !== 'setloglevel'"
            v-model="moreCmdModal.model.setloglevel"
          >
            <let-option v-for="l in logLevels" :key="l" :value="l">{{
              l
            }}</let-option>
          </let-select>
        </let-form-item>
        <let-form-item itemWidth="100%" v-if="!isBatchShowCmd">
          <let-radio v-model="moreCmdModal.model.selected" label="loadconfig">{{
            $t("serverList.servant.pushFile")
          }}</let-radio>
          <let-select
            size="small"
            :placeholder="
              moreCmdModal.model.configs && moreCmdModal.model.configs.length
                ? $t('pub.dlg.defaultValue')
                : $t('pub.dlg.noConfFile')
            "
            :disabled="
              !(
                moreCmdModal.model.configs && moreCmdModal.model.configs.length
              ) || moreCmdModal.model.selected !== 'loadconfig'
            "
            v-model="moreCmdModal.model.loadconfig"
            :required="moreCmdModal.model.selected === 'loadconfig'"
          >
            <let-option
              v-for="l in moreCmdModal.model.configs"
              :key="l.filename"
              :value="l.filename"
              >{{ l.filename }}</let-option
            >
          </let-select>
        </let-form-item>
        <let-form-item itemWidth="100%">
          <let-radio v-model="moreCmdModal.model.selected" label="command">{{
            $t("serverList.servant.sendCommand")
          }}</let-radio>
          <let-input
            size="small"
            :disabled="moreCmdModal.model.selected !== 'command'"
            v-model="moreCmdModal.model.command"
            :required="moreCmdModal.model.selected === 'command'"
          ></let-input>
        </let-form-item>
        <let-form-item itemWidth="100%">
          <let-radio v-model="moreCmdModal.model.selected" label="connection">{{
            $t("serverList.servant.serviceLink")
          }}</let-radio>
        </let-form-item>
        <let-form-item itemWidth="100%">
          <let-radio
            v-model="moreCmdModal.model.selected"
            label="undeploy_tars"
            class="danger"
            >{{ $t("operate.undeploy") }} {{ $t("common.service") }}</let-radio
          >
        </let-form-item>
      </let-form>
    </let-modal>

    <!-- 服务模板弹窗 -->
    <let-modal
      v-model="templateMoadal.show"
      width="700px"
      :title="$t('operate.templateView')"
      @close="closeTemplateMoadal"
    >
      <div class="pre_con">
        <pre v-if="templateMoadal.show">
              {{ templateMoadal.model.template }}
          </pre
        >
      </div>
      <div slot="foot"></div>
    </let-modal>

    <!--查看服务状态-->
    <let-modal
      v-model="serverStatusModal.show"
      width="55%"
      :footShow="false"
      :title="$t('operate.templateView')"
      @close="closeStatusModal"
    >
      <let-table
        :data="serverStatusModal.model.statusList"
        stripe
        :empty-msg="$t('common.nodata')"
        v-if="serverStatusModal.show"
        ref="serverStatusListLoading"
      >
        <let-table-column
          width="20%"
          :title="$t('serverList.table.th.serviceID')"
        >
          <template slot-scope="scope">
            <span>{{
              `${scope.row.application}.${scope.row.server_name}`
            }}</span
            ><br />
            <span>{{ scope.row.node_name }}</span>
          </template>
        </let-table-column>
        <let-table-column :title="$t('serverList.table.th.result')">
          <div slot-scope="scope" class="pre_con">
            <pre :style="serverStatusStyle(scope.row.ret_code)">{{
              scope.row.err_msg
            }}</pre>
          </div>
        </let-table-column>
      </let-table>
    </let-modal>

    <el-dialog :visible.sync="dialogCommandVisible" width="80%">
      <span v-html="commandHTML"></span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCommandVisible = false">{{
          $t("common.cancel")
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import batchOperation from "./../dcache/moduleManage/batchOperation.vue";
import Vue from "vue";
import VueClipboard from "vue-clipboard2";
Vue.use(VueClipboard);

const batchConfigModel = {
  id: [],
  server_name: "batchedit",
  node_name: "batchedit",
  server_type: "tars_cpp",
  enable_set: false,
  set_name: "",
  set_area: "",
  set_group: "",
  bak_flag: true,
  templates: [],
  template_name: "tars.default",
  profile: "",
  async_thread_num: 3,
  base_path: "",
  exe_path: "",
  start_script_path: "",
  stop_script_path: "",
  monitor_script_path: "",
  enable_group: false,
  ip_group_name: "",
  run_type: "",
  run_type_bool: true,
  base_image_id: "",
};

export default {
  components: { batchOperation },
  name: "ServerManage",
  data() {
    return {
      dialogCommandVisible: false,
      commandHTML: "",

      // 全选
      isCheckedAll: false,

      // 当前页面信息
      serverData: {
        level: 5,
        application: "",
        server_name: "",
        set_name: "",
        set_area: "",
        set_group: "",
      },

      // 服务列表
      serverList: [],
      // 分组列表
      groupList: [],
      //基础镜像
      baseImageList: [],

      // 操作历史列表
      serverNotifyList: [],
      getServerNotifyListTimer: 0,
      pageNum: 1,
      pageSize: 20,
      total: 1,

      serverPageNum: 1,
      serverPageSize: 16,
      serverTotal: 1,

      // 编辑服务
      serverTypes: [
        "tars_cpp",
        "tars_java",
        "tars_php",
        "tars_nodejs",
        "not_tars",
        "tars_go",
      ],
      configModal: {
        show: false,
        model: null,
        batch: false,
      },
      batchEditConf: {
        show: true,
        itemEnable: null,
      },
      // 编辑servant
      servantModal: {
        show: false,
        model: null,
        currentServer: null,
      },
      servantDetailModal: {
        show: false,
        isNew: true,
        model: null,
      },

      // 更多命令
      logLevels: ["NONE", "TARS", "DEBUG", "INFO", "WARN", "ERROR"],
      moreCmdModal: {
        show: false,
        model: null,
        currentServer: null,
      },
      templateMoadal: {
        show: false,
        model: null,
      },
      serverStatusModal: {
        show: false,
        model: null,
      },
      // 失败重试次数
      failCount: 0,
      isBatchShowCmd: false,
    };
  },
  props: ["treeid"],
  computed: {
    showOthers() {
      return this.serverData.level === 5;
    },
    isEndpointValid() {
      if (
        !this.servantDetailModal.model ||
        !this.servantDetailModal.model.endpoint
      ) {
        return false;
      }
      return this.checkServantEndpoint(this.servantDetailModal.model.endpoint);
    },
    hasCheckedServer() {
      return (
        this.serverList.filter((item) => item.isChecked === true).length !== 0
      );
    },
    checkedServers() {
      return this.serverList.filter((item) => item.isChecked === true);
    },
  },
  watch: {
    isCheckedAll() {
      let isCheckedAll = this.isCheckedAll;
      this.serverList.forEach((item) => {
        item.isChecked = isCheckedAll;
      });
    },
  },
  methods: {
    changeRunType() {
      if (
        !this.configModal.model.run_type_bool &&
        this.baseImageList.length == 0
      ) {
        this.configModal.model.run_type_bool = true;

        this.$Notice({
          message: this.$t("deployService.form.containRunInfo"),
          type: "warning",
        });
      }
    },
    // 获取服务列表
    getServerList(server_curr_page) {
      if (!server_curr_page) {
        server_curr_page = this.serverPageNum || 1;
      }
      const loading = this.$refs.serverListLoading.$loading.show();
      this.$ajax
        .getJSON("/server/api/server_list", {
          tree_node_id: this.treeid,
          page_size: this.serverPageSize,
          cur_page: server_curr_page,
          is_page: !(this.serverNotifyList && this.showOthers), //是否分页
        })
        .then((data) => {
          loading.hide();
          if (!(this.serverNotifyList && this.showOthers)) {
            data.rows.forEach((item) => {
              item.isChecked = false;
              item.present_state_in_node = "";
              item.is_node_ok = true;
              item.query_ret_code = 0;
              item.source = item.source || "{}";
              item.source = JSON.parse(item.source);
              item.setting_state =
                item.setting_state.charAt(0).toUpperCase() +
                item.setting_state.slice(1);
            });
            this.serverPageNum = server_curr_page;
            this.serverTotal = Math.ceil(data.count / this.serverPageSize);
            this.serverList = data.rows;
          } else {
            data.forEach((item) => {
              item.isChecked = false;
              item.present_state_in_node = "";
              item.is_node_ok = true;
              item.query_ret_code = 0;
              item.source = item.source || "{}";
              item.source = JSON.parse(item.source);
              item.setting_state =
                item.setting_state.charAt(0).toUpperCase() +
                item.setting_state.slice(1);
            });
            this.serverList = data;
          }
          this.updateServerState();
        })
        .catch((err) => {
          loading.hide();
          this.$confirm(
            err.err_msg || err.message || this.$t("serverList.msg.fail"),
            this.$t("common.alert")
          ).then(() => {
            this.getServerList();
          });
        });
      this.isCheckedAll = false;
    },
    //tarsadmin修改服务实时状态
    updateServerState() {
      if (this.serverList.length != 0) {
        let queryState = this.serverList.map((item) => {
          return {
            application: item.application,
            server_name: item.server_name,
            node_name: item.node_name,
          };
        });
        this.$ajax
          .postJSON("/server/api/server_state", {
            queryState,
          })
          .then((data) => {
            this.serverList.forEach((item) => {
              let serverState = data.filter(
                (app) =>
                  app.application == item.application &&
                  (app.server_name == item.server_name) &
                    (app.node_name == item.node_name)
              );
              item.present_state_in_node = serverState[0].present_state_in_node;
              item.is_node_ok = serverState[0].is_node_ok;
              item.query_ret_code = serverState[0].query_ret_code;
            });
          });
      }
    },
    // 获取服务实时状态
    getServerNotifyList(curr_page) {
      if (!this.showOthers) return;
      // const loading = this.$refs.serverNotifyListLoading.$loading.show();
      if (!curr_page) {
        curr_page = this.pageNum || 1;
      }
      this.$ajax
        .getJSON("/server/api/server_notify_list", {
          tree_node_id: this.treeid,
          page_size: this.pageSize,
          curr_page: curr_page,
        })
        .then((data) => {
          // loading.hide();
          this.pageNum = curr_page;
          this.total = Math.ceil(data.count / this.pageSize);
          this.serverNotifyList = data.rows;
          var that = this;
        })
        .catch((err) => {
          // loading.hide();
          this.$tip.error(
            `${this.$t("serverList.restart.failed")}: ${err.err_msg ||
              err.message}`
          );
        });
    },
    statusStyle(message) {
      message = message || "";

      if (message == "restart" || message.indexOf("[succ]") != -1) {
        return "color: green";
      } else if (
        message == "stop" ||
        message.indexOf("[alarm]") != -1 ||
        message.indexOf("error") != -1 ||
        message.indexOf("ERROR") != -1
      ) {
        return "color: red";
      }
      return "";
    },
    // 切换服务实时状态页码
    gotoPage(num) {
      this.getServerNotifyList(num);
    },
    gotoServerPage(num) {
      this.getServerList(num);
    },

    // 获取模版列表
    getTemplateList() {
      this.$ajax
        .getJSON("/server/api/template_name_list")
        .then((data) => {
          if (this.configModal.model) {
            this.configModal.model.templates = data;
          } else {
            this.configModal.model = { templates: data };
          }
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("serverList.restart.failed")}: ${err.err_msg ||
              err.message}`
          );
        });
    },
    // 获取IDC分组列表
    getGroupList() {
      this.$ajax
        .getJSON("/server/api/dict_idc")
        .then((data) => {
          let groupList = [{ key: " ", value: "自动" }];
          data.forEach((row) => {
            groupList.push({
              key: row.group_name,
              value: row.group_name + "-" + row.group_name_cn,
            });
          });
          if (this.configModal.model) {
            this.configModal.model.groupList = groupList;
          } else {
            this.configModal.model = { groupList: groupList };
          }
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("getGroupList.restart.failed")}: ${err.err_msg ||
              err.message}`
          );
        });
    },
    // 获取服务数据
    async getServerConfig(id) {
      const loading = this.$loading.show({
        target: this.$refs.configFormLoading,
      });

      let data = await this.$ajax.getJSON("/server/api/base_image_list");

      this.baseImageList = data;

      this.$ajax
        .getJSON("/server/api/server", {
          id,
        })
        .then((data) => {
          loading.hide();
          data.run_type_bool = data.run_type != "container";

          if (this.configModal.model) {
            this.configModal.model = Object.assign(
              {},
              this.configModal.model,
              data
            );
          } else {
            data.templates = [];
            this.configModal.model = data;
          }

          if (
            !this.configModal.model.base_image_id &&
            this.baseImageList.length > 0
          ) {
            this.configModal.model.base_image_id = this.baseImageList[0].id;
          }
        })
        .catch((err) => {
          loading.hide();
          this.closeConfigModal();
          this.$tip.error(
            `${this.$t("serverList.restart.failed")}: ${err.err_msg ||
              err.message}`
          );
        });
    },
    // 编辑服务
    configServer(id) {
      this.configModal.show = true;
      this.getTemplateList();
      this.getGroupList();
      this.getServerConfig(id);

      this.batchEditConf.itemEnable = { ...batchConfigModel };
      for (let key in this.batchEditConf.itemEnable) {
        this.batchEditConf.itemEnable[key] = true;
      }
    },
    batchConfigServer() {
      var ids = this.serverList
        .filter((item) => item.isChecked === true)
        .map((item, index) => {
          return item.id;
        });
      if (ids.length == 1) {
        this.configServer(ids[0]);
        return;
      }
      this.configModal.show = true;
      this.batchEditConf.show = false;
      this.getTemplateList();
      this.getGroupList();
      this.configModal.model = { ...batchConfigModel };
      this.configModal.model.id = ids;
      this.batchEditConf.itemEnable = { ...batchConfigModel };
      for (let key in this.batchEditConf.itemEnable) {
        this.batchEditConf.itemEnable[key] = false;
      }
    },
    saveConfig(flag) {
      if (this.$refs.configForm.validate()) {
        if (!flag) {
          //批量修改
          this.batchEditConf.itemEnable.id = true;
          if (this.configModal.model.enable_group) {
            this.batchEditConf.itemEnable.ip_group_name = true;
          }
          for (let key in this.batchEditConf.itemEnable) {
            if (!this.batchEditConf.itemEnable[key]) {
              delete this.configModal.model[key];
            }
          }
        }
        if (!this.configModal.model.run_type_bool) {
          this.configModal.model.run_type = "container";
        } else {
          this.configModal.model.run_type = "";
        }

        var url = flag
          ? "/server/api/update_server"
          : "/server/api/batch_update_server";
        const loading = this.$Loading.show();
        this.$ajax
          .postJSON(url, {
            isBak: this.configModal.model.bak_flag,
            ...this.configModal.model,
          })
          .then((res) => {
            loading.hide();
            this.getServerList(); //修改后直接查询
            this.closeConfigModal();
            this.$tip.success(this.$t("serverList.restart.success"));
          })
          .catch((err) => {
            loading.hide();
            this.$tip.error(
              `${this.$t("serverList.restart.failed")}: ${err.message ||
                err.err_msg}`
            );
          });
      }
    },
    closeConfigModal() {
      if (this.$refs.configForm) this.$refs.configForm.resetValid();
      this.configModal.show = false;
      this.batchEditConf.show = true;
      this.configModal.model = null;
    },

    // 检查任务状态
    checkTaskStatus(taskid, isRetry) {
      return new Promise((resolve, reject) => {
        this.$ajax
          .getJSON("/server/api/task", {
            task_no: taskid,
          })
          .then((data) => {
            // 进行中，1秒后重试
            if (data.status === 1 || data.status === 0) {
              setTimeout(() => {
                resolve(this.checkTaskStatus(taskid));
              }, 3000);
              // 成功
            } else if (data.status === 2) {
              resolve(`taskid: ${data.task_no}`);
              // 失败
            } else {
              reject(new Error(`taskid: ${data.task_no}`));
            }
          })
          .catch((err) => {
            // 网络问题重试1次
            if (isRetry) {
              reject(
                new Error(
                  err.err_msg || err.message || this.$t("common.networkErr")
                )
              );
            } else {
              setTimeout(() => {
                resolve(this.checkTaskStatus(taskid, true));
              }, 3000);
            }
          });
      });
    },
    // 修改流量状态
    updateFlowStatus(id, bActive, nodeName) {
      const loading = this.$Loading.show();
      this.$ajax
        .postJSON("/server/api/update_flowstatus", {
          server_id: id,
          status: bActive,
          node_list: [nodeName],
        })
        .then((res) => {
          // eslint-disable-line
          loading.hide();
          // 任务成功重新拉取列表
          this.getServerList();
          this.$t("common.success");
        })
        .catch((err) => {
          loading.hide();
          // 任务失败也重新拉取列表
          this.getServerList();
          this.$tip.error({
            title: "update flow status fail.",
            message: err.err_msg || err.message || this.$t("common.networkErr"),
          });
        });
    },
    // 添加任务
    addTask(id, command, tipObj) {
      const loading = this.$Loading.show();
      this.$ajax
        .postJSON("/server/api/add_task", {
          serial: true, // 是否串行
          items: [
            {
              server_id: id,
              command,
            },
          ],
        })
        .then((res) => {
          // eslint-disable-line

          return this.checkTaskStatus(res)
            .then((info) => {
              loading.hide();
              // 任务成功重新拉取列表
              this.getServerList();
              this.$tip.success({
                title: tipObj.success,
                message: info,
              });
            })
            .catch((err) => {
              throw err;
            });
        })
        .catch((err) => {
          loading.hide();
          // 任务失败也重新拉取列表
          this.getServerList();
          this.$tip.error({
            title: tipObj.error,
            message: err.err_msg || err.message || this.$t("common.networkErr"),
          });
        });
    },
    // 重启服务
    restartServer(id) {
      this.addTask(id, "restart", {
        success: this.$t("serverList.restart.success"),
        error: this.$t("serverList.restart.failed"),
      });
    },
    // 停止服务
    stopServer(id) {
      this.$confirm(
        this.$t("serverList.stopService.msg.stopService"),
        this.$t("common.alert")
      ).then(() => {
        this.addTask(id, "stop", {
          success: this.$t("serverList.restart.success"),
          error: this.$t("serverList.restart.failed"),
        });
      });
    },
    // 下线服务
    undeployServer(server) {
      if (server.present_state === "active") {
        this.$tip.error(`${this.$t("serverList.tips.undeploy")}`);
      } else {
        this.$confirm(
          this.$t("serverList.dlg.msg.undeploy"),
          this.$t("common.alert")
        ).then(() => {
          this.addTask(server.id, "undeploy_tars", {
            success: this.$t("serverList.undeploy.success"),
            error: this.$t("serverList.undeploy.failed"),
          });
        });
      }
    },
    // 批量下线服务
    undeployServers(servers) {
      const activeSer = servers.filter(
        (item) => item.present_state === "active"
      );
      if (activeSer.length > 0) {
        this.$tip.error(`${this.$t("serverList.tips.undeploy")}`);
      } else {
        this.$confirm(
          this.$t("serverList.dlg.msg.undeploy"),
          this.$t("common.alert")
        ).then(() => {
          servers.forEach((item) => {
            this.addTask(item.id, "undeploy_tars", {
              success: this.$t("serverList.undeploy.success"),
              error: this.$t("serverList.undeploy.failed"),
            });
          });
        });
      }
    },

    // 管理Servant弹窗
    manageServant(server) {
      this.servantModal.show = true;

      const loading = this.$loading.show({
        target: this.$refs.servantModalLoading,
      });

      this.$ajax
        .getJSON("/server/api/adapter_conf_list", {
          id: server.id,
        })
        .then((data) => {
          loading.hide();
          this.servantModal.model = data;
          this.servantModal.currentServer = server;
        })
        .catch((err) => {
          loading.hide();
          this.$tip.error(
            `${this.$t("serverList.restart.failed")}: ${err.err_msg ||
              err.message}`
          );
        });
    },
    closeServantModal() {
      this.servantModal.show = false;
      this.servantModal.model = null;
      this.servantModal.currentServer = null;
    },
    // 新增、编辑 servant
    configServant(id) {
      // 新增
      this.servantDetailModal.model = {
        application: this.servantModal.currentServer.application,
        server_name: this.servantModal.currentServer.server_name,
        obj_name: "",
        node_name: "",
        endpoint: "",
        servant: "",
        thread_num: "",
        max_connections: "200000",
        queuecap: "10000",
        queuetimeout: "60000",
        allow_ip: "",
        protocol: "not_tars",
        handlegroup: "",
      };
      this.servantDetailModal.isNew = true;
      // 编辑
      if (id) {
        const old = this.servantModal.model.find((item) => item.id === id);
        old.obj_name = old.servant.split(".")[2];
        this.servantDetailModal.model = Object.assign(
          {},
          this.servantDetailModal.model,
          old
        );
        this.servantDetailModal.isNew = false;
      }
      this.servantDetailModal.show = true;
    },
    closeServantDetailModal() {
      if (this.$refs.servantDetailForm)
        this.$refs.servantDetailForm.resetValid();
      this.servantDetailModal.show = false;
      this.servantDetailModal.model = null;
    },
    // 检查绑定地址
    checkServantEndpoint(endpoint) {
      const tmp = endpoint.split(/\s-/);
      const regProtocol = /^tcp|udp|ssl$/i;
      let regIP = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/i;
      let regHost = /^h\s[^\s]+/i;
      let regT = /^t\s([1-9]|[1-9]\d+)$/i;
      let regPort = /^p\s\d{2,5}$/i;

      let check = true;
      if (regProtocol.test(tmp[0])) {
        let flag = 0;

        for (let i = 1; i < tmp.length; i++) {
          // eslint-disable-line
          // 验证 -h
          if (regHost && regHost.test(tmp[i])) {
            flag++; // eslint-disable-line
            // 提取参数
            var ip = tmp[i].split(/\s/)[1];
            if (regIP.test(ip)) {
              this.servantDetailModal.model.node_name = ip;
            }
            regHost = null;
          }

          // 验证 -t
          if (regT && regT.test(tmp[i])) {
            flag++; // eslint-disable-line
            regT = null;
          }

          // 验证 -p
          if (regPort && regPort.test(tmp[i])) {
            const port = tmp[i].substring(2);
            if (!(port < 0 || port > 65535)) {
              flag++; // eslint-disable-line
            }
            regPort = null;
          }
        }
        check = flag === 3;
      } else {
        check = false;
      }
      return check;
    },
    // 保存 servant
    saveServantDetail() {
      if (this.$refs.servantDetailForm.validate()) {
        const loading = this.$Loading.show();
        // 新建
        if (this.servantDetailModal.isNew) {
          const query = this.servantDetailModal.model;
          query.servant = [
            query.application,
            query.server_name,
            query.obj_name,
          ].join(".");
          this.$ajax
            .postJSON("/server/api/add_adapter_conf", query)
            .then((res) => {
              loading.hide();
              this.servantModal.model.unshift(res);
              this.$tip.success(this.$t("common.success"));
              this.closeServantDetailModal();
            })
            .catch((err) => {
              loading.hide();
              this.$tip.error(
                `${this.$t("common.error")}: ${err.err_msg || err.message}`
              );
            });
          // 修改
        } else {
          this.servantDetailModal.model.servant =
            this.servantDetailModal.model.application +
            "." +
            this.servantDetailModal.model.server_name +
            "." +
            this.servantDetailModal.model.obj_name;
          this.$ajax
            .postJSON(
              "/server/api/update_adapter_conf",
              this.servantDetailModal.model
            )
            .then((res) => {
              loading.hide();
              this.servantModal.model = this.servantModal.model.map((item) => {
                if (item.id === res.id) {
                  return res;
                }
                return item;
              });
              this.$tip.success(this.$t("common.success"));
              this.closeServantDetailModal();
            })
            .catch((err) => {
              loading.hide();
              this.$tip.error(
                `${this.$t("common.error")}: ${err.err_msg || err.message}`
              );
            });
        }
      }
    },
    // 删除 servant
    deleteServant(id) {
      this.$confirm(
        this.$t("serverList.servant.a"),
        this.$t("common.alert")
      ).then(() => {
        const loading = this.$Loading.show();
        this.$ajax
          .getJSON("/server/api/delete_adapter_conf", {
            id,
          })
          .then((res) => {
            loading.hide();
            this.servantModal.model = this.servantModal.model.filter(
              (item) => item.id !== id
            );
            this.$tip.success(this.$t("common.success"));
          })
          .catch((err) => {
            loading.hide();
            this.$tip.error(
              `${this.$t("common.error")}: ${err.err_msg || err.message}`
            );
          });
      });
    },

    // 显示更多命令
    showMoreCmd(server) {
      this.moreCmdModal.model = {
        selected: "setloglevel",
        setloglevel: "NONE",
        loadconfig: "",
        command: "",
        configs: null,
      };
      this.moreCmdModal.unwatch = this.$watch(
        "moreCmdModal.model.selected",
        () => {
          if (this.$refs.moreCmdForm) this.$refs.moreCmdForm.resetValid();
        }
      );
      this.moreCmdModal.show = true;
      this.moreCmdModal.currentServer = server;
      this.isBatchShowCmd = false;

      this.$ajax
        .getJSON("/server/api/config_file_list", {
          level: 5,
          application: server.application,
          server_name: server.server_name,
        })
        .then((data) => {
          if (this.moreCmdModal.model) this.moreCmdModal.model.configs = data;
        })
        .catch((err) => {
          this.$tip.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    // 批量打开更多命令
    batchShowMoreCmd() {
      const checkedServer = this.serverList.filter(
        (item) => item.isChecked === true
      );

      this.moreCmdModal.model = {
        selected: "setloglevel",
        setloglevel: "NONE",
        loadconfig: "",
        command: "",
        configs: null,
      };
      this.moreCmdModal.unwatch = this.$watch(
        "moreCmdModal.model.selected",
        () => {
          if (this.$refs.moreCmdForm) this.$refs.moreCmdForm.resetValid();
        }
      );
      this.moreCmdModal.show = true;
      this.isBatchShowCmd = true;
      if (checkedServer.length === 1) {
        this.isBatchShowCmd = false;
        this.moreCmdModal.currentServer = checkedServer[0];
        this.$ajax
          .getJSON("/server/api/config_file_list", {
            level: 5,
            application: checkedServer[0].application,
            server_name: checkedServer[0].server_name,
          })
          .then((data) => {
            if (this.moreCmdModal.model) this.moreCmdModal.model.configs = data;
          })
          .catch((err) => {
            this.$tip.error(
              `${this.$t("common.error")}: ${err.err_msg || err.message}`
            );
          });
      }
    },

    sendCommand(id, command, hold) {
      const loading = this.$Loading.show();
      this.$ajax
        .getJSON("/server/api/send_command", {
          server_ids: id,
          command,
        })
        .then((res) => {
          loading.hide();
          const msg = res[0].err_msg.replace(/\n/g, "<br>");
          if (res[0].ret_code === 0) {
            // const opt = {
            //   title: this.$t("common.success"),
            //   message: `${res[0].application}.${res[0].server_name}_${res[0].node_name}:<br>${msg}`,
            // };
            // if (hold) opt.duration = 0;

            this.commandHTML = msg;
            this.dialogCommandVisible = true;

            // this.$tip.success(opt);
          } else {
            throw new Error(
              `${res[0].application}.${res[0].server_name}_${res[0].node_name}:<br>${msg}`
            );
          }
        })
        .catch((err) => {
          loading.hide();
          const opt = {
            title: this.$t("common.error"),
            message: err.err_msg || err.message,
          };
          if (hold) opt.duration = 0;
          this.$tip.error(opt);
        });
    },
    invokeMoreCmd() {
      if (this.isBatchShowCmd) {
        const checkedList = this.serverList.filter(
          (item) => item.isChecked === true
        );
        const model = this.moreCmdModal.model;
        // 下线服务
        if (model.selected === "undeploy_tars") {
          this.undeployServers(checkedList);
        } // 设置日志等级
        else if (model.selected === "setloglevel") {
          checkedList.forEach((item) => {
            this.sendCommand(item.id, `tars.setloglevel ${model.setloglevel}`);
          });
        } // 发送自定义命令
        else if (
          model.selected === "command" &&
          this.$refs.moreCmdForm.validate()
        ) {
          checkedList.forEach((item) => {
            this.sendCommand(item.id, model.command, true);
          });
        } else if (model.selected === "connection") {
          checkedList.forEach((item) => {
            this.sendCommand(item.id, `tars.connection`, true);
          });
        }
      } else {
        const model = this.moreCmdModal.model;
        const server = this.moreCmdModal.currentServer;
        // 下线服务
        if (model.selected === "undeploy_tars") {
          this.undeployServer(server);
          // 设置日志等级
        } else if (model.selected === "setloglevel") {
          this.sendCommand(server.id, `tars.setloglevel ${model.setloglevel}`);
          // push 日志文件
        } else if (
          model.selected === "loadconfig" &&
          this.$refs.moreCmdForm.validate()
        ) {
          this.sendCommand(server.id, `tars.loadconfig ${model.loadconfig}`);
          // 发送自定义命令
        } else if (
          model.selected === "command" &&
          this.$refs.moreCmdForm.validate()
        ) {
          this.sendCommand(server.id, model.command, true);
          // 查看服务链接
        } else if (model.selected === "connection") {
          this.sendCommand(server.id, `tars.connection`, true);
        }
      }
      this.closeMoreCmdModal();
    },
    closeMoreCmdModal() {
      if (this.$refs.moreCmdForm) this.$refs.moreCmdForm.resetValid();
      if (this.moreCmdModal.unwatch) this.moreCmdModal.unwatch();
      this.moreCmdModal.show = false;
      this.moreCmdModal.model = null;
      this.isBatchShowCmd = false;
    },

    // 处理未发布时间显示
    handleNoPublishedTime(timeStr, noPubTip = this.$t("pub.dlg.unpublished")) {
      if (timeStr === "0000:00:00 00:00:00") {
        return noPubTip;
      }
      return timeStr;
    },
    onCopy(e) {
      this.$tip.success(this.$t("common.success"));
    },
    onError(e) {
      this.$tip.error(this.$t("serverList.servant.copyErr"));
    },
    showTemplateView(row) {
      const loading = this.$Loading.show();
      this.$ajax
        .getJSON("/server/api/view_server_merge", {
          application: row.application,
          serverName: row.server_name,
          nodeName: row.node_name,
        })
        .then((data) => {
          loading.hide();
          this.templateMoadal.model = { template: `\n${data.template}` };
          this.templateMoadal.show = true;
        })
        .catch((err) => {
          loading.hide();
          this.$tip.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    closeTemplateMoadal() {
      this.templateMoadal.show = false;
      this.templateMoadal.model = null;
    },
    showStatusModal(row) {
      this.getServerStatusDatil(row.id);
    },
    batchshowStatusModal() {
      let ids = this.checkedServers.map((item) => {
        return item.id;
      });
      this.getServerStatusDatil(ids);
    },
    getServerStatusDatil(ids) {
      const loading = this.$Loading.show();
      this.$ajax
        .getJSON("/server/api/send_command", {
          server_ids: ids,
          command: "tars.viewstatus",
        })
        .then((res) => {
          loading.hide();
          res.forEach((item) => {
            item.service_id = `${item.application}.${item.server_name}_${item.node_name}`;
            if (item.ret_code == 0) {
              item.err_msg =
                `${this.$t("serverList.tips.success")}\n` + item.err_msg;
            } else {
              item.err_msg =
                `${this.$t("serverList.tips.error")}\n` + item.err_msg;
            }
          });
          this.serverStatusModal.model = { statusList: res };
          this.serverStatusModal.show = true;
        })
        .catch((err) => {
          loading.hide();
          this.$tip.error(
            `${this.$t("common.error")}: ${err.err_msg || err.message}`
          );
        });
    },
    serverStatusStyle(code) {
      if (code == -1) {
        return "color: red";
      }
      return "color : #9096A3 ";
    },
    closeStatusModal() {
      this.serverStatusModal.model = null;
      this.serverStatusModal.show = false;
    },
    goMarket(row) {
      let href;
      if (row.source["tars.io/CloudProduct"]) {
        href = `/static/market/index.html#/market/product/${row.source["tars.io/CloudInstall"].group}/${row.source["tars.io/CloudInstall"].name}/${row.source["tars.io/CloudInstall"].version}`;
      } else {
        href = `/static/market/index.html#/market/service/${row.source["tars.io/CloudInstall"].group}/${row.source["tars.io/CloudInstall"].name}/${row.source["tars.io/CloudInstall"].version}`;
      }

      window.open(href);
    },
  },
  created() {
    this.serverData = this.$parent.getServerData();
  },
  mounted() {
    this.getServerList();
    this.getServerNotifyList(1);
  },
  beforeRouteEnter(to, from, next) {
    next(
      next((vm) => {
        vm.getServerNotifyList(1);
      })
    );
  },
  beforeRouteUpdate(to, from, next) {
    next(
      next((vm) => {
        vm.getServerNotifyList(1);
      })
    );
  },
  linkDownload(url) {
    window.open(url, "_blank"); // 新窗口打开外链接
  },
};
</script>

<style lang="postcss">
@import "../../assets/css/variable.css";

.page_server_manage {
  .tbm16 {
    margin: 16px 0;
  }
  .danger {
    color: var(--off-color);
  }

  /* .icon.iconfont {
    font-size: 10px;
    cursor: pointer;
    vertical-align: 0em;
  } */

  .more-cmd {
    .let-form-item__content {
      display: flex;
      align-items: center;
    }
    span.let-radio {
      margin-right: 5px;
    }
    label.let-radio {
      width: 200px;
    }
  }

  .pre_con {
    display: block;
    overflow: hidden;
  }
  .pre_con pre {
    color: #909fa3;
    display: block;
    word-break: break-word;
    white-space: pre-wrap;
  }

  .table_head {
    padding: 10px 0;
  }
  .buttonText {
    white-space: nowrap;
  }
  .dcache .let-table__operations {
    position: absolute;
    right: -15px;
    top: -40px;
  }
  .form_item_disabled {
    display: block;
    float: left;
  }
  .form_item_style {
    width: 300px;
  }
  a:link {
    color: #0000ef;
  }
  a:visited {
    color: #0000ef;
  }
  a:hover {
    color: #5c76f3;
  }
}
</style>
