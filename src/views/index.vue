<template>
  <div class="app-container home">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">在线课程智慧教学平台</h1>
        <p class="hero-subtitle">
          赋能教育，连接未来。集成课程管理、知识图谱、智能测评与全方位监控的一站式教学解决方案。
        </p>
        <div class="hero-tags">
          <el-tag effect="dark" type="success" class="hero-tag">智慧教学</el-tag>
          <el-tag effect="dark" type="warning" class="hero-tag">知识图谱</el-tag>
          <el-tag effect="dark" type="primary" class="hero-tag">全栈监控</el-tag>
        </div>
      </div>
      <div class="hero-image">
        <img src="@/assets/images/login-background.jpg" alt="Hero Image" style="display: none;" /> 
        <!-- Placeholder for illustration if needed, using CSS background mostly -->
        <div class="hero-icon-bg">
          <el-icon><DataAnalysis /></el-icon>
        </div>
      </div>
    </div>

    <div class="features-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="(feature, index) in features" :key="index">
          <el-card class="feature-card" shadow="hover">
            <div class="feature-icon" :style="{ backgroundColor: feature.color }">
              <el-icon><component :is="feature.icon" /></el-icon>
            </div>
            <div class="feature-info">
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-desc">{{ feature.description }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="20" class="dashboard-bottom">
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span><el-icon><InfoFilled /></el-icon> 平台简介</span>
            </div>
          </template>
          <div class="info-content">
            <p>
              本平台致力于打造高效、智能的教学环境。支持教师进行课程全生命周期管理，从班级组建、课程发布到作业批改与考试测评。
              引入<b>知识图谱</b>技术，可视化展示学科知识结构，帮助学生构建系统化知识体系。
              集成<b>MySQL</b>与<b>Redis</b>实时监控，保障系统稳定运行。
            </p>
            <div class="version-info">
              <span>当前版本: v{{ version }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="tech-card">
          <template #header>
            <div class="card-header">
              <span><el-icon><Cpu /></el-icon> 技术选型</span>
            </div>
          </template>
          <div class="tech-group">
            <div class="tech-category">
              <div class="category-title">后端技术</div>
              <div class="tag-group">
                <el-tag effect="plain">Spring Boot</el-tag>
                <el-tag effect="plain" type="success">Spring Security</el-tag>
                <el-tag effect="plain" type="warning">MyBatis Plus</el-tag>
                <el-tag effect="plain" type="info">Jwt</el-tag>
              </div>
            </div>
            
            <div class="tech-category">
              <div class="category-title">前端技术</div>
              <div class="tag-group">
                <el-tag effect="plain">Vue 3</el-tag>
                <el-tag effect="plain" type="success">Element Plus</el-tag>
                <el-tag effect="plain" type="warning">Vite</el-tag>
                <el-tag effect="plain" type="danger">ECharts 5</el-tag>
              </div>
            </div>

            <div class="tech-category">
              <div class="category-title">数据存储</div>
              <div class="tag-group">
                <el-tag effect="plain">MySQL 8</el-tag>
                <el-tag effect="plain" type="danger">Redis</el-tag>
                <el-tag effect="plain" type="warning">Neo4j (图数据库)</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
import { ref } from 'vue'
import { 
  DataAnalysis, 
  Reading, 
  UserFilled, 
  EditPen, 
  Monitor, 
  Connection, 
  Share, 
  Odometer,
  InfoFilled,
  Cpu
} from '@element-plus/icons-vue'

const version = ref('1.0.0')

const features = [
  {
    title: '课程管理',
    description: '支持课程创建、编辑、发布及资源管理，轻松构建在线课堂。',
    icon: 'Reading',
    color: '#409EFF'
  },
  {
    title: '班级与学生',
    description: '便捷的班级分组与学生管理，支持批量导入与人员维护。',
    icon: 'UserFilled',
    color: '#67C23A'
  },
  {
    title: '知识图谱',
    description: '可视化展示知识点关联，构建学科知识网络，辅助深度学习。',
    icon: 'Share',
    color: '#E6A23C'
  },
  {
    title: '作业与考试',
    description: '全流程作业批改与在线考试系统，智能分析学习效果。',
    icon: 'EditPen',
    color: '#F56C6C'
  },
  {
    title: '实验评测',
    description: '在线实验环境与自动评测机制，提升实践动手能力。',
    icon: 'Monitor',
    color: '#909399'
  },
  {
    title: '系统监控',
    description: '集成MySQL、Redis及服务器监控，实时掌握系统健康状态。',
    icon: 'Odometer',
    color: '#00CED1'
  }
]

const modules = [
  { name: '教学管理模块', progress: 100, color: '#409EFF', status: '已就绪' },
  { name: '知识图谱引擎', progress: 90, color: '#E6A23C', status: '优化中' },
  { name: '在线评测系统', progress: 85, color: '#F56C6C', status: '运行中' },
  { name: '运维监控中心', progress: 100, color: '#67C23A', status: '稳定' }
]

function goTarget(url) {
  window.open(url, '__blank')
}
</script>

<style scoped lang="scss">
.home {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);

  .hero-section {
    background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
    border-radius: 12px;
    padding: 40px;
    color: white;
    margin-bottom: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 8px 20px rgba(24, 144, 255, 0.2);
    position: relative;
    overflow: hidden;

    .hero-content {
      z-index: 2;
      max-width: 60%;
    }

    .hero-title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 15px;
      letter-spacing: 1px;
    }

    .hero-subtitle {
      font-size: 16px;
      opacity: 0.9;
      line-height: 1.6;
      margin-bottom: 25px;
    }

    .hero-tags {
      display: flex;
      gap: 10px;
    }

    .hero-tag {
      font-weight: bold;
      border: none;
    }

    .hero-icon-bg {
      position: absolute;
      right: -20px;
      bottom: -40px;
      font-size: 200px;
      opacity: 0.1;
      transform: rotate(-15deg);
      color: white;
    }
  }

  .features-section {
    margin-bottom: 30px;
    
    .feature-card {
      border: none;
      border-radius: 12px;
      transition: all 0.3s;
      height: 100%;
      cursor: pointer;
      margin-bottom: 20px;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
      }

      :deep(.el-card__body) {
        display: flex;
        align-items: flex-start;
        padding: 20px;
      }

      .feature-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        flex-shrink: 0;
        
        .el-icon {
          font-size: 24px;
          color: white;
        }
      }

      .feature-info {
        .feature-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 8px 0;
        }

        .feature-desc {
          font-size: 13px;
          color: #909399;
          margin: 0;
          line-height: 1.5;
        }
      }
    }
  }

  .dashboard-bottom {
    .el-card {
      border-radius: 12px;
      border: none;
      margin-bottom: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    }

    .card-header {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: #303133;

      .el-icon {
        margin-right: 8px;
        color: #409EFF;
      }
    }

    .info-content {
      color: #606266;
      line-height: 1.8;
      font-size: 14px;

      p {
        margin-bottom: 15px;
      }

      .version-info {
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid #EBEEF5;
        font-size: 13px;
        color: #909399;
      }
    }

    .tech-group {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .tech-category {
        .category-title {
          font-size: 14px;
          font-weight: 600;
          color: #606266;
          margin-bottom: 10px;
          border-left: 3px solid #409EFF;
          padding-left: 8px;
        }

        .tag-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          
          .el-tag {
            border-radius: 4px;
          }
        }
      }
    }
  }
}
</style>
