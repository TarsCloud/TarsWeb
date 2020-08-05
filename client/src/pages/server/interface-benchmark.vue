<template>
  <div class="benchmark_wrapper">
    <!-- 1.选择servant -->
    <let-form class="left_align" itemWidth="350px">
        <let-form-item :label="$t('inf.dlg.objName')">
            <let-select size="small"  v-model="servant"  @change="objChange">
                <let-option v-for="item in servantList" :value="item.servant" :key="item.servant"></let-option>
            </let-select>
        </let-form-item>
    </let-form>
    <!-- 2.压测函数列表 -->
    <let-table :data="fnList" :title="$t('inf.benchmark.fnlist')" :empty-msg="$t('inf.benchmark.nofn')" :row-class-name="fnRowClassName">
        <let-table-column :title="$t('inf.benchmark.interface')" prop="interface" width="100px"></let-table-column>
        <let-table-column :title="$t('inf.benchmark.fnname')" prop="name" width="120px"></let-table-column>
        <let-table-column :title="$t('inf.benchmark.returnType')" prop="return" width="120px"></let-table-column>
        <let-table-column :title="$t('inf.benchmark.inParam')">
            <template slot-scope="scope">
              <json-view :maxDepth="0" rootKey="view" colorScheme="dark" :data="JSON.parse(scope.row.inParams)" />
            </template>
        </let-table-column>
        <let-table-column :title="$t('inf.benchmark.outParam')">
           <template slot-scope="scope">
              <json-view :maxDepth="0" rootKey="view" colorScheme="dark" :data="JSON.parse(scope.row.outParams)" />
            </template>
        </let-table-column>
        <let-table-column :title="$t('operate.operates')" width="80px">
          <template slot-scope="scope">
              <let-table-operation @click="queryCase(scope.row)">{{$t('inf.benchmark.case')}}</let-table-operation>
          </template>
        </let-table-column>
    </let-table>
    <!-- 3. 压测函数的用例列表 -->
    <wrapper  v-if="showCase">
        <let-button size="small" theme="primary" class="add-btn" @click="initCaseContentForm">{{$t('inf.benchmark.addCase')}}</let-button>
        <let-table :data="bmCaseList" :title="currentFn.interface+'.'+currentFn.name+' '+$t('inf.benchmark.caselist')" :empty-msg="$t('inf.benchmark.nocase')">
            <let-table-column :title="$t('inf.benchmark.des')" prop="des"></let-table-column>
            <let-table-column :title="$t('inf.benchmark.inputValue')" prop="in_values"></let-table-column>
            <let-table-column :title="$t('operate.operates')" width="240px">
              <template slot-scope="scope">
                  <let-table-operation @click="initCaseContentForm(scope.row)">{{$t('inf.benchmark.modifyCase')}}</let-table-operation>
                  <let-table-operation @click="initCaseConfigForm(scope.row, 'test')">{{$t('inf.benchmark.testCase')}}</let-table-operation>
                  <let-table-operation @click="initCaseConfigForm(scope.row, 'start')">{{$t('inf.benchmark.runCase')}}</let-table-operation>
                  <let-table-operation @click="queryResult(scope.row)">{{$t('inf.benchmark.viewResult')}}</let-table-operation>
                  <let-table-operation @click="deleteBmCase(scope.row)">{{$t('inf.benchmark.deleteCase')}}</let-table-operation>
              </template>
            </let-table-column>
        </let-table>
    </wrapper>
    <div class="mt10">
        <let-button theme="primary" size="small" @click="$parent.showBm=false">{{$t('operate.goback')}}</let-button>
    </div>
    <!-- 4.添加、修改用例弹窗 -->
    <let-modal
      v-model="upsertCaseContentModal"
      :title="$t('inf.benchmark.case')"
      width="700px"
      @on-confirm="upsertCaseContent">
      <let-form itemWidth="100%">
        <let-form-item :label="$t('inf.benchmark.des')">
          <let-input size="small" v-model="caseModel.des"></let-input>
        </let-form-item>
        <let-form-item :label="$t('inf.benchmark.inParam')">
          <json-view :maxDepth="0" rootKey="view" :data="JSON.parse(currentFn.inParams||'{}')" />
        </let-form-item>
        <let-form-item :label="$t('inf.benchmark.inputValue')">
          <let-input size="small" :rows="10" type="textarea" v-model="caseModel.in_values"></let-input>
          <a target="_blank" href="https://github.com/TarsCloud/TarsDocs/blob/master/benchmark/tars-guide.md">
            <let-table-operation>{{$t('inf.benchmark.inputValueDes')}}</let-table-operation>
          </a>
        </let-form-item>
      </let-form>
    </let-modal>
    <!-- 5.修改用例压测配置弹窗 -->
    <let-modal
      :footShow = "false"
      v-model="upsertCaseConfigModal"
      ref="startBm"
      :title="$t('inf.benchmark.bmParams')"
      width="700px">
      <let-form itemWidth="100%" class="start-bm">
        <let-form-item label="servant">
          <let-input disabled size="small" v-model="caseModel.servant"></let-input>
        </let-form-item>
        <let-form-item :label="$t('inf.benchmark.endpoints')">
          <let-checkbox v-for="(value, name) in endpoints" v-model="endpoints[name]" :key="name" class="checkbox_endpoint_item">{{name}}</let-checkbox>
          <let-input size="small" type="textarea" :placeholder="$t('inf.benchmark.endpointsTip')" v-model="caseModel.endpoints"></let-input>
        </let-form-item>
        <let-form-group inline label-position="top">
           <let-form-item v-if="upsertCaseConfigModalName == 'start'" :label="$t('inf.benchmark.links')" :size="5">
            <let-input type="number" size="small" v-model="caseModel.links" required></let-input>
          </let-form-item>
          <let-form-item v-if="upsertCaseConfigModalName == 'start'" :label="$t('inf.benchmark.speed')" :size="5">
            <let-input  type="number" size="small" v-model="caseModel.speed" required></let-input>
          </let-form-item>
          <let-form-item v-if="upsertCaseConfigModalName == 'start'" :label="$t('inf.benchmark.duration')" :size="5">
            <let-input  type="number" size="small" v-model="caseModel.duration" required></let-input>
          </let-form-item>
          <let-form-item v-if="testResultModal" :label="$t('inf.benchmark.testResult')" :size="5">
            <div> {{testResult.errmsg || testResultRsp}} </div>
          </let-form-item>
           <let-form-item :size="5">
            <let-button v-if="upsertCaseConfigModalName == 'test'" @click="execBenchmark('test')" theme="primary" class="start_bm">{{$t('inf.benchmark.infTest')}}</let-button>
            <let-button v-if="upsertCaseConfigModalName == 'start'" @click="upsertCaseConfig" theme="primary" class="start_bm">{{$t('inf.benchmark.startBenchmark')}}</let-button>
            <let-button @click="upsertCaseConfigModal = false" class="cancel_bm">{{$t('inf.benchmark.cancelTest')}}</let-button>
          </let-form-item>
        </let-form-group>
      </let-form>
    </let-modal>
    <!-- 6.查看结果弹窗 -->
    <let-modal
      :footShow = "false"
      v-model="resultModal"
      :title="result.fn + ' - ' + $t('inf.benchmark.testResult')"
      width="1300px">
      <wrapper>
        <div class="result_op">
          <let-button v-if="result.status == 0" @click="initCaseConfigForm(currentCase, 'start')" size="small" theme="success"  class="bmop-btn">{{$t('inf.benchmark.startBenchmark')}}</let-button>
          <let-button  v-if="result.status == 1" @click="execBenchmark('stop')" size="small" theme="danger"  class="bmop-btn">{{$t('inf.benchmark.stopBenchmark')}}</let-button>
          <let-button size="small" theme="sub-primary" class="bmop-btn" @click="getResultById(result.id)">{{$t('inf.benchmark.refresh')}}<span v-if="result.status == 1">({{nextRefresh}}s)</span></let-button>
        </div>
        <div class="result_select">
          <let-radio v-model="resultMode" label="detail">{{$t('inf.benchmark.detail')}}</let-radio>
          <let-radio v-model="resultMode" label="chart">{{$t('inf.benchmark.stat')}}</let-radio>
        </div>
        <let-table v-if="resultMode=='detail'" :data="result.results" empty-msg="data is empty" style="height:500px;overflow:auto">
          <let-table-column :title="$t('inf.benchmark.time')" prop="time_stamp" width="150px" align="center">
              <template slot-scope="{row}">
                <span>{{formatDate(row.time_stamp*1000)}}</span>
              </template>
          </let-table-column>
          <!-- <let-table-column title="时间点(s)" prop="total_time" width="60px" align="center"></let-table-column> -->
          <let-table-column title="qps" prop="avg_speed" width="70px" align="center"></let-table-column>
          <let-table-column :title="$t('inf.benchmark.total')" prop="total_request" width="70px" align="center"></let-table-column>
          <let-table-column :title="$t('inf.benchmark.success')" prop="succ_request" width="70px" align="center"></let-table-column>
          <let-table-column :title="$t('inf.benchmark.fail')" prop="fail_request" width="70px" align="center"></let-table-column>
          <let-table-column :title="$t('inf.benchmark.successRate')" width="80px" align="center">
            <template slot-scope="{row}">
                <span>{{getSuccessRate(row)}}</span>
            </template>
          </let-table-column>
          <let-table-column :title="$t('inf.benchmark.maxCost')" prop="max_time" width="80px" align="center"></let-table-column>
          <let-table-column :title="$t('inf.benchmark.minCost')" prop="min_time" width="80px" align="center"></let-table-column>
          <let-table-column :title="$t('inf.benchmark.avgCost')" width="80px" align="center">
            <template slot-scope="{row}">
                <span>{{row.total_request==0?0:(row.total_time/row.total_request).toFixed(2)}}</span>
            </template>
          </let-table-column>
          <let-table-column title="p90" width="70px" align="center">
             <template slot-scope="{row}">
                <span>{{(row.p90_time).toFixed(2)}}</span>
            </template>
          </let-table-column>
          <let-table-column title="p99" width="70px" align="center">
             <template slot-scope="{row}">
                <span>{{(row.p99_time).toFixed(2)}}</span>
            </template>
          </let-table-column>
          <let-table-column title="p999" width="70px" align="center">
             <template slot-scope="{row}">
                <span>{{(row.p999_time).toFixed(2)}}</span>
            </template>
          </let-table-column>
          <let-table-column :title="$t('inf.benchmark.sendBytes')" prop="send_bytes" width="80px" align="center"></let-table-column>
          <let-table-column :title="$t('inf.benchmark.recvBytes')" prop="recv_bytes" width="80px" align="center"></let-table-column>
        </let-table>
        <div v-if="resultMode=='chart'" class="return_chart">
          <ve-pie :legend="returnChartOptions.legend" :title="returnChartOptions.title" :data="returnChartOptions" width="500px"></ve-pie>
          <ve-pie :legend="costChartOptions.legend" :title="costChartOptions.title" :data="costChartOptions" width="500px"></ve-pie>
        </div>
      </wrapper>

    </let-modal>
  </div>
