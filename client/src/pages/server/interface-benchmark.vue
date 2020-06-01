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
    <let-table :data="fnList" title="函数列表" empty-msg="无函数记录" :row-class-name="fnRowClassName">
        <let-table-column title="接口" prop="interface" width="60px"></let-table-column>
        <let-table-column title="函数名称" prop="name" width="120px"></let-table-column>
        <let-table-column title="返回类型" prop="return" width="120px"></let-table-column>
        <let-table-column title="输入参数" prop="inParams"></let-table-column>
        <let-table-column title="输出参数" prop="outParams"></let-table-column>
        <let-table-column :title="$t('operate.operates')" width="60px">
        <template slot-scope="scope">
            <let-table-operation @click="queryCase(scope.row)">用例</let-table-operation>
        </template>
        </let-table-column>
    </let-table>
    <!-- 3. 压测函数的用例列表 -->
    <wrapper  v-if="showCase">
        <let-button size="small" theme="primary" class="add-btn" @click="initCaseContentForm">添加用例</let-button>
        <let-table :data="bmCaseList" :title="currentFn.interface+'.'+currentFn.name+' 用例列表'" empty-msg="无用例记录">
            <let-table-column title="描述" prop="des"></let-table-column>
            <let-table-column title="参数" prop="in_values"></let-table-column>
            <let-table-column :title="$t('operate.operates')" width="240px">
              <template slot-scope="scope">
                  <let-table-operation @click="initCaseContentForm(scope.row)">修改</let-table-operation>
                  <let-table-operation @click="initCaseConfigForm(scope.row)">测试</let-table-operation>
                  <let-table-operation @click="initCaseConfigForm(scope.row)">压测</let-table-operation>
                  <let-table-operation @click="queryResult(scope.row)">查看结果</let-table-operation>
                  <let-table-operation @click="deleteBmCase(scope.row)">删除</let-table-operation>
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
      title="压测用例"
      width="700px"
      @on-confirm="upsertCaseContent">
      <let-form itemWidth="100%">
        <let-form-item label="用例描述">
          <let-input size="small" v-model="caseModel.des"></let-input>
        </let-form-item>
        <let-form-item label="输入参数">
          {{currentFn.inParams}}
        </let-form-item>
        <let-form-item label="输入参数值">
          <let-input size="small" type="textarea" v-model="caseModel.in_values"></let-input>
          <a target="_blank" href="https://github.com/TarsCloud/TarsDocs/blob/master/benchmark/tars-guide.md">
            <let-table-operation>参数生成说明</let-table-operation>
          </a>
        </let-form-item>
      </let-form>
    </let-modal>
    <!-- 5.修改用例压测配置弹窗 -->
    <let-modal
      :footShow = "false"
      v-model="upsertCaseConfigModal"
      ref="startBm"
      title="压测参数"
      width="700px">
      <let-form itemWidth="100%">
        <let-form-item label="servant">
          <let-input disabled size="small" v-model="caseModel.servant"></let-input>
        </let-form-item>
        <let-form-item label="节点列表">
          <let-checkbox v-for="(value, name) in endpoints" v-model="endpoints[name]" :key="name" class="checkbox_endpoint_item">{{name}}</let-checkbox>
          <let-input size="small" type="textarea" placeholder="其它(例如：tcp -h 192.168.10.4 -t 60000 -p 3031，多个以换行分隔)" v-model="caseModel.endpoints"></let-input>
        </let-form-item>
        <let-form-group inline label-position="top">
           <let-form-item label="单endpoint连接数" :size="5">
            <let-input type="number" size="small" v-model="caseModel.links" required></let-input>
          </let-form-item>
          <let-form-item label="单endpoint速率" :size="5">
            <let-input  type="number" size="small" v-model="caseModel.speed" required></let-input>
          </let-form-item>
          <let-form-item label="压测时长(s)" :size="5">
            <let-input  type="number" size="small" v-model="caseModel.duration" required></let-input>
          </let-form-item>
           <let-form-item :size="5">
            <let-button @click="execBenchmark('test')" theme="primary" class="start_bm">接口测试</let-button>
            <let-button @click="upsertCaseConfig" theme="primary" class="start_bm">开始压测</let-button>
            <let-button @click="upsertCaseConfigModal = false" class="cancel_bm">取消</let-button>
          </let-form-item>
          <let-form-item v-if="testResultModal" label="测试结果" :size="5">
            <div> {{testResult.errmsg || testResultRsp}} </div>
          </let-form-item>
        </let-form-group>
      </let-form>
    </let-modal>
    <!-- 6.查看结果弹窗 -->
    <let-modal
      :footShow = "false"
      v-model="resultModal"
      :title="result.fn+'压测结果'"
      width="1300px">
      <wrapper>
        <div class="result_op">
          <let-button v-if="result.status == 0" @click="initCaseConfigForm(currentCase)" size="small" theme="success"  class="bmop-btn">启动压测</let-button>
          <let-button  v-if="result.status == 1" @click="execBenchmark('stop')" size="small" theme="danger"  class="bmop-btn">停止压测</let-button>
          <let-button size="small" theme="sub-primary" class="bmop-btn" @click="getResultById(result.id)">刷新<span v-if="result.status == 1">({{nextRefresh}}s)</span></let-button>
        </div>
        <div class="result_select">
          <let-radio v-model="resultMode" label="detail">详细指标</let-radio>
          <let-radio v-model="resultMode" label="chart">区间分布</let-radio>
        </div>
        <let-table v-if="resultMode=='detail'" :data="result.results" empty-msg="暂无压测结果" style="height:500px;overflow:auto">
          <let-table-column title="时间" prop="time_stamp" width="150px" align="center">
              <template slot-scope="{row}">
                <span>{{formatDate(row.time_stamp*1000)}}</span>
              </template>
          </let-table-column>
          <!-- <let-table-column title="时间点(s)" prop="total_time" width="60px" align="center"></let-table-column> -->
          <let-table-column title="qps" prop="avg_speed" width="70px" align="center"></let-table-column>
          <let-table-column title="总量" prop="total_request" width="70px" align="center"></let-table-column>
          <let-table-column title="成功" prop="succ_request" width="70px" align="center"></let-table-column>
          <let-table-column title="失败" prop="fail_request" width="70px" align="center"></let-table-column>
          <let-table-column title="成功率" width="80px" align="center">
            <template slot-scope="{row}">
                <span>{{(100*row.succ_request/row.total_request).toFixed(2)}}%</span>
            </template>
          </let-table-column>
          <let-table-column title="最大耗时(ms)" prop="max_time" width="80px" align="center"></let-table-column>
          <let-table-column title="最小耗时(ms)" prop="min_time" width="80px" align="center"></let-table-column>
          <let-table-column title="平均耗时(ms)" width="80px" align="center">
            <template slot-scope="{row}">
                <span>{{(row.total_time/row.total_request).toFixed(2)}}</span>
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
          <let-table-column title="发送字节" prop="send_bytes" width="80px" align="center"></let-table-column>
          <let-table-column title="接收字节" prop="recv_bytes" width="80px" align="center"></let-table-column>
        </let-table>
        <div v-if="resultMode=='chart'" class="return_chart">
          <ve-pie :legend="returnChartOptions.legend" :title="returnChartOptions.title" :data="returnChartOptions" width="50%"></ve-pie>
          <ve-pie :legend="costChartOptions.legend" :title="costChartOptions.title" :data="costChartOptions" width="50%"></ve-pie>
        </div>
      </wrapper>

    </let-modal>
  </div>
