<template>
  <div class="portal-profile-container">
    <portal-navbar />
    <div class="main-container">
      <div class="profile-layout">
        <!-- 左侧导航 -->
        <div class="profile-sidebar">
          <div class="user-card">
            <div class="avatar-wrapper">
              <userAvatar />
            </div>
            <div class="user-name">{{ userStore.nickname || userStore.name }}</div>
            <div class="user-role">{{ userRole }}</div>
          </div>
          
          <!-- User Details from myClass.vue -->
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

          <div class="menu-list">
            <div 
              class="menu-item" 
              :class="{ active: activeTab === 'userinfo' }"
              @click="handleTabClick('userinfo')"
            >
              <el-icon><User /></el-icon>
              <span>基本资料</span>
            </div>
            <div 
              class="menu-item" 
              :class="{ active: activeTab === 'resetPwd' }"
              @click="handleTabClick('resetPwd')"
            >
              <el-icon><Lock /></el-icon>
              <span>修改密码</span>
            </div>
            <div 
              class="menu-item" 
              :class="{ active: activeTab === 'courses' }"
              @click="handleTabClick('courses')"
            >
              <el-icon><Reading /></el-icon>
              <span>我的课程</span>
            </div>
            <div 
              v-if="isTeacher"
              class="menu-item" 
              :class="{ active: activeTab === 'managed_classes' }"
              @click="handleTabClick('managed_classes')"
            >
              <el-icon><DataBoard /></el-icon>
              <span>我管理的班级</span>
            </div>
            <div 
              v-if="isTeacher"
              class="menu-item" 
              :class="{ active: activeTab === 'question_bank' }"
              @click="handleTabClick('question_bank')"
            >
              <el-icon><List /></el-icon>
              <span>题库管理</span>
            </div>
            <div 
              class="menu-item" 
              :class="{ active: activeTab === 'joined_classes' }"
              @click="handleTabClick('joined_classes')"
            >
              <el-icon><School /></el-icon>
              <span>我加入的班级</span>
            </div>
            <div 
              class="menu-item" 
              :class="{ active: activeTab === 'messages' }"
              @click="handleTabClick('messages')"
            >
              <el-icon><Message /></el-icon>
              <span>站内信</span>
            </div>
            <div 
              class="menu-item" 
              :class="{ active: activeTab === 'exams' }"
              @click="handleTabClick('exams')"
            >
              <el-icon><Timer /></el-icon>
              <span>在线测验</span>
            </div>
          </div>
        </div>

        <!-- 右侧内容 -->
        <div class="profile-content">
          <div class="content-header">
            <h2>{{ currentTabLabel }}</h2>
            <div class="header-actions">
              <el-button v-if="activeTab === 'courses' && isTeacher" type="primary" icon="Plus" @click="handleCreateCourse">创建课程</el-button>
              <el-button v-if="activeTab === 'courses'" type="success" plain icon="Key" @click="handleJoinCourse">邀请码加入</el-button>
            </div>
          </div>
          <div class="content-body">
            <userInfo v-if="activeTab === 'userinfo'" :user="state.user" />
            <resetPwd v-if="activeTab === 'resetPwd'" />
            
            <!-- My Courses -->
            <div v-if="activeTab === 'courses'">
              <div v-if="managedCourses.length > 0 || joinedCourses.length > 0 || isTeacher">
                 <!-- Managed Courses -->
                 <div v-if="managedCourses.length > 0 || isTeacher">
                    <div class="section-header" v-if="managedCourses.length > 0 || isTeacher">
                      <div class="section-title">我教授的课程</div>
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
                    <el-empty v-else-if="isTeacher" description="您还没有创建课程" />
                 </div>
                 
                 <!-- Joined Courses -->
                 <div v-if="joinedCourses.length > 0">
                    <div class="section-header" :style="{marginTop: managedCourses.length > 0 ? '30px' : '0'}">
                      <div class="section-title">我学习的课程</div>
                    </div>
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
            </div>

            <!-- Managed Classes -->
            <div v-if="activeTab === 'managed_classes'">
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
            </div>

            <!-- Joined Classes -->
            <div v-if="activeTab === 'joined_classes'">
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
            </div>

            <!-- Question Bank -->
            <QuestionBankPanel v-if="activeTab === 'question_bank'" />

            <!-- Messages Tab -->
            <div v-if="activeTab === 'messages'">
               <div class="message-list-container" v-loading="msgLoading">
                   <div v-if="messageList.length === 0" class="empty-block">
                       <el-empty description="暂无消息" />
                   </div>
                   <div v-else class="msg-full-item" v-for="msg in messageList" :key="msg.id" :class="{ unread: msg.readStatus === '0', read: msg.readStatus !== '0' }">
                       <div class="msg-main">
                           <div class="msg-title">
                               <span class="dot" v-if="msg.readStatus === '0'"></span>
                               {{ msg.title }}
                               <el-tag v-if="msg.courseName" size="small" type="info" class="msg-course-tag">{{ msg.courseName }}</el-tag>
                           </div>
                           <div class="msg-content">{{ msg.content }}</div>
                           <div class="msg-time">{{ msg.createTime }}</div>
                       </div>
                       <div class="msg-actions">
                           <el-button v-if="msg.readStatus === '0'" type="primary" size="small" plain icon="Check" @click="handleReadMsg(msg)">标记已读</el-button>
                           <div v-else class="status-read">
                               <el-icon><Check /></el-icon> 已读
                           </div>
                           <el-button type="danger" size="small" link icon="Delete" @click="handleDeleteMsg(msg)">删除</el-button>
                       </div>
                   </div>
                   
                   <div class="pagination-container" v-if="msgTotal > 0">
                       <el-button type="primary" link @click="handleMarkAllRead" style="float: left" v-if="messageList.some(m => m.readStatus === '0')">本页全部已读</el-button>
                       <el-pagination
                           v-model:current-page="msgQuery.pageNum"
                           v-model:page-size="msgQuery.pageSize"
                           layout="prev, pager, next"
                           :total="msgTotal"
                           @current-change="loadMessages"
                       />
                   </div>
               </div>
            </div>

            <!-- Exams Tab -->
            <div v-if="activeTab === 'exams'">
                <div v-loading="examLoading">
                    <div v-if="examList.length === 0">
                        <el-empty description="暂无可用测验" />
                    </div>
                    <div v-else class="exam-list">
                        <div v-for="exam in examList" :key="exam.examId" class="card-item">
                            <div class="card-info">
                                <div class="class-name">{{ exam.title }}</div>
                                <div class="class-meta">
                                    <el-icon><Timer /></el-icon>
                                    <span>时长: {{ exam.duration }} 分钟</span>
                                </div>
                                <div class="class-meta">
                                    <el-icon><DataBoard /></el-icon>
                                    <span>总分: {{ exam.totalScore }} 分</span>
                                </div>
                                <div class="class-footer">
                                    <el-button type="primary" size="small" @click="handleStartExam(exam)">开始测验</el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

          </div>
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

