<template>
  <div class="my-class-page">
    <portal-navbar />
    <div class="main-container">
      <div class="page-layout">
        <!-- Sidebar -->
        <div class="sidebar">
          <el-card class="user-card" shadow="hover">
            <div class="user-profile">
              <img :src="userStore.avatar || defaultAvatar" class="avatar" />
              <div class="username">{{ userStore.name }}</div>
              <div class="role-tag">
                <el-tag size="small" effect="plain">{{ userRole }}</el-tag>
              </div>
            </div>
            
            <div class="user-detail-list">
              <div class="detail-item">
                <span class="label">邮箱：</span>
                <span class="value">{{ userStore.email || '暂无' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">手机：</span>
                <span class="value">{{ userStore.phonenumber || '暂无' }}</span>
              </div>
            
            </div>
          </el-card>
        </div>

        <!-- Main Content -->
        <div class="content-area">
          <el-card shadow="hover" class="content-card">
            <!-- Debug Info: Remove before production -->
            <div v-if="false">Roles: {{ userStore.roles }} | isTeacher: {{ isTeacher }}</div>
            
            <el-tabs v-model="activeTab">
              <el-tab-pane label="我的课程" name="course">
                <div v-if="managedCourses.length > 0 || joinedCourses.length > 0">
                   <!-- Managed Courses -->
                   <div v-if="managedCourses.length > 0 || isTeacher">
                      <div class="section-header">
                        <div class="section-title">我教授的课程</div>
                        <el-button v-if="isTeacher" type="primary" size="small" icon="Plus" @click="handleCreateCourse">创建课程</el-button>
                      </div>
                      <div class="class-grid" v-if="managedCourses.length > 0">
                        <div v-for="item in managedCourses" :key="item.courseId" class="class-card" @click="router.push(`/edu/course/learn/${item.courseId}`)">
                          <div class="card-cover">
                            <img v-if="item.courseImg" :src="item.courseImg" class="course-img" />
                            <div v-else class="course-placeholder">{{ item.courseName.substring(0,1) }}</div>
                          </div>
                          <div class="card-info">
                            <div class="class-name" :title="item.courseName">{{ item.courseName }}</div>
                            <div class="class-footer">
                              <el-tag size="small" :type="item.status === '2' ? 'info' : (item.status === '1' ? 'danger' : 'success')">
                                {{ item.status === '2' ? '未开始' : (item.status === '1' ? '已结束' : '进行中') }}
                              </el-tag>
                            </div>
                          </div>
                        </div>
                      </div>
                      <el-empty v-else description="您还没有创建课程" />
                   </div>
                   
                   <!-- Joined Courses -->
                   <div v-if="joinedCourses.length > 0">
                      <div class="section-title" :style="{marginTop: managedCourses.length > 0 ? '20px' : '0'}">我学习的课程</div>
                      <div class="class-grid">
                        <div v-for="item in joinedCourses" :key="item.courseId" class="class-card" @click="router.push(`/edu/course/learn/${item.courseId}`)">
                          <div class="card-cover student-cover">
                            <img v-if="item.courseImg" :src="item.courseImg" class="course-img" />
                            <div v-else class="course-placeholder">{{ item.courseName.substring(0,1) }}</div>
                          </div>
                          <div class="card-info">
                            <div class="class-name" :title="item.courseName">{{ item.courseName }}</div>
                            <div class="class-meta">
                              <el-icon><Avatar /></el-icon> <span>{{ item.teacherNames }}</span>
                            </div>
                            <div class="class-footer">
                              <el-tag size="small" :type="item.status === '2' ? 'info' : (item.status === '1' ? 'danger' : 'success')">
                                {{ item.status === '2' ? '未开始' : (item.status === '1' ? '已结束' : '进行中') }}
                              </el-tag>
                            </div>
                          </div>
                        </div>
                      </div>
                   </div>
                </div>
                <el-empty v-else description="暂无课程" />
              </el-tab-pane>
              
              <el-tab-pane label="我管理的班级" name="managed" v-if="isTeacher">
                <div class="class-grid" v-if="managedClasses.length > 0">
                  <div v-for="item in managedClasses" :key="item.classId" class="class-card" @click="router.push(`/edu/class/view/${item.classId}`)">
                    <div class="card-cover">
                      <div class="class-grade">{{ item.grade }}</div>
                    </div>
                    <div class="card-info">
                      <div class="class-name" :title="item.className">{{ item.className }}</div>
                      <div class="class-meta">
                        <el-icon><User /></el-icon> <span>{{ item.majorName }}</span>
                      </div>
                      <div class="class-footer">
                        <el-tag size="small" type="success">进行中</el-tag>
                      </div>
                    </div>
                  </div>
                </div>
                <el-empty v-else description="暂无管理的班级" />
              </el-tab-pane>
              
              <el-tab-pane label="我加入的班级" name="joined">
                <div class="class-grid" v-if="joinedClasses.length > 0">
                  <div v-for="item in joinedClasses" :key="item.classId" class="class-card" @click="router.push(`/edu/class/view/${item.classId}`)">
                    <div class="card-cover student-cover">
                      <div class="class-grade">{{ item.grade }}</div>
                    </div>
                    <div class="card-info">
                      <div class="class-name" :title="item.className">{{ item.className }}</div>
                      <div class="class-meta">
                        <el-icon><Avatar /></el-icon> <span>{{ item.teacherName }}</span>
                      </div>
                      <div class="class-footer">
                        <el-tag size="small">已加入</el-tag>
                      </div>
                    </div>
                  </div>
                </div>
                <el-empty v-else description="暂无加入的班级" />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </div>
      </div>
    </div>
    
    <!-- Create Course Dialog -->
    <el-dialog v-model="createCourseOpen" title="创建课程" width="500px">
      <el-form ref="courseFormRef" :model="courseForm" :rules="courseRules" label-width="80px">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="courseForm.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="课程简介" prop="courseDesc">
          <el-input v-model="courseForm.courseDesc" type="textarea" placeholder="请输入课程简介" />
        </el-form-item>
        <el-form-item label="课时" prop="lessonHours">
          <el-input-number v-model="courseForm.lessonHours" :min="1" :max="500" placeholder="请输入课时" />
        </el-form-item>
        <el-form-item label="课程状态" prop="status">
          <el-radio-group v-model="courseForm.status">
            <el-radio label="2">未开始</el-radio>
            <el-radio label="0">进行中</el-radio>
            <el-radio label="1">已结束</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="封面图片" prop="courseImg">
          <ImageUpload v-model="courseForm.courseImg" :limit="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createCourseOpen = false">取消</el-button>
        <el-button type="primary" @click="submitCreateCourse">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import PortalNavbar from '@/components/PortalNavbar/index.vue'
import ImageUpload from '@/components/ImageUpload/index.vue'
import defaultAvatar from '@/assets/images/profile.jpg'
import { getMyClasses } from '@/api/edu/class'
import { getMineCourses, joinCourseByCode, addCourse } from '@/api/system/course'
import auth from '@/plugins/auth'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('course')
const managedClasses = ref([])
const joinedClasses = ref([])
const managedCourses = ref([])
const joinedCourses = ref([])
const currentClass = computed(() => joinedClasses.value.length > 0 ? joinedClasses.value[0] : null) // Assuming single class for student

// Create Course Logic
const createCourseOpen = ref(false)
const courseFormRef = ref(null)
const courseForm = reactive({
  courseName: '',
  courseDesc: '',
  courseImg: '',
  lessonHours: 32,
  status: '2'
})
const courseRules = {
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  lessonHours: [{ required: true, message: '请输入课时', trigger: 'blur' }],
  status: [{ required: true, message: '请选择课程状态', trigger: 'change' }]
}

const isTeacher = computed(() => {
  const roles = userStore.roles || []
  return roles.includes('admin') || roles.includes('teacher')
})
const userRole = computed(() => {
  const roles = userStore.roles || []
  if (roles.includes('admin')) return '管理员'
  if (roles.includes('teacher')) return '教师'
  return '学生'
})

onMounted(() => {
  loadData()
})

const loadData = () => {
  getMyClasses().then(res => {
    managedClasses.value = res.managed || []
    joinedClasses.value = res.joined || []
  })
  getMineCourses().then(res => {
    managedCourses.value = res.managed || []
    joinedCourses.value = res.joined || []
  })
}

function handleJoinCourse() {
  ElMessageBox.prompt('请输入课程邀请码', '加入课程', {
    confirmButtonText: '加入',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '邀请码不能为空'
  }).then(({ value }) => {
    joinCourseByCode(value).then(() => {
      ElMessage.success('加入成功')
      loadData()
    })
  }).catch(() => {})
}

function handleCreateCourse() {
  createCourseOpen.value = true
  // Reset form
  courseForm.courseName = ''
  courseForm.courseDesc = ''
  courseForm.courseImg = ''
  courseForm.lessonHours = 32
  courseForm.status = '2'
}

function submitCreateCourse() {
  courseFormRef.value.validate(valid => {
    if (valid) {
      addCourse(courseForm).then(() => {
        ElMessage.success('创建成功')
        createCourseOpen.value = false
        loadData()
      })
    }
  })
}
</script>

<style scoped lang="scss">
.my-class-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  
  .section-title {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.main-container {
  width: 1200px;
  margin: 20px auto;
}

.page-layout {
  display: flex;
  gap: 20px;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
}

.user-card {
  text-align: center;
  padding: 20px 0;
  margin-bottom: 20px;
  
  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-bottom: 10px;
    border: 2px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .username {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
  }
  
  .role-tag {
    margin-bottom: 20px;
  }
  
  .stats-row {
    display: flex;
    justify-content: space-around;
    border-top: 1px solid #f0f0f0;
    padding-top: 15px;
    
    .stat-item {
      .count {
        font-size: 20px;
        font-weight: bold;
        color: #333;
      }
      .label {
        font-size: 12px;
        color: #999;
        margin-top: 2px;
      }
    }
  }
}

.class-info-card {
  .class-detail {
    .detail-item {
      margin-bottom: 12px;
      font-size: 14px;
      display: flex;
      
      .label {
        color: #999;
        width: 70px;
        flex-shrink: 0;
      }
      
      .value {
        color: #333;
        font-weight: 500;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.content-area {
  flex: 1;
}

.content-card {
  min-height: 600px;
}

.class-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 10px 0;
}

.class-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .card-cover {
    height: 120px;
    background: linear-gradient(135deg, #409EFF 0%, #79bbff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 24px;
    font-weight: bold;
    position: relative;
    
    &.student-cover {
      background: linear-gradient(135deg, #67C23A 0%, #95d475 100%);
    }

    .course-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .course-placeholder {
      font-size: 32px;
      color: rgba(255,255,255,0.8);
    }
  }
  
  .card-info {
    padding: 15px;
    
    .class-name {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .class-meta {
      font-size: 13px;
      color: #666;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 10px;
    }
    
    .class-footer {
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>