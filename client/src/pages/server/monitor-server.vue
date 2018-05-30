<template>
  <div class="page_server_server_monitor">
    <let-form inline itemWidth="200px" @submit.native.prevent="search">
      <let-form-item label="显示日期">
        <let-date-picker size="small" v-model="query.thedate" :formatter="formatter"></let-date-picker>
      </let-form-item>
      <let-form-item label="对比日期">
        <let-date-picker size="small" v-model="query.predate" :formatter="formatter"></let-date-picker>
      </let-form-item>
      <let-form-item label="开始时间">
        <let-input size="small" v-model="query.startshowtime"></let-input>
      </let-form-item>
      <let-form-item label="结束时间">
        <let-input size="small" v-model="query.endshowtime"></let-input>
      </let-form-item>
      <tars-form-item label="接口名" @onLabelClick="groupBy('interface_name')">
        <let-input size="small" v-model="query.interface_name"></let-input>
      </tars-form-item>
      <tars-form-item label="主调" @onLabelClick="groupBy('master_name')">
        <let-input size="small" v-model="query.master_name"></let-input>
      </tars-form-item>
      <tars-form-item label="被调" @onLabelClick="groupBy('slave_name')">
        <let-input size="small" v-model="query.slave_name"></let-input>
      </tars-form-item>
      <tars-form-item label="主调IP" @onLabelClick="groupBy('master_ip')">
        <let-input size="small" v-model="query.master_ip"></let-input>
      </tars-form-item>
      <tars-form-item label="被调IP" @onLabelClick="groupBy('slave_ip')">
        <let-input size="small" v-model="query.slave_ip"></let-input>
      </tars-form-item>
      <let-form-item>
        <let-button size="small" type="submit" theme="primary">查询</let-button>
      </let-form-item>
    </let-form>

    <let-row ref="charts" class="charts">
      <let-col v-for="d in charts" :key="d.title" :span="12">
        <compare-chart v-bind="d"></compare-chart>
      </let-col>
    </let-row>

    <hours-filter v-model="hour"></hours-filter>

    <let-table ref="table" :data="pagedItems" empty-msg="暂无数据">
      <let-table-column title="时间点" prop="show_time" width="80px"></let-table-column>
      <let-table-column title="主调" prop="master_name" width=""></let-table-column>
      <let-table-column title="被调" prop="slave_name" width=""></let-table-column>
      <let-table-column title="接口名" prop="interface_name" width=""></let-table-column>
      <let-table-column title="主调IP" prop="master_ip" width=""></let-table-column>
      <let-table-column title="被调IP" prop="slave_ip" width=""></let-table-column>
      <let-table-column prop="the_total_count" align="right">
        <span slot="head" slot-scope="props">当日<br>总流量</span>
      </let-table-column>
      <let-table-column prop="pre_total_count" align="right">
        <span slot="head" slot-scope="props">对比日<br>总流量</span>
      </let-table-column>
      <let-table-column prop="total_count_wave" align="right">
        <span slot="head" slot-scope="props">流量同<br>比波动</span>
      </let-table-column>
      <let-table-column align="right">
        <span slot="head" slot-scope="props">当日<br>平均耗时</span>
        <template slot-scope="props">{{props.row.the_avg_time}}ms</template>
      </let-table-column>
      <let-table-column align="right">
        <span slot="head" slot-scope="props">对比日<br>平均耗时</span>
        <template slot-scope="props">{{props.row.pre_avg_time}}ms</template>
      </let-table-column>
      <let-table-column prop="the_fail_rate" align="right">
        <span slot="head" slot-scope="props">当日<br>异常率</span>
      </let-table-column>
      <let-table-column prop="pre_fail_rate" align="right">
        <span slot="head" slot-scope="props">对比日<br>异常率</span>
      </let-table-column>
      <let-table-column prop="the_timeout_rate" align="right">
        <span slot="head" slot-scope="props">当日<br>超时率</span>
      </let-table-column>
      <let-table-column prop="pre_timeout_rate" align="right">
        <span slot="head" slot-scope="props">对比日<br>超时率</span>
      </let-table-column>

      <let-pagination
        slot="pagination"
        v-if="pageCount"
        :total="pageCount"
        :page="page"
        :sum="itemsCount"
        show-sums
        jump
        @change="changePage"
      ></let-pagination>
    </let-table>
  </div>
