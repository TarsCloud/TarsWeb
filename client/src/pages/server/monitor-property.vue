<template>
  <div class="page_server_property_monitor">
    <let-form inline itemWidth="200px" @submit.native.prevent="search">
      <let-form-group>
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
      </let-form-group>
      <let-form-group>
        <tars-form-item :label="$t('monitor.search.master')" @onLabelClick="groupBy('master_name')">
          <let-input size="small" v-model="query.master_name"></let-input>
        </tars-form-item>
        <tars-form-item :label="$t('monitor.search.masterIP')" @onLabelClick="groupBy('master_ip')">
          <let-input size="small" v-model="query.master_ip"></let-input>
        </tars-form-item>
        <tars-form-item :label="$t('monitor.select.property')" @onLabelClick="groupBy('property_name')">
          <let-input size="small" v-model="query.property_name"></let-input>
        </tars-form-item>
        <tars-form-item :label="$t('monitor.select.strategy')" @onLabelClick="groupBy('policy')">
          <let-input size="small" v-model="query.policy"></let-input>
        </tars-form-item>
        <let-form-item>
          <let-button size="small" type="submit" theme="primary">{{$t('operate.search')}}</let-button>
        </let-form-item>
      </let-form-group>
    </let-form>

    <compare-chart ref="chart" class="chart" v-bind="chartOptions" v-if="showChart"></compare-chart>

    <hours-filter v-model="hour"></hours-filter>

    <let-table ref="table" :data="pagedItems" :empty-msg="$t('common.nodata')">
      <let-table-column :title="$t('common.time')" prop="show_time" width="80px"></let-table-column>
      <let-table-column :title="$t('monitor.search.master')" prop="master_name" width=""></let-table-column>
      <let-table-column :title="$t('monitor.search.masterIP')" prop="master_ip" width="150px"></let-table-column>
      <let-table-column :title="$t('monitor.select.property')" prop="property_name" width="150px"></let-table-column>
      <let-table-column :title="$t('monitor.select.strategy')" prop="policy" width="150px"></let-table-column>
      <let-table-column :title="$t('monitor.property.property')" prop="the_value" align="right" width="200px"></let-table-column>
      <let-table-column :title="$t('monitor.property.propertyC')" prop="pre_value" align="right" width="230px"></let-table-column>

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
const dataFormatter = (data) => {
  if (data && data.length > 0) {
    return data.map(item => {
      const result = { ...item };
      const keys = Object.keys(item);
      const preRegex = /^pre_.*/;
      const theRegex = /^the_.*/;
      keys.forEach(key => {
        if (preRegex.test(key) || theRegex.test(key)) {
          if (item[key] === "--") {
            result[key] = "0";
          }
        }
      });
      return result;
    });
  } else {
    return data;
  }
};


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
    chartOptions() {
      return {
        title: this.$t('monitor.table.total'),
        timeColumn: 'show_time',
        dataColumns: [
          { name: 'the_value', label: this.$t('monitor.property.property') },
          { name: 'pre_value', label: this.$t('monitor.property.propertyC') },
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
      const chartLoading = this.$refs.chart && this.$refs.chart.$loading.show();
      const tableLoading = this.$refs.table.$loading.show();
      return this.$ajax.getJSON('/server/api/tarsproperty_monitor_data', this.query).then((data) => {
        chartLoading && chartLoading.hide();
        tableLoading.hide();
        this.allItems = data;
      }).catch((err) => {
        chartLoading && chartLoading.hide();
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
