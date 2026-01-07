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
              class="menu-item" 
              :class="{ active: activeTab === 'joined_classes' }"
              @click="handleTabClick('joined_classes')"
            >
              <el-icon><School /></el-icon>
              <span>我加入的班级</span>
            </div>
            <div 
              v-if="isTeacher" 
              class="menu-item" 
              :class="{ active: activeTab === 'questionBank' }"
              @click="handleTabClick('questionBank')"
            >
              <el-icon><DataBoard /></el-icon>
              <span>题库管理</span>
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
            <!-- 题库管理 -->
            <div v-if="activeTab === 'questionBank'">
              <el-button @click="openAddQuestionDialog" type="primary" icon="Plus">新增题目</el-button>
              <el-table :data="questions" style="width: 100%">
                <el-table-column label="题目" prop="content"></el-table-column>
                <el-table-column label="题型" prop="questionType"></el-table-column>
                <el-table-column label="难度" prop="difficulty"></el-table-column>
                <el-table-column label="操作">
                  <template #default="scope">
                    <el-button @click="editQuestion(scope.row)" size="small">编辑</el-button>
                    <el-button @click="handleDeleteQuestion(scope.row)" size="small" type="danger">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

          </div>
        </div>
      </div>
      <!-- Add Question Dialog -->
      <el-dialog v-model="addQuestionDialogVisible" title="新增题目" width="500px">
        <el-form :model="newQuestionForm">
          <el-form-item label="题目" prop="content">
            <el-input v-model="newQuestionForm.content" placeholder="请输入题目" />
          </el-form-item>
          <el-form-item label="题型" prop="questionType">
            <el-select v-model="newQuestionForm.questionType" placeholder="请选择题型">
              <el-option label="选择题" value="multiple_choice" />
              <el-option label="简答题" value="short_answer" />
            </el-select>
          </el-form-item>
          <el-form-item label="难度" prop="difficulty">
            <el-select v-model="newQuestionForm.difficulty" placeholder="请选择难度">
              <el-option label="简单" :value="1" />
              <el-option label="中等" :value="2" />
              <el-option label="困难" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="handleAddQuestion" type="primary">提交</el-button>
            <el-button @click="addQuestionDialogVisible = false">取消</el-button>
          </el-form-item>
        </el-form>
        </el-dialog>
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
import { ref, reactive, onMounted, computed,watch } from 'vue'
import PortalNavbar from '@/components/PortalNavbar/index.vue'
import userAvatar from '@/views/system/user/profile/userAvatar.vue'
import userInfo from '@/views/system/user/profile/userInfo.vue'
import resetPwd from '@/views/system/user/profile/resetPwd.vue'
import ImageUpload from '@/components/ImageUpload/index.vue'
import { getUserProfile } from "@/api/system/user"
import { getMineCourses, joinCourseByCode, addCourse } from "@/api/edu/course"
import { getMyClasses } from '@/api/edu/class'
import { User, Lock, Reading, Key, Plus, Avatar, School, DataBoard } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import useUserStore from '@/store/modules/user'
import {
  getQuestionBank,
  addQuestion as addQuestionApi,
  editQuestion as editQuestionApi,
  deleteQuestion as deleteQuestionApi
} from '@/api/edu/questionBank'


const router = useRouter()
const userStore = useUserStore()
const activeTab = ref("userinfo")
const state = reactive({
  user: {},
  roleGroup: {},
  postGroup: {}
})
const defaultImg = 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'

//题库
//判断用户角色是否是教师或管理员

const questions = ref([])
watch(activeTab, (tab) => {
  console.log('切换到：', tab)

  if (['courses', 'managed_classes', 'joined_classes'].includes(tab)) {
    loadData()
  }

  if (tab === 'questionBank') {
    getQuestions()
  }
}, { immediate: true })
const getQuestions = () => {
  getQuestionBank().then(response => {
    questions.value = response.data || []
  }).catch(error => {
    ElMessage.error('加载题库失败')
  })
}

const openAddQuestionDialog = () => {
  // 打开对话框，触发新增题目的逻辑
  addQuestionDialogVisible.value = true
}

const editQuestion = (question) => {
  // 编辑题目的逻辑
}

const handleDeleteQuestion = (row) => {
  deleteQuestionApi(row.questionId).then(() => {
    ElMessage.success('删除成功')
    getQuestions()
  })
}

const addQuestionDialogVisible = ref(false)
const newQuestionForm = reactive({
  content: '',
  questionType: '',
  difficulty: null,
  tags: '',
  answer: '',
  analysis: '',
  optionsJson: []  // 初始化为空数组
})


const handleAddQuestion = () => {
  try {
    // 如果 optionsJson 是一个对象或数组，我们需要将它转换为 JSON 字符串
    if (typeof newQuestionForm.optionsJson !== 'string') {
      newQuestionForm.optionsJson = JSON.stringify(newQuestionForm.optionsJson);
    }
    
    // 调用 API 提交
    addQuestionApi(newQuestionForm).then(() => {
      ElMessage.success('新增成功')
      addQuestionDialogVisible.value = false
      getQuestions()
    })
  } catch (error) {
    ElMessage.error('选项格式无效，请确保输入有效的 JSON')
  }
}




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
    'joined_classes': '我加入的班级'
  }
  return map[activeTab.value] || ''
})

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
</style>