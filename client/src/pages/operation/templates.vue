<template>
  <div class="page_operation_templates">
    <let-button size="small" theme="primary" style="float: right" @click="addItem">新增模板</let-button>
    <let-form inline itemWidth="200px" @submit.native.prevent="search">
      <let-form-item label="模板名">
        <let-input size="small" v-model="query.template_name"></let-input>
      </let-form-item>
      <let-form-item label="父模板名称">
        <let-input size="small" v-model="query.parents_name"></let-input>
      </let-form-item>
      <let-form-item>
        <let-button size="small" type="submit" theme="primary">查询</let-button>
      </let-form-item>
    </let-form>

    <let-table ref="table" :data="items" empty-msg="暂无模板数据">
      <let-table-column title="模板名" prop="template_name" width="25%"></let-table-column>
      <let-table-column title="父模板名" prop="parents_name" width="25%"></let-table-column>
      <let-table-column title="上次更新时间" prop="posttime"></let-table-column>
      <let-table-column title="操作" width="180px">
        <template slot-scope="scope">
          <let-table-operation @click="viewItem(scope.row)">查看</let-table-operation>
          <let-table-operation @click="editItem(scope.row)">修改</let-table-operation>
          <let-table-operation @click="removeItem(scope.row)">删除</let-table-operation>
        </template>
      </let-table-column>
    </let-table>

    <let-modal v-model="viewModal.show" title="查看模板" width="800px">
      <pre v-if="viewModal.model">{{viewModal.model.profile}}</pre>
      <div slot="foot"></div>
    </let-modal>

    <let-modal
      v-model="detailModal.show"
      title="修改模板"
      width="800px"
      @on-confirm="saveItem"
      @on-cancel="closeDetailModal"
    >
      <let-form ref="detailForm" v-if="detailModal.model" itemWidth="700px">
        <let-form-item label="模板名" required>
          <let-input
            size="small"
            v-model="detailModal.model.template_name"
            placeholder="模板名只能包含英文字母、数字、小数点，并以字母开头"
            required
            required-tip="模板名不能为空"
            pattern="^[a-zA-Z]([.a-zA-Z0-9]+)?$"
            pattern-tip="模板名只能包含英文字母、数字、小数点，并以字母开头"
          ></let-input>
        </let-form-item>
        <let-form-item label="父模板名" required>
          <let-select
            size="small"
            v-model="detailModal.model.parents_name"
            placeholder="请选择"
            required
            required-tip="父模板不能为空"
          >
            <let-option value>请选择</let-option>
            <let-option
              v-for="d in items"
              :key="d.id"
              :value="d.template_name"
            >{{d.template_name}}</let-option>
          </let-select>
        </let-form-item>
        <let-form-item label="模板内容" required>
          <let-input
            type="textarea"
            :rows="10"
            size="small"
            v-model="detailModal.model.profile"
            required
            required-tip="模板内容不能为空"
          ></let-input>
        </let-form-item>
      </let-form>
    </let-modal>
  </div>
</template>

<script>
export default {
  name: 'OperationTemplates',

  data() {
    return {
      query: {
        template_name: '',
        parents_name: '',
      },
      items: [],
      viewModal: {
        show: false,
        model: null,
      },
      detailModal: {
        show: false,
        model: null,
      },
    };
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    fetchData() {
      const loading = this.$refs.table.$loading.show();
      return this.$ajax.getJSON('/server/api/query_profile_template', this.query).then((data) => {
        loading.hide();
        this.items = data;
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`获取数据失败: ${err.message || err.err_msg}`);
      });
    },

    search() {
      this.fetchData();
    },

    closeDetailModal() {
      this.$refs.detailForm.resetValid();
      this.detailModal.show = false;
      this.detailModal.model = null;
    },

    addItem() {
      this.detailModal.model = {};
      this.detailModal.show = true;
    },

    viewItem(d) {
      this.viewModal.model = d;
      this.viewModal.show = true;
    },

    editItem(d) {
      this.detailModal.model = d;
      this.detailModal.show = true;
    },

    saveItem() {
      if (this.$refs.detailForm.validate()) {
        const model = this.detailModal.model;
        const url = model.id ? '/server/api/update_profile_template' : '/server/api/add_profile_template';

        const loading = this.$Loading.show();
        this.$ajax.postJSON(url, model).then(() => {
          loading.hide();
          this.$tip.success('保存成功');
          this.closeDetailModal();
          this.fetchData();
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`保存失败: ${err.message || err.err_msg}`);
        });
      }
    },

    removeItem(d) {
      this.$confirm('删除后数据将不可恢复，是否确定删除？', '提示').then(() => {
        const loading = this.$Loading.show();
        this.$ajax.remove('/server/api/delete_profile_template', { id: d.id }).then(() => {
          loading.hide();
          this.fetchData().then(() => {
            this.$tip.success('删除成功');
          });
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`删除失败: ${err.message || err.err_msg}`);
        });
      }).catch(() => {});
    },
  },
};
</script>

<style>
.page_operation_templates {
  pre {
    color: #909FA3;
    margin-top: 32px;
  }

  .let_modal__body {
    overflow-y: visible;
  }
}
</style>
