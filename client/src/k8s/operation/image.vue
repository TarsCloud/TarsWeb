<template>
  <div class="page_operation_approval">
    <let-form inline itemWidth="200px" @submit.native.prevent="search">
        <div style="float: right">
            <let-button size="small" theme="primary" @click="addItem">{{$t('imageService.btn.add')}} </let-button>
        </div>
    </let-form>
    <br>

    <let-table ref="table" :data="baseLists" :empty-msg="$t('common.nodata')">
      <let-table-column :title="$t('imageService.form.SupportedType')" prop="SupportedTypeShow"></let-table-column>
      <let-table-column :title="$t('imageService.form.Count')" prop="Count" width="25%"></let-table-column>
      <let-table-column :title="$t('imageService.form.Mark')" prop="Mark"></let-table-column>
      <let-table-column :title="$t('imageService.form.CreateTime')" prop="CreateTime"></let-table-column>
      <let-table-column :title="$t('operate.operates')" width="180px">
        <template slot-scope="scope">
          <let-table-operation @click="editItem(scope.row)">{{$t('operate.update')}}</let-table-operation>
          <let-table-operation @click="viewItem(scope.row)">{{$t('operate.view')}}</let-table-operation>
          <let-table-operation @click="removeItem(scope.row)">{{$t('operate.delete')}}</let-table-operation>
        </template>
      </let-table-column>
    </let-table>

    <let-modal
      v-model="baseModal.show"
      :title="baseModal.isNew ? this.$t('dialog.title.add') : this.$t('dialog.title.edit')"
      width="600px"
      @on-confirm="saveItem"
      @on-cancel="closeDetailModal"
    >
      <let-form ref="detailForm" inline v-if="baseModal.model">
          <let-form-item :label="$t('imageService.form.SupportedType')" itemWidth="600px" required>
            <let-checkbox v-for="d in SupportedType" :key="d" :value="baseModal.model.SupportedType.indexOf(d) > -1" @change="SupportedTypeChange(d)">&nbsp;{{ d }} </let-checkbox>
          </let-form-item>
          <let-form-item :label="$t('imageService.form.Mark')"  required>
            <let-input
              size="small"
              v-model="baseModal.model.Mark"
              :placeholder="$t('imageService.form.Mark')"
            >
            </let-input>
          </let-form-item>
      </let-form>
    </let-modal>

    <let-modal
      v-model="releaseListsModal.show"
      :footShow="false"
      :title="this.$t('imageService.title.view')"
      width="80%"
    >

      <let-form inline itemWidth="200px" @submit.native.prevent="search">
          <div style="float: right">
              <let-button size="small" theme="primary" @click="addReleaseItem(releaseListsModal.Name)">{{$t('imageService.btn.add')}} </let-button>
          </div>
      </let-form>

      <br>

      <let-table ref="table" :data="releaseListsModal.model" v-if="releaseListsModal.model" :empty-msg="$t('common.nodata')">
        <let-table-column :title="$t('imageService.form.Image')" prop="Image" width="40%"></let-table-column>
        <let-table-column :title="$t('imageService.form.CreatePerson')" prop="CreatePerson"  width="10%"></let-table-column>
        <let-table-column :title="$t('imageService.form.CreateTime')" prop="CreateTime" width="15%"></let-table-column>
        <let-table-column :title="$t('imageService.form.Mark')" prop="Mark"></let-table-column>
        <let-table-column :title="$t('operate.operates')" width="15%">
          <template slot-scope="scope">
            <let-table-operation @click="editReleaseItem(scope.row)">{{$t('operate.view')}}</let-table-operation>
            <let-table-operation @click="removeReleaseItem(scope.row)">{{$t('operate.delete')}}</let-table-operation>
          </template>
        </let-table-column>
      </let-table>
    </let-modal>

    <let-modal
      v-model="releaseModal.show"
      :title="releaseModal.isNew ? this.$t('dialog.title.add') : this.$t('dialog.title.edit')"
      width="600px"
      @on-confirm="saveReleaseItem"
      @on-cancel="closeReleaseModal"
    >
      <let-form ref="releaseForm" v-if="releaseModal.model">
        <let-form-item :label="$t('imageService.form.Image')" required>
          <let-input
            size="small"
            v-model="releaseModal.model.Image"
            :placeholder="$t('imageService.form.ImageHolder')"
            required
            :required-tip="$t('imageService.form.ImageTips')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('imageService.form.Secret')">
          <let-input
            size="small"
            v-model="releaseModal.model.Secret"
            :placeholder="$t('imageService.form.SecretTips')"
            required
            :required-tip="$t('imageService.form.SecretTips')"
          ></let-input>
        </let-form-item>
        <let-form-item :label="$t('imageService.form.Mark')" required>
          <let-input
            size="small"
            v-model="releaseModal.model.Mark"
            :placeholder="$t('imageService.form.Mark')"
          >
          </let-input>
        </let-form-item>
      </let-form>
    </let-modal>

  </div>
</template>

<script>

