<template>
  <div class="knowledge-graph-container">
    <div class="graph-left">
      <div class="graph-header">
        <div class="title-section">
          <h2><span class="icon-box">🕸️</span> 知识图谱</h2>
          <div class="subtitle"><span class="course-label">当前课程</span> {{ currentCourse || '数据库系统' }}</div>
        </div>
      </div>
      <div class="chart-wrapper">
        <div class="graph-chart" ref="chart"></div>
      </div>
    </div>

    <div class="graph-sidebar">
      <div class="sidebar-section">
        <h3><i class="el-icon-data-analysis"></i> 统计信息</h3>
        <div class="stats">
          <div class="stat-item">
            <div class="stat-icon">
              <i class="el-icon-place"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">节点总数</div>
              <div class="stat-value">{{ nodeCount }}</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <i class="el-icon-connection"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">关系总数</div>
              <div class="stat-value">{{ linkCount }}</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">
              <i class="el-icon-trophy"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">难度分布</div>
              <div class="difficulty-stats">
                <el-progress
                    :percentage="Math.round((difficultyCount.easy / nodeCount) * 100)"
                    :stroke-width="8"
                    :show-text="false"
                    color="#52c41a"
                    class="difficulty-progress easy"
                />
                <div class="difficulty-label">
                  <span class="difficulty-tag easy">简单 {{ difficultyCount.easy }}</span>
                  <span>{{ Math.round((difficultyCount.easy / nodeCount) * 100) || 0 }}%</span>
                </div>
                <el-progress
                    :percentage="Math.round((difficultyCount.medium / nodeCount) * 100)"
                    :stroke-width="8"
                    :show-text="false"
                    color="#faad14"
                    class="difficulty-progress medium"
                />
                <div class="difficulty-label">
                  <span class="difficulty-tag medium">中等 {{ difficultyCount.medium }}</span>
                  <span>{{ Math.round((difficultyCount.medium / nodeCount) * 100) || 0 }}%</span>
                </div>
                <el-progress
                    :percentage="Math.round((difficultyCount.hard / nodeCount) * 100)"
                    :stroke-width="8"
                    :show-text="false"
                    color="#f5222d"
                    class="difficulty-progress hard"
                />
                <div class="difficulty-label">
                  <span class="difficulty-tag hard">困难 {{ difficultyCount.hard }}</span>
                  <span>{{ Math.round((difficultyCount.hard / nodeCount) * 100) || 0 }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar-section">
        <h3><i class="el-icon-aim"></i> 选中节点</h3>
        <div v-if="selectedNode" class="selected-node-info">
          <div class="node-header">
            <div class="node-title">{{ selectedNode.name }}</div>
            <el-tag
                :type="selectedNode.category === 'easy' ? 'success' : selectedNode.category === 'medium' ? 'warning' : 'danger'"
                size="small"
                class="node-difficulty-tag"
            >
              {{ getDifficultyText(selectedNode.category) }}
            </el-tag>
          </div>
          <div class="node-details">
            <div class="detail-item">
              <i class="el-icon-link"></i>
              <span class="detail-label">关联数:</span>
              <span class="detail-value">{{ selectedNodeLinks.length }}</span>
            </div>
            <div class="detail-item">
              <i class="el-icon-chat-dot-square"></i>
              <span class="detail-label">关系类型:</span>
              <div class="relation-tags">
                <el-tag
                    v-for="link in getSelectedNodeRelations()"
                    :key="link.name"
                    size="mini"
                    :style="{backgroundColor: getRelationColor(link.name), color: 'white', border: 'none'}"
                >
                  {{ getRelationText(link.name) }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-selection">
          <i class="el-icon-mouse"></i>
          <p>点击图谱中的节点查看详情</p>
        </div>
      </div>

      <div class="sidebar-section">
        <h3><i class="el-icon-share"></i> 关系类型</h3>
        <div class="relation-types">
          <div v-for="(count, type) in relationTypes" :key="type" class="relation-type-item">
            <div class="relation-type-header">
              <span class="relation-dot" :style="{backgroundColor: getRelationColor(type)}"></span>
              <span class="relation-name">{{ getRelationText(type) }}</span>
              <el-tag size="mini" type="info" class="relation-count">{{ count }}</el-tag>
            </div>
            <el-progress
                :percentage="Math.round((count / linkCount) * 100)"
                :stroke-width="6"
                :show-text="false"
                :color="getRelationColor(type)"
                class="relation-progress"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'KnowledgeGraph',
  props: {
    graphData: {
      type: Object,
      default: () => ({
        nodes: [],
        links: [],
        courseName: '数据库系统'
      })
    },
    courseName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      chart: null,
      selectedNode: null,
      currentCourse: '',
      nodeCount: 0,
      linkCount: 0,
      difficultyCount: {
        easy: 0,
        medium: 0,
        hard: 0
      },
      relationTypes: {},
      selectedNodeLinks: []
    };
  },
  mounted() {
    window.addEventListener('resize', this.resizeChart);
    this.initChart();
 },
  beforeUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
    window.removeEventListener('resize', this.resizeChart);
  },
  watch: {
    graphData: {
      deep: true,
      handler() {
        this.updateStatistics();
        this.updateChart();
      }
    }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chart);
      this.updateStatistics();
      this.updateChart();

      setTimeout(() => {
        this.chart.resize();
      }, 0);

      // 监听节点点击事件
      this.chart.on('click', 'series.graph', (params) => {
        if (params.dataType === 'node') {
          this.handleNodeClick(params.data);
        }
      });
    },

    updateStatistics() {
      const nodes = this.graphData.nodes || [];
      const links = this.graphData.links || [];

      this.nodeCount = nodes.length;
      this.linkCount = links.length;
      this.currentCourse = this.courseName || this.graphData.courseName || '数据库系统';

      // 统计难度分布
      this.difficultyCount = { easy: 0, medium: 0, hard: 0 };
      nodes.forEach(node => {
        if (this.difficultyCount[node.category] !== undefined) {
          this.difficultyCount[node.category]++;
        }
      });

      // 统计关系类型
      this.relationTypes = {};
      links.forEach(link => {
        const type = link.name || 'unknown';
        this.relationTypes[type] = (this.relationTypes[type] || 0) + 1;
      });
    },

    handleNodeClick(nodeData) {
      this.selectedNode = nodeData;
      this.selectedNodeLinks = (this.graphData.links || []).filter(link =>
          link.source === nodeData.id || link.target === nodeData.id
      );
    },

    getSelectedNodeRelations() {
      const relationSet = new Set();
      this.selectedNodeLinks.forEach(link => {
        relationSet.add({ name: link.name });
      });
      return Array.from(relationSet);
    },

    getDifficultyText(category) {
      const map = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
      };
      return map[category] || category;
    },

    getRelationText(type) {
      const map = {
        'prerequisite': '前置关系',
        'related': '相关关系',
        'parent_of': '父子关系',
        'contains': '包含关系',
        'belongs_to': '属于关系',
        'tests': '测试关系'
      };
      return map[type] || type;
    },

    getRelationColor(type) {
      const colors = {
        'prerequisite': '#ff4d4f',
        'related': '#1890ff',
        'parent_of': '#52c41a',
        'contains': '#722ed1',
        'belongs_to': '#fa8c16',
        'tests': '#13c2c2'
      };
      return colors[type] || '#8c8c8c';
    },

    getDifficultyColor(category) {
      const colors = {
        'easy': '#52c41a',
        'medium': '#faad14',
        'hard': '#f5222d'
      };
      return colors[category] || '#1890ff';
    },

    updateChart() {
      if (!this.chart || !this.graphData.nodes) return;

          // 根据节点数量动态调整大小
          const baseSize = 60;

          const nodes = this.graphData.nodes.map(node => ({
            id: node.id,
            name: node.name,
            category: node.category,
            symbolSize: baseSize,
            itemStyle: {
              color: '#F7B568', // Orange fill
              borderColor: '#2D72B7', // Blue border
              borderWidth: 2,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowBlur: 10,
              shadowOffsetY: 3
            },
            label: {
              show: true,
              position: 'inside', // Inside label
              fontSize: 12,
              fontWeight: 'normal',
              color: '#000', // Black text
              formatter: (params) => {
                const maxLength = 6; // shorter for inside
                const name = params.data.name;
                return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
              }
            },
            emphasis: {
              scale: 1.2,
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold'
              },
              itemStyle: {
                 color: '#F7B568',
                 borderColor: '#2D72B7',
                 borderWidth: 3
              }
            }
          })).map(node => {
            // 增加中心节点逻辑
            // 如果节点ID最小或者入度最高，设为中心节点（简单模拟）
            // 这里假设第一个节点是根节点，或者通过名字判断
            if (node.name.includes('课程') || node.name.includes('数据结构')) {
                node.itemStyle = {
                    color: '#EB6A53',
                    borderColor: '#A33825',
                    borderWidth: 2
                };
                node.symbolSize = 80;
            }
            return node;
          });

          const links = this.graphData.links.map(link => ({
            source: link.source,
            target: link.target,
            name: link.name,
            value: link.value || 1,
            lineStyle: {
              color: '#ccc', // Light grey
              width: 1,
              curveness: 0.1,
              type: 'solid',
              opacity: 0.8
            },
            emphasis: {
              lineStyle: {
                width: 2,
                opacity: 1,
                color: '#999'
              }
            }
          }));

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#e8e8e8',
          borderWidth: 1,
          textStyle: {
            color: '#333',
            fontSize: 13
          },
          formatter: (params) => {
            if (params.dataType === 'node') {
              return `
                <div style="margin-bottom: 5px; font-weight: bold; color: #1890ff;">
                  ${params.data.name}
                </div>
                <div>难度: ${this.getDifficultyText(params.data.category)}</div>
              `;
            }
            return `
              <div style="margin-bottom: 5px; font-weight: bold; color: ${this.getRelationColor(params.data.name)};">
                ${this.getRelationText(params.data.name)}
              </div>
              <div>从 ${this.getNodeName(params.data.source)} 到 ${this.getNodeName(params.data.target)}</div>
            `;
          }
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        series: [{
          type: 'graph',
          layout: 'force',
          data: nodes,
          links: links,
          roam: true,
          draggable: true,

          layoutCenter: ['50%', '50%'],
          layoutSize: '90%',   // 关键：限制最大布局范围

          focusNodeAdjacency: true,
          edgeSymbol: ['none', 'arrow'],
          edgeSymbolSize: 10,
          edgeLabel: {
            show: true,
            formatter: (params) => {
              return this.getRelationText(params.data.name);
            },
            fontSize: 10,
            color: '#666'
          },
          lineStyle: {
            color: 'source',
            curveness: 0.2
          },
          emphasis: {
            scale: true,
            focus: 'adjacency',
            label: {
              show: true,
              fontWeight: 'bold'
            },
            lineStyle: {
              width: 3
            }
          },
          force: {
            initLayout: 'circular',
            repulsion: 1000, // Increase repulsion
            edgeLength: [120, 200], // Increase edge length
            gravity: 0.1,
            layoutAnimation: true,
            friction: 0.6
          }
        }]
      };

      this.chart.setOption(option, true);
    },

    getNodeName(nodeId) {
      const node = this.graphData.nodes.find(n => n.id === nodeId);
      return node ? node.name : `节点${nodeId}`;
    },

    resizeChart() {
      if (this.chart) {
        setTimeout(() => {
          this.chart.resize();
        }, 100);
      }
    }
  }
};
</script>