<script setup name="PortalProfile">
import { ref, reactive, onMounted, computed } from 'vue'
import PortalNavbar from '@/components/PortalNavbar/index.vue'
import userAvatar from '@/views/system/user/profile/userAvatar.vue'
import userInfo from '@/views/system/user/profile/userInfo.vue'
import resetPwd from '@/views/system/user/profile/resetPwd.vue'
import QuestionBankPanel from './components/QuestionBankPanel.vue'
import ImageUpload from '@/components/ImageUpload/index.vue'
import { getUserProfile } from "@/api/system/user"
import { getMineCourses, joinCourseByCode, addCourse } from "@/api/edu/course"
import { getMyClasses } from '@/api/edu/class'
import { User, Lock, Reading, Key, Plus, Avatar, School, DataBoard, List, Message, Timer, Delete, Check } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import useUserStore from '@/store/modules/user'
import { listMessage, readMessage, delMessage } from '@/api/edu/message'
import { listExam } from '@/api/edu/exam'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const activeTab = ref("userinfo")
const state = reactive({
  user: {},
  roleGroup: {},
  postGroup: {}
})
const defaultImg = 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'

// Course & Class Data
const managedClasses = ref([])
const joinedClasses = ref([])
const managedCourses = ref([])
const joinedCourses = ref([])

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

const currentTabLabel = computed(() => {
  const map = {
    'userinfo': '基本资料',
    'resetPwd': '修改密码',
    'courses': '我的课程',
    'managed_classes': '我管理的班级',
    'joined_classes': '我加入的班级',
    'question_bank': '题库管理',
    'messages': '站内信',
    'exams': '在线测验'
  }
  return map[activeTab.value] || ''
})

// Exam Logic
const examList = ref([])
const examLoading = ref(false)

function handleStartExam(exam) {
    router.push('/portal/exam/' + exam.examId)
}

function loadExams() {
    examLoading.value = true
    listExam().then(res => {
        examList.value = res.data || []
        examLoading.value = false
    })
}

// Message Logic
const messageList = ref([])
const msgLoading = ref(false)
const msgTotal = ref(0)
const msgQuery = reactive({
    pageNum: 1,
    pageSize: 10
})

function loadMessages() {
    msgLoading.value = true
    listMessage(msgQuery).then(res => {
        messageList.value = res.rows
        msgTotal.value = res.total
        msgLoading.value = false
    })
}

