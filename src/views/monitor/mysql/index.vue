<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
        <el-card>
          <template #header><Monitor style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">基本信息</span></template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%">
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">MySQL版本</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="mysql.info">{{ mysql.info.version }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">连接数</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="mysql.info">{{ mysql.info.threads_connected }} / {{ mysql.info.max_connections }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">QPS</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="mysql.info">{{ mysql.info.qps }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">TPS</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="mysql.info">{{ mysql.info.tps }}</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">运行时间(秒)</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="mysql.info">{{ mysql.info.uptime }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">接收流量</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="mysql.info">{{ formatBytes(mysql.info.bytes_received) }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">发送流量</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="mysql.info">{{ formatBytes(mysql.info.bytes_sent) }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">Buffer Pool</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="mysql.info">{{ formatBytes(mysql.info.buffer_pool_size) }}</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">运行线程</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="mysql.info">{{ mysql.info.threads_running }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">慢查询</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="mysql.info">{{ mysql.info.slow_queries }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">锁等待</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="mysql.info">{{ mysql.info.innodb_row_lock_waits }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">失败连接</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="mysql.info">{{ mysql.info.aborted_connects }}</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <template #header><PieChart style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">命令统计</span></template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="commandstats" style="height: 420px" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <template #header><Odometer style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">连接池信息</span></template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="connectionStats" style="height: 420px" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <template #header><Odometer style="width: 1em; height: 1em; vertical-align: middle;" /> <span style="vertical-align: middle;">Buffer Pool 使用率</span></template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="bufferPoolStats" style="height: 420px" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Mysql">
import { getMysql } from '@/api/monitor/mysql';
import * as echarts from 'echarts';
import { ref, getCurrentInstance } from 'vue';

const mysql = ref({});
const commandstats = ref(null);
const connectionStats = ref(null);
const bufferPoolStats = ref(null);
const { proxy } = getCurrentInstance();

function formatBytes(value) {
  if (!value) return '0 B';
  var unit = 1024;
  var units = ['B', 'KB', 'MB', 'GB', 'TB'];
  var i = 0;
  while (value > unit) {
    value = value / unit;
    i++;
  }
  return parseFloat(value).toFixed(2) + ' ' + units[i];
}

function getList() {
  proxy.$modal.loading("正在加载MySQL监控数据，请稍候！");
  getMysql().then(response => {
    proxy.$modal.closeLoading();
    mysql.value = response.data;

    const commandstatsIntance = echarts.init(commandstats.value, "macarons");
    commandstatsIntance.setOption({
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      series: [
        {
          name: "命令",
          type: "pie",
          roseType: "radius",
          radius: [15, 95],
          center: ["50%", "38%"],
          data: response.data.commandStats,
          animationEasing: "cubicInOut",
          animationDuration: 1000
        }
      ]
    });
    
    const connectionInstance = echarts.init(connectionStats.value, "macarons");
    const threadsConnected = parseFloat(mysql.value.info.threads_connected);
    const maxConnections = parseFloat(mysql.value.info.max_connections);
    
    connectionInstance.setOption({
      tooltip: {
        formatter: "{b} <br/>{a} : " + threadsConnected
      },
      series: [
        {
          name: "连接数",
          type: "gauge",
          min: 0,
          max: maxConnections,
          detail: {
            formatter: threadsConnected + " / " + maxConnections
          },
          data: [
            {
              value: threadsConnected,
              name: "当前连接"
            }
          ]
        }
      ]
    })

    const bufferPoolInstance = echarts.init(bufferPoolStats.value, "macarons");
    const pagesTotal = parseFloat(mysql.value.info.innodb_buffer_pool_pages_total);
    const pagesFree = parseFloat(mysql.value.info.innodb_buffer_pool_pages_free);
    const usageRate = pagesTotal > 0 ? ((pagesTotal - pagesFree) / pagesTotal * 100).toFixed(2) : 0;
    
    bufferPoolInstance.setOption({
      tooltip: {
        formatter: "{b} <br/>{a} : " + usageRate + "%"
      },
      series: [
        {
          name: "使用率",
          type: "gauge",
          min: 0,
          max: 100,
          detail: {
            formatter: usageRate + "%"
          },
          data: [
            {
              value: usageRate,
              name: "Buffer Pool"
            }
          ]
        }
      ]
    })

    window.addEventListener("resize", () => {
      commandstatsIntance.resize();
      connectionInstance.resize();
      bufferPoolInstance.resize();
    });
  })
}

getList();
</script>
