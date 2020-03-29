<template>
    <let-tabs>
        <let-tab-pane :tab="$t('gateway.station')">
          <Station></Station>
        </let-tab-pane>
        <let-tab-pane :tab="$t('gateway.upstream')">
          <Upstream></Upstream>
        </let-tab-pane>
      </let-tabs>
</template>
<script>
import Station from "./station"
import Upstream from "./upstream"
export default {
    name: "Gateway",
    components:{Station, Upstream}
}
</script>