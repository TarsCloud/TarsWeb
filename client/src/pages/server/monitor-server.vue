<template>
  <div class="page_server_server_monitor">
    <let-form inline itemWidth="200px" @submit.native.prevent="search">
      <let-form-item :label="$t('monitor.search.a')">
        <let-date-picker size="small" v-model="query.thedate" :formatter="formatter"></let-date-picker>
      </let-form-item>
      <let-form-item :label="$t('monitor.search.b')">
        <let-date-picker size="small" v-model="query.predate" :formatter="formatter"></let-date-picker>
      </let-form-item>
      <let-form-item :label="$t('monitor.search.start')">
        <let-input size="small" v-model="query.startshowtime"></let-input>
      </let-form-item>
      <let-form-item :label="$t('monitor.search.end')">
        <let-input size="small" v-model="query.endshowtime"></let-input>
      </let-form-item>
      <tars-form-item :label="$t('monitor.search.interfaceName')" @onLabelClick="groupBy('interface_name')">
        <let-input size="small" v-model="query.interface_name"></let-input>
      </tars-form-item>
      <tars-form-item :label="$t('monitor.search.master')" @onLabelClick="groupBy('master_name')">
        <let-input size="small" v-model="query.master_name"></let-input>
      </tars-form-item>
      <tars-form-item :label="$t('monitor.search.slave')" @onLabelClick="groupBy('slave_name')">
        <let-input size="small" v-model="query.slave_name"></let-input>
      </tars-form-item>
      <tars-form-item :label="$t('monitor.search.masterIP')" @onLabelClick="groupBy('master_ip')">
        <let-input size="small" v-model="query.master_ip"></let-input>
      </tars-form-item>
      <tars-form-item :label="$t('monitor.search.slaveIP')" @onLabelClick="groupBy('slave_ip')">
        <let-input size="small" v-model="query.slave_ip"></let-input>
      </tars-form-item>
      <let-form-item>
        <let-button size="small" type="submit" theme="primary">{{$t('operate.search')}}</let-button>
      </let-form-item>
    </let-form>

    <let-row ref="charts" class="charts" v-if="showChart">
      <let-col v-for="d in charts" :key="d.title" :span="12">
        <compare-chart v-bind="d"></compare-chart>
      </let-col>
    </let-row>

    <hours-filter v-model="hour"></hours-filter>

    <let-table ref="table" :data="pagedItems" :empty-msg="$t('common.nodata')">
      <let-table-column :title="$t('common.time')" prop="show_time" width="80px"></let-table-column>
      <let-table-column :title="$t('monitor.search.master')" prop="master_name" width=""></let-table-column>
      <let-table-column :title="$t('monitor.search.slave')" prop="slave_name" width=""></let-table-column>
      <let-table-column :title="$t('monitor.search.interfaceName')" prop="interface_name" width=""></let-table-column>
      <let-table-column :title="$t('monitor.search.masterIP')" prop="master_ip" width=""></let-table-column>
      <let-table-column :title="$t('monitor.search.slaveIP')" prop="slave_ip" width=""></let-table-column>
      <let-table-column prop="the_total_count" align="right">
        <span slot="head" slot-scope="props">{{$t('monitor.table.curr')}}<br>{{$t('monitor.table.total')}}</span>
      </let-table-column>
      <let-table-column prop="pre_total_count" align="right">
        <span slot="head" slot-scope="props">{{$t('monitor.table.contrast')}}<br>{{$t('monitor.table.total')}}</span>
      </let-table-column>
      <let-table-column prop="total_count_wave" align="right">
        <span slot="head" slot-scope="props">{{$t('monitor.table.fluctuating')}}</span>
      </let-table-column>
      <let-table-column align="right">
        <span slot="head" slot-scope="props">{{$t('monitor.table.curr')}}<br>{{$t('monitor.table.a')}}</span>
        <template slot-scope="props">{{props.row.the_avg_time}}ms</template>
      </let-table-column>
      <let-table-column align="right">
        <span slot="head" slot-scope="props">{{$t('monitor.table.contrast')}}<br>{{$t('monitor.table.a')}}</span>
        <template slot-scope="props">{{props.row.pre_avg_time}}ms</template>
      </let-table-column>
      <let-table-column prop="the_fail_rate" align="right">
        <span slot="head" slot-scope="props">{{$t('monitor.table.curr')}}<br>{{$t('monitor.table.b')}}</span>
      </let-table-column>
      <let-table-column prop="pre_fail_rate" align="right">
        <span slot="head" slot-scope="props">{{$t('monitor.table.contrast')}}<br>{{$t('monitor.table.b')}}</span>
      </let-table-column>
      <let-table-column prop="the_timeout_rate" align="right">
        <span slot="head" slot-scope="props">{{$t('monitor.table.curr')}}<br>{{$t('monitor.table.c')}}</span>
      </let-table-column>
      <let-table-column prop="pre_timeout_rate" align="right">
        <span slot="head" slot-scope="props">{{$t('monitor.table.contrast')}}<br>{{$t('monitor.table.c')}}</span>
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
      showChart: true,
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
          title: this.$t('monitor.table.total'),
          timeColumn: 'show_time',
          dataColumns: [
            { name: 'the_total_count', label: this.$t('monitor.table.curr') },
            { name: 'pre_total_count', label: this.$t('monitor.table.contrast') },
          ],
          data: this.allItems,
        },
        {
          title: this.$t('monitor.table.a'),
          timeColumn: 'show_time',
          dataColumns: [
            { name: 'the_avg_time', label: this.$t('monitor.table.curr') },
            { name: 'pre_avg_time', label: this.$t('monitor.table.contrast') },
          ],
          data: this.allItems,
        },
        {
          title: this.$t('monitor.table.b'),
          timeColumn: 'show_time',
          dataColumns: [
            { name: 'the_fail_rate', label: this.$t('monitor.table.curr') },
            { name: 'pre_fail_rate', label: this.$t('monitor.table.contrast') },
          ],
          data: this.allItems,
        },
        {
          title: this.$t('monitor.table.c'),
          timeColumn: 'show_time',
          dataColumns: [
            { name: 'the_timeout_rate', label: this.$t('monitor.table.curr') },
            { name: 'pre_timeout_rate', label: this.$t('monitor.table.contrast') },
          ],
          data: this.allItems,
        },
      ];
    },
    chartOptions() {
      return {
        title: {
          show: true,
          text: `${this.$t('monitor.table.curr')} ${this.$t('monitor.table.total')}`,
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
            the_value: this.$t('monitor.property.property'),
            pre_value: this.$t('monitor.property.propertyC'),
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
        this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
      });
    },

    groupBy(name) {
      this.query.group_by = name;
      this.showChart = false;
      this.fetchData();
    },

    search() {
      delete this.query.group_by;
      this.showChart = true;
      this.fetchData();
    },

    changePage(page) {
      this.page = page;
    },
  },
};
</script>

<style lang="postcss">
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
