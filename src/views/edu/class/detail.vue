<template>
  <div class="app-container class-detail-page">
    <!-- Top Banner -->
    <div class="class-banner">
      <div class="banner-content">
        <div class="class-title">
          <span class="name">{{ info.className }}</span>
          <el-tag type="warning" effect="dark" class="ml-2">{{ info.grade }}级</el-tag>
          <el-tag type="success" effect="dark" class="ml-2">{{ info.majorName }}</el-tag>
        </div>
        <div class="class-stat">
          <div class="stat-item">
            <el-icon><User /></el-icon>
            <span>{{ students.length }} 名学生</span>
          </div>
        </div>
      </div>
      <div class="banner-action" v-if="canManage">
        <el-button type="primary" plain class="invite-btn" @click="genInviteForm">
          <el-icon class="mr-1"><Key /></el-icon> 生成邀请码
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="main-content">
      <!-- Left Column: Student List -->
      <el-col :span="17">
        <el-card shadow="hover" class="student-card">
          <template #header>
            <div class="card-header">
              <div class="title">
                <el-icon><Collection /></el-icon>
                <span>学生名单</span>
              </div>
              <div class="actions" v-if="canManage">
                <el-button size="small" type="primary" plain @click="openImportDialog">
                  <el-icon class="mr-1"><Upload /></el-icon> 导入名单
                </el-button>
                <el-button size="small" type="success" plain @click="openAddDialog">
                  <el-icon class="mr-1"><Plus /></el-icon> 添加学生
                </el-button>
              </div>
            </div>
          </template>
          
          <el-table :data="students" height="600" style="width: 100%" :header-cell-style="{background:'#f5f7fa'}">
            <el-table-column prop="studentId" label="学号" width="150" align="center">
              <template #default="scope">
                <el-tag type="info" size="small">{{ scope.row.studentId }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="studentName" label="姓名" min-width="160" align="center">
              <template #default="scope">
                <span class="student-name">{{ scope.row.studentName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center" v-if="canManage">
              <template #default="scope">
                <el-popconfirm title="确定要移除该学生吗？" @confirm="remove(scope.row)">
                  <template #reference>
                    <el-button size="small" type="danger" link>
                      <el-icon><Delete /></el-icon> 移除
                    </el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- Right Column: Info & Teacher -->
      <el-col :span="7">
        <!-- Basic Info -->
        <el-card shadow="hover" class="info-card mb-4">
          <template #header>
            <div class="card-header">
              <div class="title">
                <el-icon><School /></el-icon>
                <span>班级信息</span>
              </div>
            </div>
          </template>
          <div class="info-list">
            <div class="info-item">
              <span class="label">班级名称</span>
              <span class="value">{{ info.className }}</span>
            </div>
            <div class="info-item">
              <span class="label">所属年级</span>
              <span class="value">{{ info.grade }}</span>
            </div>
            <div class="info-item">
              <span class="label">所属专业</span>
              <span class="value">{{ info.majorName }}</span>
            </div>
            <div class="info-item">
              <span class="label">创建时间</span>
              <span class="value">{{ parseTime(info.createTime, '{y}-{m}-{d}') }}</span>
            </div>
          </div>
        </el-card>

        <!-- Teacher Info -->
        <el-card shadow="hover" class="teacher-card">
          <template #header>
            <div class="card-header">
              <div class="title">
                <el-icon><UserFilled /></el-icon>
                <span>班主任</span>
              </div>
            </div>
          </template>
          <div class="teacher-profile">
            <el-avatar :size="60" src="" class="mb-2">
              {{ info.nickName ? info.nickName.substring(0, 1) : '师' }}
            </el-avatar>
            <div class="name">{{ info.nickName }}</div>
            <div class="role">班主任</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Invite Dialog -->
    <el-dialog v-model="inviteOpen" title="生成邀请码" width="400px">
      <el-form label-width="80px">
        <el-form-item label="有效期">
          <el-select v-model="inviteDuration" style="width: 100%">
            <el-option v-for="item in durationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inviteOpen = false">取消</el-button>
        <el-button type="primary" @click="submitInvite">生成</el-button>
      </template>
    </el-dialog>

    <!-- Invite Result Dialog -->
    <el-dialog v-model="inviteResultOpen" title="邀请码" width="400px" center>
      <div style="text-align: center; padding: 20px 0;">
        <div style="font-size: 32px; font-weight: bold; color: #409EFF; letter-spacing: 4px; margin-bottom: 10px;">{{ inviteCode }}</div>
        <div style="color: #999; font-size: 13px;">有效期 {{ inviteExpireHours }} 小时</div>
      </div>
      <template #footer>
        <el-button type="primary" @click="copyCode">复制</el-button>
      </template>
    </el-dialog>

    <!-- Student Add Dialog -->
    <el-dialog v-model="studentAddOpen" title="添加班级成员" width="650px" custom-class="student-add-dialog">
      <el-tabs v-model="studentAddActiveTab" type="card">
        <!-- Tab 1: Search -->
        <el-tab-pane label="搜索添加" name="search">
          <div class="search-panel">
            <div class="search-bar">
              <el-input v-model="studentSearchQuery" placeholder="输入ID或用户名搜索" @keyup.enter="searchStudent" clearable>
                <template #append>
                  <el-button @click="searchStudent" :icon="Search" />
                </template>
              </el-input>
            </div>
            
            <div class="search-results">
              <el-empty v-if="studentSearchResults.length === 0" description="请输入关键词搜索" :image-size="60" />
              <div v-else class="result-list">
                <div v-for="user in studentSearchResults" :key="user.userId" class="user-item">
                  <div class="user-info">
                    <el-avatar :size="36" :src="user.avatar">{{ user.nickName ? user.nickName.charAt(0) : 'U' }}</el-avatar>
                    <div class="info-text">
                      <div class="name">{{ user.nickName }} <span class="sub">({{ user.userName }})</span></div>
                      <div class="id">ID: {{ user.userId }}</div>
                    </div>
                  </div>
                  <el-button 
                    size="small" 
                    :type="isStudentSelected(user.userId) ? 'success' : 'primary'" 
                    :plain="!isStudentSelected(user.userId)"
                    :disabled="isAlreadyMember(user.userId)"
                    @click="toggleStudentSelection(user)"
                  >
                    {{ isAlreadyMember(user.userId) ? '已加入' : (isStudentSelected(user.userId) ? '已选' : '选择') }}
                  </el-button>
                </div>
              </div>
            </div>
            
            <div class="selected-panel" v-if="studentSelected.length > 0">
              <div class="panel-title">已选人员 ({{ studentSelected.length }})</div>
              <div class="selected-tags">
                <el-tag 
                  v-for="user in studentSelected" 
                  :key="user.userId" 
                  closable 
                  @close="removeSelectedStudent(user.userId)"
                  class="user-tag"
                >
                  {{ user.nickName || user.userName }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- Tab 2: Import -->
        <el-tab-pane label="导入添加" name="import">
          <div class="import-panel">
            <el-upload 
              ref="uploadRef"
              :limit="1"
              accept=".xlsx, .xls"
              :headers="upload.headers"
              :action="upload.url + '?updateSupport=' + upload.updateSupport"
              :disabled="upload.isUploading"
              :on-progress="handleFileUploadProgress"
              :on-success="handleFileSuccess"
              :auto-upload="false"
              drag
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <template #tip>
                <div class="el-upload__tip text-center">
                  <div class="el-upload__tip">
                    <el-checkbox v-model="upload.updateSupport" /> 是否更新已经存在的用户数据
                  </div>
                  <span>仅允许导入xls、xlsx格式文件。</span>
                  <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
                </div>
              </template>
            </el-upload>
            <div class="import-actions" style="margin-top: 20px; text-align: center;">
               <el-button type="primary" @click="submitFileForm">开始导入</el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <el-button @click="studentAddOpen = false">取消</el-button>
        <el-button type="primary" @click="submitAddStudents" v-if="studentAddActiveTab === 'search'">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
  </template>

<script setup>
import { onMounted, ref, computed, getCurrentInstance, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, User, UserFilled, School, Collection, Plus, Upload, Delete, Key, Search, Close } from '@element-plus/icons-vue'
import { getClass, inviteClass, batchAddStudents, removeStudent, getUserBrief } from '@/api/edu/class'
import { getToken } from '@/utils/auth'
import auth from '@/plugins/auth'

const { proxy } = getCurrentInstance()
const route = useRoute()
const info = ref({})
const students = ref([])
const studentAddOpen = ref(false)
const studentAddActiveTab = ref('search')
const studentSearchQuery = ref('')
const studentSearchResults = ref([])
const studentSelected = ref([])
const searchPerformed = ref(false)
const searchLoading = ref(false)

// Invite Logic
const inviteOpen = ref(false)
const inviteResultOpen = ref(false)
const inviteDuration = ref(24)
const inviteCode = ref('')
const inviteExpireHours = ref(0)

const durationOptions = [
  { label: '1小时', value: 1 },
  { label: '24小时', value: 24 },
  { label: '3天', value: 72 },
  { label: '7天', value: 168 },
  { label: '永久', value: 87600 } // ~10 years
]

const uploadRef = ref({})

const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + `/edu/class/${route.params.id}/students/import`
});

onMounted(()=>{
  reload()
})

const canManage = computed(() => auth.hasRole('admin') || auth.hasRole('teacher'))

/** 下载模板操作 */
function importTemplate() {
  proxy.download("edu/class/students/importTemplate", {}, `student_template_${new Date().getTime()}.xlsx`);
};

/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};

/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  uploadRef.value.clearFiles();
  ElMessageBox.alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
  reload();
};

