<template>
  <div class="set_inputer">
    <div class="set_inputer_item">
      <let-input
        ref="name"
        size="small"
        :value="name"
        @input="updaters.name"
        :placeholder="$t('common.set.setName')"
        :disabled="!enabled"
        :required="enabled"
        :required-tip="$t('deployService.form.setNameFormatTips')"
        :pattern="enabled ? '^[a-z]+$' : null"
        :pattern-tip="$t('deployService.form.setNameFormatTips')"
      ></let-input>
    </div>
    <div class="set_inputer_item">
      <let-input
        ref="area"
        size="small"
        :value="area"
        @input="updaters.area"
        :placeholder="$t('common.set.setArea')"
        :disabled="!enabled"
        :required="enabled"
        :required-tip="$t('deployService.form.setAreaTips')"
        :pattern="enabled ? '^[a-z]+$' : null"
        :pattern-tip="$t('deployService.form.setAreaFormatTips')"
      ></let-input>
    </div>
    <div class="set_inputer_item">
      <let-input
        ref="group"
        size="small"
        :value="group"
        @input="updaters.group"
        :placeholder="$t('common.set.setGroup')"
        :disabled="!enabled"
        :required="enabled"
        :required-tip="$t('deployService.form.setGroupTips')"
        :pattern="enabled ? '^(\\d+|\\*)$' : null"
        :pattern-tip="$t('deployService.form.setGroupFormatTips')"
      ></let-input>
    </div>
    <let-checkbox
      class="set_inputer_switch"
      :value="enabled"
      @input="updaters.enabled"
      @change="onEnabledChange"
    >{{$t('serverList.table.th.enableSet')}}
    </let-checkbox>
  </div>
</template>

<script>
  export default {
    props: {
      enabled: Boolean,
      name: String,
      area: String,
      group: [Number, String],
    },

    created() {
      this.updaters = {
        name: this.updater('name'),
        area: this.updater('area'),
        group: this.updater('group'),
        enabled: this.updater('enabled'),
      };
    },

    methods: {
      updater(name) {
        return value => this.$emit(`update:${name}`, value);
      },
      onEnabledChange() {
        this.$nextTick(() => {
          if (!this.enabled) {
            this.updaters.name('');
            this.$refs.name.resetValid();

            this.updaters.area('');
            this.$refs.area.resetValid();

            this.updaters.group('');
            this.$refs.group.resetValid();
          }
        });
      },
    },
  };
</script>

<style>
  .set_inputer {

  &
  _item {
    float: left;
    margin-right: 8px;
    width: 126px;
  }

  &
  _switch {
    float: right;
  }

  }
</style>
