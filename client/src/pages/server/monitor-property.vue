<template>
  <div class="page_server_property_monitor">
    <let-form inline itemWidth="200px" @submit.native.prevent="search">
      <let-form-group>
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
      </let-form-group>
      <let-form-group>
        <tars-form-item label="服务名" @onLabelClick="groupBy('master_name')">
          <let-input size="small" v-model="query.master_name"></let-input>
        </tars-form-item>
        <tars-form-item label="IP" @onLabelClick="groupBy('master_ip')">
          <let-input size="small" v-model="query.master_ip"></let-input>
        </tars-form-item>
        <tars-form-item label="特性" @onLabelClick="groupBy('property_name')">
          <let-input size="small" v-model="query.property_name"></let-input>
        </tars-form-item>
        <tars-form-item label="策略" @onLabelClick="groupBy('policy')">
          <let-input size="small" v-model="query.policy"></let-input>
        </tars-form-item>
        <let-form-item>
          <let-button size="small" type="submit" theme="primary">查询</let-button>
        </let-form-item>
      </let-form-group>
    </let-form>

    <compare-chart ref="chart" class="chart" v-bind="chartOptions"></compare-chart>

    <hours-filter v-model="hour"></hours-filter>

    <let-table ref="table" :data="pagedItems" empty-msg="暂无数据">
      <let-table-column title="时间点" prop="show_time" width="80px"></let-table-column>
      <let-table-column title="服务名" prop="master_name" width=""></let-table-column>
      <let-table-column title="IP" prop="master_ip" width="150px"></let-table-column>
      <let-table-column title="特性" prop="property_name" width="150px"></let-table-column>
      <let-table-column title="策略" prop="policy" width="150px"></let-table-column>
      <let-table-column title="当日特征值" prop="the_value" align="right" width="150px"></let-table-column>
      <let-table-column title="对比日特征值" prop="pre_value" align="right" width="150px"></let-table-column>

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
        thedate: formatDate(new Date(), formatter),
        predate: formatDate(Date.now() - ONE_DAY, formatter),
        startshowtime: '0000',
        endshowtime: '2360',
        master_name: treeId.split('.').map(d => d.replace(/^\d+/, '')).join('.'),
        master_ip: '',
        property_name: '',
        policy: '',
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
    chartOptions() {
      return {
        title: '总流量',
        timeColumn: 'show_time',
        dataColumns: [
          { name: 'the_value', label: '当日特征值' },
          { name: 'pre_value', label: '对比日特征值' },
        ],
        data: this.allItems,
      };
    },
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    fetchData() {
      const chartLoading = this.$refs.chart.$loading.show();
      const tableLoading = this.$refs.table.$loading.show();
      return this.$ajax.getJSON('/server/api/tarsproperty_monitor_data', this.query).then((data) => {
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
.page_server_property_monitor {
  padding-bottom: 20px;

  .chart {
    margin-top: 20px;
  }

  .hours-filter {
    margin-bottom: 16px;
  }
}
</style>
