<template>
  <div>
      <GatewayObjList @config="config" v-if="!gatewayObj"></GatewayObjList>
    
      <let-tabs v-if="gatewayObj">
        <let-tab-pane :tab="$t('gateway.station')">
          <Station :gatewayObj="gatewayObj"></Station>
        </let-tab-pane>
        <let-tab-pane :tab="$t('gateway.upstream')">
          <Upstream :gatewayObj="gatewayObj"></Upstream>
        </let-tab-pane>
        <let-tab-pane :tab="$t('gateway.globalblack')">
          <BwList :gatewayObj="gatewayObj" :station="globalStation" type="black"></BwList>
        </let-tab-pane>
      </let-tabs>
      <let-button v-if="gatewayObj" @click="switchGateway()" theme="sub-primary">{{$t('gateway.switchGateway')}}</let-button>
  </div>

</template>
<script>
import Station from "./station"
import Upstream from "./upstream"
import BwList from "./bwlist"
import GatewayObjList from "./gatewayObjList"

export default {
    name: "Gateway",
    components:{Station, Upstream,BwList, GatewayObjList},
    data(){
      return {
        gatewayObj:"",
        globalStation:{
          f_station_id:""
        }
      }
    },
    methods:{
      config(obj){
        this.gatewayObj = obj
      },
      switchGateway(){
        this.gatewayObj = ""
        localStorage.setItem("gatewayObj", "")
      }
    },
    mounted(){
      let gatewayObj = localStorage.getItem("gatewayObj")
      if(gatewayObj) this.gatewayObj = gatewayObj

    }
}
</script>
<style lang="postcss">
.no_obj_tip{
  text-align: center;
}
.gateway_obj_item{
  margin: 0 0 10px 0;
  color:#3f5ae0;
  cursor: pointer;
}
.add_gateway_obj{
  text-align: center;
  font-size: 24px;
  background: #f9f9f9;
  height:32px;
  line-height: 28px;
  cursor: pointer;
  &:hover{
    background: #f2f2f2;
  }
}
</style>