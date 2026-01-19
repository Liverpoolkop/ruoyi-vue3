<template>
  <div class="course-detail-page">
     <portal-navbar />
    <!-- 顶部Banner -->
    <div class="course-banner">
      <div class="main-container">
        <div class="banner-content">
          <div class="cover-wrapper">
            <img :src="detail.courseImg || defaultImg" alt="课程封面" class="course-cover" />
          </div>
          <div class="info-wrapper">
            <h1 class="course-title">{{ detail.courseName }}</h1>
            <div class="course-meta">
              <span class="meta-item"><i class="el-icon-user"></i> 讲师：{{ detail.teacherNames || '未知' }}</span>
              <span class="meta-item"><i class="el-icon-time"></i> 课时：{{ detail.lessonHours || 0 }}课时</span>
            </div>
            <div class="course-desc" :title="detail.courseDesc">
              简介：{{ detail.courseDesc || '暂无简介' }}
            </div>
            <div class="action-btn">
              <el-button 
                v-if="isJoined || isTeacher" 
                type="success" 
                size="large" 
                icon="Check" 
                class="join-btn"
                @click="handleStartLearn"
              >
                {{ isTeacher ? '进入管理 / 预览' : '已加入 / 进入学习' }}
              </el-button>
              <el-button
                v-if="isJoined && !isTeacher"
                type="danger"
                plain
                size="large"
                style="margin-left: 10px;"
                @click="handleQuit"
              >
                退出课程
              </el-button>
              <el-button 
                v-else-if="!isJoined && !isTeacher"
                type="primary" 
                size="large" 
                class="join-btn" 
                @click="handleJoin"
              >
                立即加入
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="main-container content-section" id="content-section">
      <el-row :gutter="20">
        <el-col :span="18">
          <div class="content-left">
            <el-tabs v-model="activeTab" class="course-tabs">
              <el-tab-pane label="课程详情" name="intro">
                <div class="tab-content">
                  <h3>课程介绍</h3>
                  <div class="rich-text" v-html="detail.courseDesc || '暂无详细介绍'"></div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="课程目录" name="chapter">
                <div class="tab-content">
                  <div v-if="chapters && chapters.length > 0">
                    <el-collapse accordion>
                      <el-collapse-item v-for="chapter in chapters" :key="chapter.chapterId" :title="chapter.chapterName" :name="chapter.chapterId">
                        
                        <!-- 1. 显示当前章节下的资源 -->
                        <div v-if="chapter.resources && chapter.resources.length > 0" class="chapter-resources">
                          <div v-for="resource in chapter.resources" :key="resource.resourceId" class="resource-item">
                            <el-icon><Document /></el-icon>
                            <span class="resource-name">{{ resource.resourceName }}</span>
                          </div>
                        </div>

                        <!-- 2. 显示子章节（小节）及其资源 -->
                        <div v-if="chapter.children && chapter.children.length > 0" class="sub-chapters">
                          <div v-for="subChapter in chapter.children" :key="subChapter.chapterId" class="sub-chapter-item">
                            <div class="sub-chapter-title">{{ subChapter.chapterName }}</div>
                            <div v-if="subChapter.resources && subChapter.resources.length > 0" class="chapter-resources">
                              <div v-for="resource in subChapter.resources" :key="resource.resourceId" class="resource-item">
                                <el-icon><Document /></el-icon>
                                <span class="resource-name">{{ resource.resourceName }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <!-- 暂无内容 -->
                        <el-empty v-if="(!chapter.resources || chapter.resources.length === 0) && (!chapter.children || chapter.children.length === 0)" description="暂无内容" :image-size="60" />
                      </el-collapse-item>
                    </el-collapse>
                  </div>
                  <el-empty v-else description="暂无目录信息" />
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="content-right">
            <el-card class="box-card teacher-card">
              <template #header>
                <div class="card-header">
                  <span class="header-title-bar"></span>
                  <span class="header-text">{{ teachers.length }} 位授课老师</span>
                </div>
              </template>
              <div v-if="teachers && teachers.length > 0">
                <div v-for="teacher in teachers" :key="teacher.userId" class="teacher-item">
                  <div class="teacher-avatar">
                    <img :src="getAvatarUrl(teacher.avatar)" alt="Teacher">
                  </div>
                  <div class="teacher-details">
                    <div class="teacher-name">{{ teacher.nickName }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="teacher-item">
                <div class="teacher-avatar">
                  <img :src="defaultImg" alt="Teacher">
                </div>
                <div class="teacher-details">
                   <div class="teacher-name">{{ detail.teacherNames || '未知' }}</div>
                </div>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCourse, getJoinedCourseIds, joinCourse, quitCourse } from '@/api/edu/course'
import { getNestedList } from '@/api/system/chapter'
import { getToken } from '@/utils/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Check } from '@element-plus/icons-vue'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import defaultImg from '@/assets/images/profile.jpg'
import PortalNavbar from '@/components/PortalNavbar/index.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const detail = ref({})
const teachers = ref([])
const chapters = ref([])
const activeTab = ref('intro')
const isJoined = ref(false)
const isTeacher = ref(false)
const baseApi = import.meta.env.VITE_APP_BASE_API

onMounted(() => {
  initData()
})

const initData = () => {
  const id = route.params.id
  if (!id) return;
  
  // 1. 获取课程详情
  getCourse(id).then(res => {
    detail.value = res.data || {}
    teachers.value = res.teachers || []
  })

  // 2. 获取章节目录
  getNestedList(id).then(res => {
    chapters.value = res.data || []
  })

  // 3. 检查登录状态和加入状态
  checkJoinStatus(id)
}

watchEffect(() => {
  if (userStore.id && teachers.value && teachers.value.length > 0) {
    isTeacher.value = teachers.value.some(t => String(t.userId) === String(userStore.id))
  }
})

const checkJoinStatus = (courseId) => {
  if (getToken()) {
    getJoinedCourseIds().then(res => {
      const joinedIds = res.data || []
      isJoined.value = joinedIds.some(id => String(id) === String(courseId))
    })
  } else {
    isJoined.value = false
  }
}

const handleJoin = () => {
  if (!getToken()) {
    appStore.setLoginVisible(true)
    return
  }
  
  ElMessageBox.confirm('确定要加入该课程吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    const id = detail.value.courseId
    joinCourse(id).then(res => {
      ElMessage.success('加入成功，开始学习吧！')
      isJoined.value = true
      initData()
    })
  }).catch(() => {})
}