import moment from 'moment';
export default {
  name: 'OperationImage',

  data() {
    return {
      //base镜像信息list
      baseLists: [],
      SupportedType: ['cpp','nodejs','java-war','java-jar','go' ],
      //base详细信息(add/update)
      baseModal: {
        show: false,
        model: null, 
        isNew: false
      },
      //base下每个image的release信息
      releaseListsModal: {
        Name: '',
        show: false,
        model: null,
        isNew: false
      },
      //每个release的修改信息
      releaseModal: {
        Name: '',
        show: false,
        model: null, 
        isNew: false        
      }
    };
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    fetchData() {
      const loading = this.$refs.table.$loading.show();

      return this.$ajax.getJSON('/k8s/api/image_select', {
      }).then((data) => {
        loading.hide();
        this.baseLists = data.Data;

        this.baseLists.forEach(image=>{
          image.SupportedTypeShow = image.SupportedType.join(', ');
          image.CreateTime = moment(image.CreateTime).format("YYYY-MM-DD HH:mm:ss");
        })
        
      }).catch((err) => {
        loading.hide();
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },
    SupportedTypeChange(val) {
      if(this.baseModal.model.SupportedType.indexOf(val) > -1){
        this.baseModal.model.SupportedType.splice(this.baseModal.model.SupportedType.indexOf(val), 1)
      }else{
        this.baseModal.model.SupportedType.push(val)
      }
    },
    addItem() {
      this.baseModal.model = {
        SupportedType: []
      };
      this.baseModal.show = true;
      this.baseModal.isNew = true;
    },
    fetchReleaseData(Name) {

      const loading = this.$refs.table.$loading.show();

      return this.$ajax.getJSON('/k8s/api/image_release_select', { Name: Name} ).then((data) => {
        loading.hide();
        this.releaseListsModal.Name = Name;
        this.releaseListsModal.model = data.Data;

        this.releaseListsModal.model.forEach(release=>{
          release.CreateTime = moment(release.CreateTime).format("YYYY-MM-DD HH:mm:ss");
          release.Name = Name;
        });

      }).catch((err) => {
        loading.hide();
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });

    },
    viewItem(d) {

      this.fetchReleaseData(d.Name).then(() => {
        this.releaseListsModal.show = true;
      });

    },

    editItem(d) {
      this.baseModal.model = d;
      this.baseModal.show = true;
      this.baseModal.isNew = false;
    },
    removeItem(d) {
      const loading = this.$refs.table.$loading.show();
      this.$confirm(this.$t('imageService.delete.confirmTips'), this.$t('common.alert')).then(() => {

        return this.$ajax.postJSON('/k8s/api/image_delete', {Name: d.Name
        }).then((data) => {
          loading.hide();
          this.baseLists = data.Data;
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      }).catch(() => {});
    },
    closeDetailModal() {
      this.$refs.detailForm.resetValid();
      this.baseModal.show = false;
      this.baseModal.model = null;
    },

    saveItem() {
      if (this.$refs.detailForm.validate()) {
        const model = this.baseModal.model;

        const loading = this.$Loading.show();

        const url = model.Name ? '/k8s/api/image_update' : '/k8s/api/image_create';

        this.$ajax.postJSON(url, model).then(() => {
          loading.hide();
          this.fetchData().then(() => {
            this.baseModal.show = false;
            this.$tip.success(this.$t('common.success'));
          });
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      }
    },

    addReleaseItem(Name) {

      this.releaseModal.model = {Name: Name};
      this.releaseModal.show = true;
      this.releaseModal.isNew = true;
    },

    closeReleaseModal() {
      this.$refs.releaseForm.resetValid();
      this.releaseModal.show = false;
      this.releaseModal.model = null;
    },

    editReleaseItem(d) {
      
      this.releaseModal.model = d;
      this.releaseModal.show = true;
      this.releaseModal.isNew = false;
    },

    removeReleaseItem(d) {

      this.$confirm(this.$t('imageService.delete.confirmTips'), this.$t('common.alert')).then(() => {
        const loading = this.$Loading.show();
        this.$ajax.postJSON('/k8s/api/image_release_delete', { Name: d.Name, Id: d.Id}).then(() => {
          loading.hide();
          this.fetchReleaseData(d.Name).then(() => {
            this.$tip.success(this.$t('common.success'));
          });
        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      }).catch(() => {});
    },

    saveReleaseItem() {
      if (this.$refs.releaseForm.validate()) {

        const model = this.releaseModal.model;

        const loading = this.$Loading.show();
        this.$ajax.postJSON('/k8s/api/image_release_create', model).then(() => {

          loading.hide();

          this.$tip.success(this.$t('common.success'));

          this.fetchReleaseData(model.Name);

          this.releaseModal.show = false;

        }).catch((err) => {
          loading.hide();
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        });
      }
    },
  },
};
</script>

<style>
.page_operation_approval {
  pre {
    color: #909FA3;
    margin-top: 32px;
  }

  .let_modal__body {
    overflow-y: visible;
  }

  .let_modal__body .let-form .let-box .let-form-item:last-child {
    margin-bottom:20px;
  }
}
</style>
