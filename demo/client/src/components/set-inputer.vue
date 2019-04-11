<template>
  <div class="set_inputer">
    <div class="set_inputer_item">
      <let-input
        ref="name"
        size="small"
        :value="name"
        @input="updaters.name"
        placeholder="Set名,全英文小写"
        :disabled="!enabled"
        :required="enabled"
        required-tip="Set名必须为全英文小写"
        :pattern="enabled ? '^[a-z]+$' : null"
        pattern-tip="Set名必须为全英文小写"
      ></let-input>
    </div>
    <div class="set_inputer_item">
      <let-input
        ref="area"
        size="small"
        :value="area"
        @input="updaters.area"
        placeholder="Set地区,全英文小写"
        :disabled="!enabled"
        :required="enabled"
        required-tip="Set地区不能为空"
        :pattern="enabled ? '^[a-z]+$' : null"
        pattern-tip="Set地区必须为全英文小写"
      ></let-input>
    </div>
    <div class="set_inputer_item">
      <let-input
        ref="group"
        size="small"
        :value="group"
        @input="updaters.group"
        placeholder="Set组名,数字或*号"
        :disabled="!enabled"
        :required="enabled"
        required-tip="Set组名不能为空"
        :pattern="enabled ? '^\d+|*$' : null"
        pattern-tip="Set组名必须为数字或*号"
      ></let-input>
    </div>
    <let-checkbox
      class="set_inputer_switch"
      :value="enabled"
      @input="updaters.enabled"
      @change="onEnabledChange"
    >启用Set</let-checkbox>
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

  &_item {
    float: left;
    margin-right: 8px;
    width: 126px;
  }

  &_switch {
    float: right;
  }
}
</style>
