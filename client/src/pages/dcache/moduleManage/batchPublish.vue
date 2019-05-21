<template>
  <section style="display: inline">
    <let-button theme="primary" :disabled="disabled" @click="init">{{$t('dcache.nonServerMigration')}}</let-button>
    <let-modal
      v-model="show"
      :footShow="false"
      :closeOnClickBackdrop="true"
      :width="'1000px'"
      :title="$t('dcache.nonServerMigration')"
    >
      abc
    </let-modal>
  </section>
</template>
<script>
  import { transferDCacheGroup, hasOperation } from '@/dcache/interface.js'
  import Mixin from './mixin.js'
  export default {
    mixins: [Mixin],
    props: {
      disabled: Boolean,
      expandServers: {
        required: false,
        type: Array
      },
    },
    data() {
      return {
        show: false,
        groupName: '',
        dstGroupNames: [],
      }
    },
    methods: {
      init() {

      }
    }
  }
</script>
<style lang="postcss">

</style>