/** 提交上传文件 */
function submitFileForm() {
  uploadRef.value.submit();
};

function genInviteForm() {
  inviteDuration.value = 24
  inviteOpen.value = true
}

function submitInvite() {
  inviteClass(Number(route.params.id), { params: { hours: inviteDuration.value } }).then(res => {
    const d = res.data || {}
    inviteCode.value = d.inviteCode
    inviteExpireHours.value = d.expireHours
    inviteOpen.value = false
    inviteResultOpen.value = true
  })
}

function copyCode() {
  navigator.clipboard.writeText(inviteCode.value).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

function remove(row){
  removeStudent(Number(route.params.id), row.studentId).then(() => { ElMessage.success('已删除'); reload() })
}

function reload(){ 
  const id = Number(route.params.id)
  getClass(id).then(res => { 
    info.value = res.data || {}
    students.value = res.students || []
  }) 
}

function openAddDialog() {
  studentAddOpen.value = true
  studentAddActiveTab.value = 'search'
  // Reset states
  studentSearchQuery.value = ''
  studentSearchResults.value = []
  studentSelected.value = []
  searchPerformed.value = false
}

function openImportDialog() {
  studentAddOpen.value = true
  studentAddActiveTab.value = 'import'
}

function searchStudent() {
  const query = studentSearchQuery.value
  if (!query) {
    ElMessage.warning('请输入学生ID或用户名')
    return
  }
  searchLoading.value = true
  searchPerformed.value = true
  getUserBrief(query).then(res => {
    // Backend returns a list now
    if (Array.isArray(res.data)) {
        studentSearchResults.value = res.data
    } else if (res.data) {
        // Fallback if backend returns single object
        studentSearchResults.value = [res.data]
    } else {
        studentSearchResults.value = []
    }
  }).finally(() => {
    searchLoading.value = false
  })
}

function toggleStudentSelection(user) {
  if (isStudentSelected(user.userId)) {
    removeSelectedStudent(user.userId)
  } else {
    if (!studentSelected.value.some(u => u.userId === user.userId)) {
      studentSelected.value.push(user)
    }
  }
}

function removeSelectedStudent(userId) {
  studentSelected.value = studentSelected.value.filter(u => u.userId !== userId)
}

function isStudentSelected(userId) {
  return studentSelected.value.some(u => u.userId === userId)
}

function isAlreadyMember(userId) {
  return students.value.some(s => s.studentId === userId)
}

function submitAddStudents() {
  const ids = studentSelected.value.map(u => u.userId)
  batchAddStudents(Number(route.params.id), ids).then(() => {
    ElMessage.success('添加成功')
    studentAddOpen.value = false
    studentSelected.value = []
    studentSearchResults.value = []
    studentSearchQuery.value = ''
    searchPerformed.value = false
    reload()
  })
}
</script>

<style scoped lang="scss">
.class-detail-page {
  padding: 0;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.class-banner {
  background: linear-gradient(135deg, #409EFF 0%, #79bbff 100%);
  padding: 30px 40px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  margin-bottom: 20px;

  .banner-content {
    .class-title {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      
      .name {
        font-size: 28px;
        font-weight: bold;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
    }

    .class-stat {
      .stat-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        opacity: 0.9;
        
        .el-icon {
          font-size: 16px;
        }
      }
    }
  }

  .banner-action {
    .invite-btn {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.4);
      color: #fff;
      backdrop-filter: blur(4px);
      
      &:hover {
        background: #fff;
        color: #409EFF;
        border-color: #fff;
      }
    }
  }
}

.main-content {
  padding: 0 20px 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: bold;
    color: #333;
    
    .el-icon {
      color: #409EFF;
      font-size: 18px;
    }
  }
  
  .actions {
    display: flex;
    gap: 8px;
  }
}

.student-name {
  font-weight: 500;
  color: #333;
}

.info-card, .teacher-card {
  border: none;
  
  :deep(.el-card__header) {
    padding: 15px 20px;
    border-bottom: 1px solid #f0f0f0;
  }
}

.info-list {
  .info-item {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #f9f9f9;
    font-size: 14px;
    
    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    
    .label {
      color: #909399;
    }
    
    .value {
      color: #333;
      font-weight: 500;
    }
  }
}

.teacher-profile {
  text-align: center;
  padding: 10px 0;
  
  .name {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
  }
  
  .role {
    font-size: 12px;
    color: #909399;
    background: #f0f2f5;
    padding: 2px 10px;
    border-radius: 10px;
    display: inline-block;
  }
}

// Search Results Styles
.search-panel {
  .search-results {
    margin-top: 15px;
    height: 300px;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 10px;
    
    .result-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .user-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: #f9f9f9;
      border-radius: 4px;
      
      .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .info-text {
          .name { 
            font-weight: bold; 
            font-size: 14px;
            .sub { font-weight: normal; color: #999; font-size: 12px; margin-left: 4px; }
          }
          .id { font-size: 12px; color: #999; }
        }
      }
    }
  }
  
  .selected-panel {
    margin-top: 15px;
    border-top: 1px solid #eee;
    padding-top: 10px;
    
    .panel-title {
      font-size: 13px;
      color: #666;
      margin-bottom: 8px;
    }
    
    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
}

.import-panel {
  padding: 20px 0;
  text-align: center;
}
</style>