</template>

<script>
import { formatDate, ONE_DAY } from '@/lib/date';
import HoursFilter from '@/components/hours-filter';
import CompareChart from '@/components/charts/compare-chart';

const pageSize = 20;
const formatter = 'YYYYMMDD';

export default {
  name: 'ServerPropertyMonitor',

  components: {
    HoursFilter,
    CompareChart,
  },

  data() {
    const treeId = this.$route.params.treeid;

    return {
      query: {
        thedate: formatDate(new Date(), 'YYYYMMDD'),
        predate: formatDate(Date.now() - ONE_DAY, 'YYYYMMDD'),
        startshowtime: '0000',
        endshowtime: '2360',
        master_name: '',
        slave_name: treeId.split('.').map(d => d.replace(/^\d+/, '')).join('.'),
        interface_name: '',
        master_ip: '',
        slave_ip: '',
        group_by: '',
      },
      formatter,
      allItems: [],
      hour: -1,
      page: 1,
    };
  },

  computed: {
    filteredItems() {
      const hour = this.hour;
      return hour >= 0
        ? this.allItems.filter(d => +d.show_time.slice(0, 2) === hour)
        : this.allItems;
    },
    itemsCount() {
      return this.filteredItems.length;
    },
    pageCount() {
      return Math.ceil(this.filteredItems.length / pageSize);
    },
    pagedItems() {
      return this.filteredItems.slice(pageSize * (this.page - 1), pageSize * this.page);
    },
    charts() {
      return [
        {
          title: '总流量',
          timeColumn: 'show_time',
          dataColumns: [
            { name: 'the_total_count', label: '当日总流量' },
            { name: 'pre_total_count', label: '对比日总流量' },
          ],
          data: this.allItems,
        },
        {
          title: '平均耗时',
          timeColumn: 'show_time',
          dataColumns: [
            { name: 'the_avg_time', label: '当日平均耗时' },
            { name: 'pre_avg_time', label: '对比日平均耗时' },
          ],
          data: this.allItems,
        },
        {
          title: '异常率',
          timeColumn: 'show_time',
          dataColumns: [
            { name: 'the_fail_rate', label: '当日异常率' },
            { name: 'pre_fail_rate', label: '对比日异常率' },
          ],
          data: this.allItems,
        },
        {
          title: '超时率',
          timeColumn: 'show_time',
          dataColumns: [
            { name: 'the_timeout_rate', label: '当日超时率' },
            { name: 'pre_timeout_rate', label: '对比日超时率' },
          ],
          data: this.allItems,
        },
      ];
    },
    chartOptions() {
      return {
        title: {
          show: true,
          text: '当日总流量',
        },
        grid: {
          bottom: 40,
          top: 50,
        },
        legend: {
          top: 5,
        },
        settings: {
          labelMap: {
            the_value: '当日特征值',
            pre_value: '对比日特征值',
          },
          scale: [true, false],
        },
        data: {
          columns: ['show_time', 'the_value', 'pre_value'],
          rows: this.allItems,
        },
      };
    },
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    fetchData() {
      const chartLoading = this.$refs.charts.$loading.show();
      const tableLoading = this.$refs.table.$loading.show();
      return this.$ajax.getJSON('/server/api/tarsstat_monitor_data', this.query).then((data) => {
        chartLoading.hide();
        tableLoading.hide();
        this.allItems = data;
      }).catch((err) => {
        chartLoading.hide();
        tableLoading.hide();
        this.$tip.error(`获取数据失败: ${err.message || err.err_msg}`);
      });
    },

    groupBy(name) {
      this.query.group_by = name;
      this.fetchData();
    },

    search() {
      delete this.query.group_by;
      this.fetchData();
    },

    changePage(page) {
      this.page = page;
    },
  },
};
</script>

<style>
.page_server_server_monitor {
  padding-bottom: 20px;

  .charts {
    margin-top: 20px;
  }

  .hours-filter {
    margin-bottom: 16px;
  }
}
</style>
