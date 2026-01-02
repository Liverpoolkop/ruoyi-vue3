<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="mb-2">
      <el-form-item label="课程名称" prop="courseName">
        <el-input v-model="queryParams.courseName" placeholder="请输入课程名称" clearable style="width:240px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="授课教师" prop="teacherId">
        <el-select 
          v-model="queryParams.teacherId" 
          placeholder="请选择授课教师" 
          clearable 
          filterable
          style="width:240px"
        >
          <el-option v-for="item in teacherOptions" :key="item.userId" :label="item.nickName" :value="item.userId" />
        </el-select>
      </el-form-item>
      <el-form-item label="课程状态" prop="status">
        <el-select 
          v-model="queryParams.status" 
          placeholder="请选择课程状态" 
          clearable 
          style="width:240px"
        >
          <el-option label="未开始" value="2" />
          <el-option label="进行中" value="0" />
          <el-option label="已结束" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" v-hasPermi="['edu:course:query']" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" v-hasPermi="['edu:course:add']" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" v-hasPermi="['edu:course:remove']"
          @click="handleDelete">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="封面" align="center" key="courseImg" v-if="columns[1].visible" width="100">
        <template #default="scope">
          <img v-if="scope.row.courseImg" :src="scope.row.courseImg" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
          <div v-else style="width: 50px; height: 50px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999;">无</div>
        </template>
      </el-table-column>
      <el-table-column label="课程" align="center" key="courseName" prop="courseName" v-if="columns[0].visible"
        :show-overflow-tooltip="true" />
      <el-table-column label="授课教师" align="center" key="teacherNames" prop="teacherNames" v-if="columns[2].visible"
        width="140" />
      <el-table-column label="课时" align="center" key="lessonHours" prop="lessonHours" v-if="columns[3].visible" width="80" />
      <el-table-column label="状态" align="center" key="status" v-if="columns[4].visible" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === '0'" type="success">进行中</el-tag>
          <el-tag v-else-if="scope.row.status === '1'" type="danger">已结束</el-tag>
          <el-tag v-else type="info">未开始</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center" key="courseDesc" prop="courseDesc" v-if="columns[5].visible" :show-overflow-tooltip="true" />
      <el-table-column label="操作" align="center" width="300" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" v-if="canManage(scope.row)" v-hasPermi="['edu:course:edit']" @click="openEdit(scope.row)">修改</el-button>
          <el-button link type="primary" icon="Delete" v-if="canManage(scope.row)" v-hasPermi="['edu:course:remove']" @click="doDel(scope.row)">删除</el-button>
          <el-button link type="info" icon="CircleCheck" disabled v-else>已加入</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="handleQuery" />

    <el-dialog v-model="addOpen" :title="dlgTitle" width="520px">
      <el-form :model="addForm" :rules="rules" ref="addRef" label-width="80px">
        <el-form-item label="课程名称" prop="courseName"><el-input v-model="addForm.courseName" placeholder="请输入课程名称" /></el-form-item>
        <el-form-item label="授课教师" prop="teacherIds">
          <el-select v-model="addForm.teacherIds" placeholder="请选择授课教师" filterable multiple>
            <el-option v-for="item in teacherOptions" :key="item.userId" :label="item.nickName" :value="item.userId" />
          </el-select>
        </el-form-item>
        <el-form-item label="课时" prop="lessonHours">
          <el-input-number v-model="addForm.lessonHours" :min="1" :max="500" placeholder="请输入课时" />
        </el-form-item>
        <el-form-item label="课程状态" prop="status">
          <el-radio-group v-model="addForm.status">
            <el-radio label="2">未开始</el-radio>
            <el-radio label="0">进行中</el-radio>
            <el-radio label="1">已结束</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="封面图片" prop="courseImg">
          <ImageUpload v-model="addForm.courseImg" :limit="1" />
        </el-form-item>
        <el-form-item label="描述" prop="courseDesc"><el-input v-model="addForm.courseDesc" type="textarea" placeholder="请输入课程描述" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitAdd">确 定</el-button>
        <el-button @click="addOpen=false">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listCourse, getCourse, addCourse, updateCourse, delCourse, inviteCourse, joinCourse, joinCourseByCode, getJoinedCourseIds } from '@/api/edu/course'
import { useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import auth from '@/plugins/auth'
import { listUser } from '@/api/system/user'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'

import ImageUpload from '@/components/ImageUpload/index.vue'

const queryParams = ref({ teacherId: undefined, status: undefined, pageNum: 1, pageSize: 10 })
const list = ref([])
const total = ref(0)
const loading = ref(false)
const showSearch = ref(true)
const addOpen = ref(false)
const addForm = ref({ courseName:'', teacherIds: [], courseDesc:'', lessonHours: 32, status: '2', courseImg: '' })
const teacherOptions = ref([])
const dlgTitle = ref('新建课程')
const isEdit = ref(false)
const userStore = useUserStore()
const joinedIds = ref([])
const router = useRouter()
const single = ref(true)
const multiple = ref(true)
const selectedRows = ref([])
const addRef = ref(null)

const columns = ref([
  { key: 1, label: '课程', visible: true },
  { key: 2, label: '封面', visible: true },
  { key: 3, label: '授课教师', visible: true },
  { key: 4, label: '课时', visible: true },
  { key: 5, label: '状态', visible: true },
  { key: 6, label: '描述', visible: true },
])

const rules = {
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  teacherIds: [{ required: true, message: '请选择授课教师', trigger: 'change' }],
  lessonHours: [{ required: true, message: '请输入课时', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

function handleQuery(){
  loading.value = true
  listCourse(queryParams.value).then(res => { list.value = res.rows || []; total.value = res.total || 0 }).finally(() => loading.value = false)
  getJoinedCourseIds().then(res => { joinedIds.value = res.data || [] })
}
function openAdd(){
  addForm.value = { courseName:'', teacherIds: [], courseDesc:'', lessonHours: 32, status: '2', courseImg: '' }
  dlgTitle.value = '新建课程'
  isEdit.value = false
  addOpen.value = true
}
function openEdit(row){
  getCourse(row.courseId).then(response => {
    addForm.value = response.data
    if (!addForm.value.teacherIds) addForm.value.teacherIds = []
    dlgTitle.value = '修改课程'
    isEdit.value = true
    addOpen.value = true
  })
}
function submitAdd(){
  addRef.value.validate(valid => {
    if (valid) {
      const api = isEdit.value ? updateCourse : addCourse
      api(addForm.value).then(()=>{ 
        ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
        addOpen.value=false; 
        handleQuery() 
      })
    }
  })
}
function doDel(row){ delCourse(row.courseId).then(()=> handleQuery()) }
function canManage(row){ return auth.hasRole('admin') || (row.createBy && row.createBy === userStore.name) }
function genInvite(row){ inviteCourse(row.courseId).then(res => { const d = res.data || {}; ElMessage.success(`邀请码：${d.inviteCode}，有效${d.expireHours}小时`) }) }
function doJoin(row){ joinCourse(row.courseId).then(()=> { ElMessage.success('已加入'); handleQuery() }) }
function joinByCodePrompt(){
  ElMessageBox.prompt('请输入邀请码', '加入课程', { confirmButtonText: '加入', cancelButtonText: '取消' })
    .then(({ value }) => { return joinCourseByCode(value) })
    .then(()=> { ElMessage.success('已加入'); handleQuery() })
}
function isJoined(row){ return joinedIds.value.includes(row.courseId) }
function resetQuery() { queryParams.value = { teacherId: undefined, status: undefined, pageNum: 1, pageSize: queryParams.value.pageSize }; handleQuery() }
function getList() { handleQuery() }
function handleSelectionChange(selection) {
  selectedRows.value = selection
  single.value = selection.length !== 1
  multiple.value = selection.length === 0
}
function handleAdd() { openAdd() }
function handleDelete() {
  if (selectedRows.value.length === 0) return
  Promise.all(selectedRows.value.map(r => delCourse(r.courseId))).then(() => handleQuery())
}

listUser({ pageNum: 1, pageSize: 1000, status: '0', params: { roleId: 100 } }).then(res => { teacherOptions.value = res.rows || [] })
handleQuery()
</script>

<style scoped>
.filter-bar .major-select {
  width: 220px;
}

.filter-bar .el-form-item {
  margin-right: 12px;
  vertical-align: middle;
  margin-bottom: 0;
}

.action-btns .el-button {
  margin-right: 6px;
}

.action-btns {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 6px;
}
</style>
