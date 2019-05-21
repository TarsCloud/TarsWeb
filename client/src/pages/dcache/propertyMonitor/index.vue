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
        <tars-form-item :label="$t('module.name')" @onLabelClick="groupBy('moduleName')">
          <let-input size="small" v-model="query.moduleName"></let-input>
        </tars-form-item>
        <tars-form-item :label="$t('service.serverName')" @onLabelClick="groupBy('serverName')">
          <let-input size="small" v-model="query.serverName"></let-input>
        </tars-form-item>
        <let-form-item>
          <let-button size="small" type="submit" theme="primary">{{$t('operate.search')}}</let-button>
        </let-form-item>
      </let-form-group>
    </let-form>

    <!--    <compare-chart ref="chart" class="chart" v-bind="chartOptions" v-if="showChart"></compare-chart>-->
    <let-row ref="charts" class="charts" v-if="showChart">
      <let-col v-for="d in charts" :key="d.title" :span="12">
        <compare-chart v-bind="d" v-if="allItems.length > 0"></compare-chart>
      </let-col>
    </let-row>

    <hours-filter v-model="hour"></hours-filter>

    <div style="width: 1200px; overflow-x: auto;padding-bottom:20px;">
      <let-table ref="table" :data="pagedItems" :empty-msg="$t('common.nodata')" stripe>
        <let-table-column :title="$t('common.time')" prop="show_time" width="80px"></let-table-column>
        <let-table-column :title="$t('module.name')" prop="moduleName" width=""></let-table-column>
        <let-table-column :title="$t('service.serverName')" prop="serverName" width="150px"></let-table-column>
        <template v-for="item in keys">
          <let-table-column :title="$t('monitor.table.curr') + ' ' + item" :prop="`the_${item}`" ></let-table-column>
          <let-table-column :title="$t('monitor.table.contrast') + ' ' + item" :prop="`pre_${item}`" ></let-table-column>
        </template>
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
  </div>
</template>

<script>
  import {formatDate, ONE_DAY} from '@/lib/date';
  import HoursFilter from '@/components/hours-filter';
  import CompareChart from '@/components/charts/compare-chart';
  import { queryProperptyData } from '@/dcache/interface.js'

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
          moduleName: treeId.split('.')[1].substr(1),
          serverName: '',
        },
        formatter,
        allItems: [],
        hour: -1,
        page: 1,
        showChart: true,
        keys: []
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
      charts() {
        return this.keys.map(item => ({
          title: item,
          timeColumn: 'show_time',
          dataColumns: [
            { name: `the_${item}`, label: this.$t('monitor.table.curr') },
            { name: `pre_${item}`, label: this.$t('monitor.table.contrast') },
          ],
          data: this.allItems,
        }));
      },
    },

    mounted() {
      this.fetchData();
    },

    methods: {
      async fetchData() {
        const chartLoading = this.$refs.charts && this.$refs.charts.$loading.show();
        const tableLoading = this.$refs.table.$loading.show();
        try {
          const { query, query: { group_by, serverName }} = this;
          let option = { ...query };
          if (group_by === 'serverName' && serverName === '' ) option = { ...option, serverName: '*' };
          const { data, keys } = await queryProperptyData(option);
          this.allItems = data;
          this.keys= keys;
        } catch (err) {
          console.error(err);
          this.$tip.error(`${this.$t('common.error')}: ${err.message || err.err_msg}`);
        } finally {
          chartLoading && chartLoading.hide();
          tableLoading.hide();
        }
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

  .let-table {
    th {
      border: 1px solid #ddd;
      word-break: keep-all;
    }
    td {
      word-break: keep-all;
      border: 1px solid #ddd;
    }
  }

  .charts {
    margin-top: 20px;
  }

  .hours-filter {
    margin-bottom: 16px;
  }

  }
</style>