</template>

<script>
  import VePie from 'v-charts/lib/pie';
  import wrapper from '@/components/section-wrappper';
  import { formatDate } from '@/lib/date';
  const CASE_CONTENT = { id:-1, des:"", in_values:"" }
  //const CASE_CONFIG = {id:-1, servant:"", endpoints:"",links:1, speed: 1, duration:20}
  const POLLING_INTERVAL = 5000

  export default {
    name: 'InterfaceBenchmark',
    components: {
      wrapper,VePie
    },
    data(){
        return {
            showCase: false,
            upsertCaseContentModal:false,
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
          if(row){
            this.caseModel = Object.assign({}, row)
          } else {
            this.caseModel = Object.assign({}, CASE_CONTENT)
          }
          this.upsertCaseContentModal = true
        },
        //init edit form value of config
        initCaseConfigForm(row){
          if(!row){
            return
          }
          this.currentCase = row
          this.testResult = {}
          this.testResultModal = false
          this.caseModel = Object.assign({}, row)
          if(!this.caseModel.links) this.caseModel.links=1
          if(!this.caseModel.speed) this.caseModel.speed=1
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
             this.$Notice({ title: "缺少参数", type: "error" })
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
            console.log("endpoint:",endpoint, " checked:", this.endpoints[endpoint])
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
          this.$confirm("确认删除此用例？", this.$t('common.alert')).then(() => {
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
        return this.pieFromResult("耗时区间分布", "返回值","数量","cost_map")
      },
      returnChartOptions(){
        return this.pieFromResult("返回值分布", "返回值","数量","ret_map")
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
.let-table tr.current_fn td {
    background: #778cf5 !important;
    color: #fff !important;
}
.let-table tr.current_fn td .let-table__operation{
  color: #fff;
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
}
.checkbox_endpoint_item{
  display: block;
}
</style>