<template>
  <section class="page_operation_create_module">

    <let-form
      inline
      ref="detailForm"
    >
      <let-form-item :label="$t('apply.title')" itemWidth="240px" required>
        <let-select
          size="small"
          v-model="model.apply_id"
          required
          :required-tip="$t('deployService.table.tips.empty')"
        >
          <let-option v-for="d in applys" :key="d.id" :value="d.id">
            {{d.name}}
          </let-option>
        </let-select>
      </let-form-item>
      <let-form-item :label="$t('module.cacheType')" itemWidth="240px" required>
        <let-select
          size="small"
          v-model="type"
          required
          :required-tip="$t('deployService.table.tips.empty')"
        >
          <let-option v-for="d in types" :key="d.key" :value="d.key">
            {{d.value}}
          </let-option>
        </let-select>
      </let-form-item>
      <let-form-item :label="$t('module.follower')" itemWidth="240px" required>
        <let-input
          size="small"
          v-model="model.follower"
          required
          :required-tip="$t('deployService.table.tips.empty')"
        >
        </let-input>
      </let-form-item>
      <div>
        <let-button size="small" theme="primary" @click="createModule">{{$t('common.nextStep')}}</let-button>
      </div>
    </let-form>
  </section>
</template>

<script>
  import Ajax from '@/plugins/ajax'

  const getInitialModel = () => ({
    apply_id: '',
    follower: '',
    cache_version: '',
    mkcache_struct: ''
  });
  const types = [
    {key: "1-0", value: 'key-value(KVCache)'},
    {key: "2-1", value: 'k-k-row(MKVCache)'},
    {key: "2-2", value: 'Set(MKVCache)'},
    {key: "2-3", value: 'List(MKVCache)'},
    {key: "2-4", value: 'Zset(MKVCache)'},
  ];
  export default {
    data () {
      return {
        model: getInitialModel(),
        applys: [],
        types,
      }
    },
    computed: {
      type: {
        get () {
          if (!this.model.cache_version) return '';
          return this.model.cache_version + '-' + this.model.mkcache_struct
        },
        set (type) {
          let cacheVersionArr = type.split('-');
          this.model.cache_version = cacheVersionArr[0];
          this.model.mkcache_struct = cacheVersionArr[1];
        }
      }
    },
    methods: {
      createModule () {
        if (this.$refs.detailForm.validate()) {
          const model = this.model;
          const url = '/server/api/add_module_base_info';
          const loading = this.$Loading.show();
          this.$ajax.postJSON(url, model).then((data) => {
            loading.hide();
            this.$tip.success(this.$t('common.success'));
            this.$router.push('/operation/module/moduleConfig/' + data.id)
          }).catch((err) => {
            loading.hide();
            this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
          });
        }
      }
    },
    beforeRouteEnter (to, from, next) {
      Ajax.getJSON('/server/api/get_apply_list').then((applys) => {
        if (applys.length) {
          next(vm => {
            vm.applys = applys
          })
        } else {
          next(vm => {
            vm.$tip.warning(`${vm.$t('common.warning')}: ${vm.$t('module.createApplyTips')}`);
            vm.$router.push('/operation/apply/createApply')
          })
        }
      }).catch((err) => {
        alert(err.message || err.err_msg);
      });
    }
  }
</script>

<style>

</style>