<style scoped>
.knowledge-graph-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 16px;
  gap: 16px;
  box-sizing: border-box;
  overflow: hidden;
}

.graph-left {
  flex: 3;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
  overflow: hidden;
}

.graph-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
  background: linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%);
}

.title-section h2 {
  margin: 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #e6f7ff;
  border-radius: 8px;
  font-size: 20px;
}

.subtitle {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  background: #f4f4f5;
  padding: 4px 12px;
  border-radius: 15px;
  color: #606266;
  font-size: 13px;
}

.course-label {
  background: #409eff;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
  font-weight: 500;
}

.chart-wrapper {
  flex: 1;
  padding: 16px;
  position: relative;
  height: 100%;
  min-height: 0;
}

.graph-chart {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: #fafafa;
}

.graph-sidebar {
  flex: 1;
  min-width: 280px;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.sidebar-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid #f0f0f0;
}

.sidebar-section h3 {
  margin: 0 0 18px 0;
  color: #1890ff;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #1890ff;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: #e6f7ff;
  transform: translateX(4px);
}

.stat-item:nth-child(2) {
  border-left-color: #52c41a;
}

.stat-item:nth-child(3) {
  border-left-color: #faad14;
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.stat-item:nth-child(2) .stat-icon {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
}

.stat-item:nth-child(3) .stat-icon {
  background: linear-gradient(135deg, #faad14 0%, #d48806 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  color: #666;
  font-size: 13px;
  margin-bottom: 4px;
}

.stat-value {
  font-weight: bold;
  color: #1890ff;
  font-size: 24px;
  line-height: 1;
}

.stat-item:nth-child(2) .stat-value {
  color: #52c41a;
}

.difficulty-stats {
  margin-top: 8px;
}

.difficulty-progress {
  margin: 6px 0;
}

.difficulty-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.difficulty-tag {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.difficulty-tag.easy {
  background: #f6ffed;
  color: #52c41a;
}

.difficulty-tag.medium {
  background: #fffbe6;
  color: #faad14;
}

.difficulty-tag.hard {
  background: #fff2f0;
  color: #ff4d4f;
}

.selected-node-info {
  padding: 16px;
  background: linear-gradient(135deg, #f6f9ff 0%, #e6f7ff 100%);
  border-radius: 10px;
  border: 1px solid #bae7ff;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.node-title {
  font-weight: 600;
  font-size: 16px;
  color: #1890ff;
  line-height: 1.4;
  flex: 1;
}

.node-difficulty-tag {
  flex-shrink: 0;
  margin-left: 8px;
}

.node-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.detail-item i {
  color: #1890ff;
  width: 16px;
}

.detail-label {
  color: #666;
  min-width: 60px;
}

.detail-value {
  font-weight: 500;
  color: #333;
}

.relation-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.no-selection {
  padding: 30px 20px;
  text-align: center;
  background: #fafafa;
  border-radius: 10px;
  border: 2px dashed #e8e8e8;
}

.no-selection i {
  font-size: 32px;
  color: #bfbfbf;
  margin-bottom: 10px;
}

.no-selection p {
  color: #999;
  font-size: 13px;
  margin: 0;
}

.relation-types {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.relation-type-item {
  padding: 10px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.relation-type-item:hover {
  background: #f0f7ff;
  transform: translateY(-2px);
}

.relation-type-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.relation-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.relation-name {
  flex: 1;
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.relation-count {
  font-size: 11px;
}

.relation-progress {
  margin-top: 4px;
}

@media (max-width: 1200px) {
  .knowledge-graph-container {
    flex-direction: column;
  }

  .graph-sidebar {
    max-width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sidebar-section {
    flex: 1;
    min-width: 300px;
  }
}

@media (max-width: 768px) {
  .knowledge-graph-container {
    padding: 12px;
  }

  .graph-header {
    padding: 16px;
  }

  .sidebar-section {
    min-width: 100%;
  }

  .stat-value {
    font-size: 20px;
  }
}

/* 自定义滚动条 */
.graph-sidebar::-webkit-scrollbar {
  width: 6px;
}

.graph-sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.graph-sidebar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.graph-sidebar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>