function handleReadMsg(msg) {
    if (msg.readStatus === '0') {
        readMessage(msg.id).then(() => {
            msg.readStatus = '1'
            ElMessage.success('标记已读')
        })
    }
}

function handleDeleteMsg(msg) {
    ElMessageBox.confirm('确定删除该消息吗？', '提示', { type: 'warning' })
    .then(() => {
        delMessage(msg.id).then(() => {
            ElMessage.success('删除成功')
            loadMessages()
        })
    })
}

function handleMarkAllRead() {
    messageList.value.forEach(msg => {
        if (msg.readStatus === '0') handleReadMsg(msg)
    })
}

function getUser() {
  getUserProfile().then(response => {
    state.user = response.data
    state.roleGroup = response.roleGroup
  })
}

function loadData() {
  getMineCourses().then(res => {
    managedCourses.value = res.managed || []
    joinedCourses.value = res.joined || []
  })
  getMyClasses().then(res => {
    managedClasses.value = res.managed || []
    joinedClasses.value = res.joined || []
  })
}

function handleTabClick(tab) {
  activeTab.value = tab
  if (['courses', 'managed_classes', 'joined_classes'].includes(tab)) {
    loadData()
  }
  if (tab === 'messages') {
      loadMessages()
  }
  if (tab === 'exams') {
      loadExams()
  }
}

function handleJoinCourse() {
  ElMessageBox.prompt('请输入课程邀请码', '加入课程', {
    confirmButtonText: '加入',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '邀请码不能为空'
  }).then(({ value }) => {
    joinCourseByCode(value).then(res => {
      ElMessage.success('加入成功，开始学习吧！')
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

onMounted(() => {
  getUser()
  // Load data initially too if needed, or wait for tab click
  // Preload data
  loadData()
  
  if (route.query.tab) {
      handleTabClick(route.query.tab)
  }
})
</script>

<style scoped lang="scss">
.portal-profile-container {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.main-container {
  width: 1200px;
  margin: 30px auto;
}

.profile-layout {
  display: flex;
  gap: 20px;
}

.profile-sidebar {
  width: 280px;
  background: #fff;
  border-radius: 8px;
  padding: 30px 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  height: fit-content;
  flex-shrink: 0;
}

.user-card {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.avatar-wrapper {
  margin-bottom: 15px;
}

.user-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.user-role {
  font-size: 14px;
  color: #999;
}

.user-detail-list {
  margin-bottom: 20px;
  
  .detail-item {
    margin-bottom: 12px;
    font-size: 14px;
    display: flex;
    justify-content: center;
    
    .label {
      color: #999;
    }
    
    .value {
      color: #333;
      font-weight: 500;
    }
  }
}

.menu-list {
  .menu-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    margin-bottom: 8px;
    cursor: pointer;
    border-radius: 4px;
    color: #606266;
    transition: all 0.3s;
    
    .el-icon {
      margin-right: 10px;
      font-size: 18px;
    }
    
    &:hover {
      background-color: #f5f7fa;
      color: #409EFF;
    }
    
    &.active {
      background-color: #ecf5ff;
      color: #409EFF;
      font-weight: 500;
    }
  }
}

.profile-content {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 30px 40px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  min-height: 600px;
}

.content-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    font-size: 20px;
    color: #333;
    margin: 0;
    font-weight: normal;
  }
}

.section-header {
  margin-bottom: 15px;
  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    border-left: 4px solid #409EFF;
    padding-left: 10px;
  }
}

/* Course/Class Card Styles */
.class-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
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
    
    .class-grade {
      font-size: 24px;
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

.msg-full-item {
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    transition: background 0.3s;
    
    &:hover {
        background: #f9f9f9;
    }
    
    &.unread {
        background: #e6f7ff;
        .msg-title { color: #333; font-weight: bold; }
    }

    &.read {
        .msg-title { color: #666; }
        .msg-content { color: #999; }
    }
    
    .msg-main {
        flex: 1;
        margin-right: 20px;
        
        .msg-title {
            font-size: 16px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            
            .dot {
                width: 8px;
                height: 8px;
                background: #f56c6c;
                border-radius: 50%;
                margin-right: 8px;
            }
            
            .msg-course-tag {
                margin-left: 10px;
                font-weight: normal;
            }
        }
        
        .msg-content {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
            margin-bottom: 8px;
        }
        
        .msg-time {
            font-size: 12px;
            color: #999;
        }
    }
    
    .msg-actions {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
        min-width: 90px;
        
        .status-read {
            font-size: 13px;
            color: #999;
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 5px 0;
        }
    }
}
.pagination-container {
    margin-top: 20px;
    text-align: right;
}
</style>