</template>

<script>
  import VePie from 'v-charts/lib/pie';
  import { JSONView } from 'vue-json-component';
  import wrapper from '@/components/section-wrappper';
  import { formatDate } from '@/lib/date';
  const CASE_CONTENT = { id:-1, des:"", in_values:"" }
  //const CASE_CONFIG = {id:-1, servant:"", endpoints:"",links:1, speed: 1, duration:20}
  const POLLING_INTERVAL = 5000

  export default {
    name: 'InterfaceBenchmark',
    components: {
      wrapper,VePie,"json-view":JSONView
    },
    data(){
        return {
            showCase: false,
            upsertCaseContentModal:false,
            upsertCaseConfigModalName: '',
            upsertCaseConfigModal:false,
            resultModal:false,
            testResultModal:false,

            servant:"",
            currentFn:{},
            currentCase:{},
            resultMode:"detail",
            endpoints:{},
            selectedEndpoints:[],
            fnList:[],
            bmCaseList:[],
            result:{results:[],status:0},
            testResult:{},
            nextRefresh:6,
            nextRefreshTimer:0,
            caseModel:Object.assign({}, CASE_CONTENT)
        }
    },
    methods:{
        formatDate,
        fnRowClassName({row, rowIndex}) {
          if(row == this.currentFn){
            return "current_fn"
          }
          return ""
        },
        getSuccessRate(row){
          let total = row.succ_request+row.fail_request
          if(!total) return '0%'
          return (100*row.succ_request/total).toFixed(2)+'%'
        },
        upsertBmCase(caseInfo){
          const loading = this.$Loading.show();
          caseInfo.servant = this.servant;
          caseInfo.fn = this.currentFn.name;
          this.$ajax.postJSON('/server/api/upsert_bm_case', caseInfo).then(data => {
                loading.hide();
                this.getBenchmarkCaseList()
                this.upsertCaseContentModal = false
                this.upsertCaseConfigModal = false
            }).catch((err) => {
                loading.hide();
                this.upsertCaseContentModal = false
                this.upsertCaseConfigModal = false
                this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
            });
        },
        //init edit form value of content
        initCaseContentForm(row){
          if(row && row.id){
            this.caseModel = Object.assign({}, row)
          } else {
            this.caseModel = Object.assign({}, CASE_CONTENT)
            this.caseModel.in_values = this.currentFn.funInput
          }
          this.upsertCaseContentModal = true
        },
        //init edit form value of config
        initCaseConfigForm(row, mode){
          if(!row){
            return
          }
          this.currentCase = row
          this.testResult = {}
          this.testResultModal = false
          this.caseModel = Object.assign({}, row)
          if(!this.caseModel.links) this.caseModel.links=1
          if(!this.caseModel.speed) this.caseModel.speed=100
          if(!this.caseModel.duration) this.caseModel.duration=20
          let endpoints = this.caseModel.endpoints.split("\n")
          //reset checkbox status
          for(let endpoint in this.endpoints){
            let index = endpoints.indexOf(endpoint)
            if(index > -1){
              this.endpoints[endpoint] = true
              endpoints.splice(index, 1)
            } else {
              this.endpoints[endpoint] = false
            }
          }
          //set the custom endpoints
          this.caseModel.endpoints = endpoints.join("\n")
          this.upsertCaseConfigModalName = mode
          this.upsertCaseConfigModal = true 
          this.resultModal = false
        },
        //run update or init case
        upsertCaseContent(){
          let caseInfo = {}
          if(this.caseModel.id>0) caseInfo.id = this.caseModel.id
          caseInfo.des = this.caseModel.des
          caseInfo.in_values = this.caseModel.in_values
          this.upsertBmCase(caseInfo)
        },
        //run update case config and start benchmark
        upsertCaseConfig(){
          let caseInfo = {}
          caseInfo.id = this.caseModel.id
          caseInfo.links = this.caseModel.links
          caseInfo.speed = this.caseModel.speed
          caseInfo.duration = this.caseModel.duration
          caseInfo.endpoints = this.queryFullEndpoints()
          this.upsertBmCase(caseInfo)
          //let-ui文档缺乏，此处手动检查参数
          if(!caseInfo.endpoints || !this.caseModel.links || !this.caseModel.speed || !this.caseModel.duration){
             this.$Notice({ title: "missing params", type: "error" })
             return
          }
          this.execBenchmark()
        },
        execBenchmark(op = "start"){
          let startParams = {
            caseId: this.currentCase.id,
            servant: this.servant,
            fn: this.currentFn.name
          }
          let path = ""
          switch(op){
            case "start":
              path = "/server/api/start_bencmark"
              startParams.para_input = this.currentFn.inParams
              startParams.para_value = this.currentCase.in_values
              startParams.para_output = this.currentFn.outParams
              startParams.endpoints = this.queryFullEndpoints()
              startParams.links = this.caseModel.links
              startParams.speed = this.caseModel.speed
              startParams.duration = this.caseModel.duration
              break;
            case "stop":
              path = "/server/api/stop_bencmark"
              break;
            case "test":
              path = "/server/api/test_bencmark"
              startParams.para_input = this.currentFn.inParams
              startParams.para_value = this.currentCase.in_values
              startParams.para_output = this.currentFn.outParams
              startParams.endpoints = this.queryFullEndpoints()
              break;
          }
          this.$ajax.postJSON(path, startParams).then(data => {
                if(op == "start") this.queryResult()
                switch(op){
                  case "start":
                    this.result.status = this.currentCase.status = 1
                    this.queryResult()
                    break;
                  case "stop":
                    this.result.status = this.currentCase.status = 0
                    this.stopPollingResult()
                    break;
                  case "test":
                    this.testResult = data
                    this.testResultModal = true
                    break;
                }
            }).catch((err) => {
                this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
            });
        },
        //query endpoints to select
        queryFullEndpoints(){
          //get endpoints from checkbox and textarea
          let endpoints = []
          //from checkbox
          for(let endpoint in this.endpoints){
            // console.log("endpoint:",endpoint, " checked:", this.endpoints[endpoint])
            if(this.endpoints[endpoint]) endpoints.push(endpoint)
          }
          //from textarea
          this.caseModel.endpoints.split("\n").forEach((endpoint)=>{
            endpoints.push(endpoint)
          })
          return Array.from(new Set(endpoints)).filter((item)=>{
            return !!item
          }).join("\n")
        },
        queryResult(row){
          if(row) this.currentCase = row
          this.getResultById(this.currentCase.id)
          this.resultModal = true
        },
        queryCase(row){
          this.showCase = true
          this.currentFn = row
          this.getBenchmarkCaseList()
        },
        getBenchmarkDes(id) {
            this.$ajax.getJSON('/server/api/get_benchmark_des', {
                id : id
            }).then(data => {
                this.fnList = data;
            }).catch((err) => {
                this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
            });
        },
        getBenchmarkCaseList(){
          this.$ajax.getJSON('/server/api/get_bm_case_list', {
                servant : this.servant,
                fn: this.currentFn.name
            }).then(data => {
                this.bmCaseList = data
            }).catch((err) => {
                this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
            });
        },
        getResultById(id){
          this.result.id = id
          this.$ajax.getJSON('/server/api/get_bm_result_by_id', {
                id : id
            }).then(data => {
                data.results = JSON.parse(data.results || "[]")
                data.results.reverse()
                this.result = data
            }).catch((err) => {
                this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
            });
        },
        deleteBmCase(row){
          this.$confirm(this.$t('inf.benchmark.deleteCaseConfirm'), this.$t('common.alert')).then(() => {
            const loading = this.$Loading.show();
            let caseInfo = {}
            caseInfo.id = row.id
            caseInfo.is_deleted = 1
            this.upsertBmCase(caseInfo)
          });
        },
        startPollingResult(){
          this.stopPollingResult()
          this.nextRefreshTimer = setInterval(()=>{
            this.nextRefresh--
            if(this.nextRefresh == 0){
              this.queryResult()
            } else if(this.nextRefresh<0){
              if(this.nextRefresh<0) this.nextRefresh = POLLING_INTERVAL / 1000
            }
          }, 1000)
        },
        stopPollingResult(){
          this.nextRefresh = POLLING_INTERVAL / 1000
          clearInterval(this.nextRefreshTimer)
        },
        objChange(){
          if(!this.servant) return
          this.$ajax.getJSON('/server/api/get_endpoints', {
              servant : this.servant
          }).then(data => {
              this.endpoints = {}
              data.forEach((item)=>{
                this.endpoints[`${item.istcp?'tcp':'udp'} -h ${item.host} -p ${item.port} -t ${item.timeout}`] = false
              })
          }).catch((err) => {
              this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
          });
        },
        pieFromResult(title, field1, field2, mapFieldName){
          let rowsMap = {}
          for(let result of this.result.results){
            if(!result[mapFieldName]) continue
            for(let key in result[mapFieldName]){
              if(!rowsMap[key]) rowsMap[key] = 0
              rowsMap[key] += result[mapFieldName][key]
            }
          }
          let rows = Object.keys(rowsMap).map((key)=>{
            return {
              [field1]: key,
              [field2]: rowsMap[key]
            }
          })
          return {
            title:{
              text: title || ""
            },
            legend: {
              orient: 'vertical',
              top:50,
              right: 0
            },
            columns: [field1, field2],
            rows
          }
        }
    },
    computed:{
      testResultRsp(){
        return (this.testResult.rsp || "").replace(/<br>/g, "\n")
      },
      costChartOptions(){
        return this.pieFromResult(this.$t('inf.benchmark.costStat'), "返回值","数量","cost_map")
      },
      returnChartOptions(){
        return this.pieFromResult(this.$t('inf.benchmark.retStat'), "返回值","数量","ret_map")
      }
    },
    props: {
      servantList: {
        type: Array,
        required: true,
      }
    },
    watch: { 
      	servantList: {
          immediate: true, 
          handler (val, oldVal) {
            if(val.length && !this.servant){
              this.servant = val[0].servant
              this.objChange()
            }
          }
        },
        resultModal(val, oldVal){
          if(val){
            if(this.currentCase.status == 0) return
            this.startPollingResult()
          } else {
            this.stopPollingResult()
          }
        }
    },
    beforeDestory(){
      this.stopPollingResult()
    }
  };
</script>

<style lang="postcss">
/* .let-table tr.current_fn td {
    background: #778cf5 !important;
    color: #fff !important;
}
.let-table tr.current_fn td .let-table__operation{
  color: #fff;
} */
.let-table tr.current_fn {
  border: solid thin #778cf5;
  box-sizing: border-box;
  border-style: double;
}
.start_bm,.cancel_bm{
  width:96px;
}
.start_bm{
  margin-right:20px;
}
.result_op{
  display: flex;
  justify-content: space-between;
}
.bmop-btn{
  width:96px;
  margin: 10px 0;
}
.result_select{
  margin: 10px 0;
}
.return_chart{
  display: flex;
  justify-content:space-around;
}
.checkbox_endpoint_item{
  display: block;
}
.json-view-item.root-item.dark{
  background: #555555;
}
.start-bm .let-form-item label.let-form-item__label{
  width:200px !important;
}
</style>