const handleQuit = () => {
  ElMessageBox.confirm('确定要退出该课程吗？退出后将无法观看课程内容。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    quitCourse(detail.value.courseId).then(() => {
      ElMessage.success('已退出课程')
      isJoined.value = false
      initData()
    })
  }).catch(() => {})
}

const handleStartLearn = () => {
  router.push(`/system/course/learn/${detail.value.courseId}`)
}

const scrollToCatalog = () => {
  activeTab.value = 'chapter'
  const el = document.getElementById('content-section')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const getAvatarUrl = (avatar) => {
  if (!avatar) return defaultImg
  if (avatar.startsWith('http') || avatar.startsWith('https')) {
    return avatar
  }
  return baseApi + avatar
}
</script>

<style scoped lang="scss">
.course-detail-page {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.main-container {
  width: 1200px;
  margin: 0 auto;
}

/* Banner Area */
.course-banner {
  background-color: #333;
  color: #fff;
  padding: 40px 0;
  margin-bottom: 20px;
  
  .banner-content {
    display: flex;
    gap: 30px;
    align-items: flex-start;
  }
}

.cover-wrapper {
  width: 480px;
  height: 270px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  
  .course-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.info-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 270px;
  
  .course-title {
    font-size: 32px;
    font-weight: bold;
    margin: 0 0 15px 0;
    line-height: 1.2;
  }
  
  .course-desc {
    font-size: 14px;
    color: rgba(255,255,255,0.8);
    margin-bottom: 20px;
    line-height: 1.6;
    max-height: 66px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
  
  .course-meta {
    margin-bottom: auto;
    .meta-item {
      margin-right: 30px;
      font-size: 14px;
      color: rgba(255,255,255,0.9);
      i {
        margin-right: 5px;
      }
    }
  }
  
  .action-btn {
    margin-top: 20px;
    .join-btn {
      width: 200px;
      font-size: 18px;
      height: 50px;
    }
  }
}

/* Content Area */
.content-section {
  padding-bottom: 40px;
}

.course-tabs {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  min-height: 400px;
}

.tab-content {
  padding: 10px;
  line-height: 1.8;
  color: #333;
}

.sub-chapters {
  padding-left: 10px;
  
  .sub-chapter-item {
    margin-bottom: 10px;
    
    .sub-chapter-title {
      font-weight: bold;
      padding: 8px 0;
      color: #606266;
      font-size: 14px;
      background-color: #f8f9fa;
      padding-left: 10px;
      margin-bottom: 5px;
      border-radius: 4px;
    }
  }
}

.chapter-resources {
  .resource-item {
    display: flex;
    align-items: center;
    padding: 10px;
    cursor: pointer;
    border-bottom: 1px solid #f9f9f9;
    
    &:hover {
      background-color: #f0f7ff;
      color: #409eff;
    }
    
    .el-icon {
      margin-right: 8px;
      font-size: 16px;
    }
    
    .resource-name {
      flex: 1;
      font-size: 14px;
    }
  }
}

/* Sidebar */
.content-right {
  .box-card {
    border: none;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
    
    :deep(.el-card__header) {
      padding: 15px 20px;
      border-bottom: 1px solid #f0f0f0;
      font-weight: bold;
    }
  }
  
  .mt-20 {
    margin-top: 20px;
  }
}

.card-header {
  display: flex;
  align-items: center;
  
  .header-title-bar {
    width: 4px;
    height: 18px;
    background-color: #00b96b;
    margin-right: 10px;
    border-radius: 2px;
  }
  
  .header-text {
    font-size: 16px;
    color: #333;
  }
}

.teacher-item {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .teacher-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 15px;
    flex-shrink: 0;
    border: 1px solid #f0f0f0;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .teacher-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .teacher-name {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }
    
    .teacher-title {
      font-size: 13px;
      color: #999;
    }
  }
}
</style>