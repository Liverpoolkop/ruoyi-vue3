<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="mb-2">
      <el-form-item label="班级" prop="className">
        <el-input v-model="queryParams.className" placeholder="请输入班级名称" clearable style="width:240px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="年级" prop="grade">
        <el-input v-model="queryParams.grade" placeholder="请输入年级" clearable style="width:240px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="专业" prop="majorId">
        <el-select 
          v-model="queryParams.majorId" 
          placeholder="请选择专业" 
          clearable 
          filterable
          style="width:240px"
        >
          <el-option v-for="m in majorOptions" :key="m.majorId" :label="m.majorName" :value="m.majorId" />
        </el-select>
      </el-form-item>
      <el-form-item label="班主任" prop="teacherId">
        <el-select 
          v-model="queryParams.teacherId" 
          placeholder="请选择班主任" 
          clearable 
          filterable
          style="width:240px"
        >
          <el-option v-for="item in teacherOptions" :key="item.userId" :label="item.nickName" :value="item.userId" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" v-hasPermi="['edu:class:query']" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" v-hasPermi="['edu:class:add']" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" v-hasPermi="['edu:class:remove']"
          @click="handleDelete">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="班级" align="center" key="className" prop="className" v-if="columns[0].visible" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="viewDetail(scope.row)">{{ scope.row.className }}</span>
        </template>
      </el-table-column>
      <el-table-column label="年级" align="center" key="grade" prop="grade" v-if="columns[1].visible" width="100" />
      <el-table-column label="专业" align="center" key="majorName" prop="majorName" v-if="columns[2].visible"
        :show-overflow-tooltip="true" />
      <el-table-column label="班主任" align="center" key="teacherName" prop="teacherName" v-if="columns[3].visible"
        width="140" />
      <el-table-column label="人数" align="center" key="studentCount" prop="studentCount" v-if="columns[4].visible"
        width="80" />
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="修改" placement="top" v-if="canManage(scope.row)">
            <el-button link type="primary" icon="Edit" v-hasPermi="['edu:class:edit']"
              @click="openEdit(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top" v-if="canManage(scope.row)">
            <el-button link type="primary" icon="Delete" v-hasPermi="['edu:class:remove']"
              @click="doDel(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
    <el-dialog v-model="addOpen" :title="dlgTitle" width="520px">
      <el-form :model="addForm" :rules="addRules" ref="addRef" label-width="80px">
        <el-form-item label="班级名称" prop="className"><el-input v-model="addForm.className"
            placeholder="请输入班级名称" /></el-form-item>
        <el-form-item label="年级" prop="grade"><el-input v-model="addForm.grade" placeholder="请输入年级" /></el-form-item>
        <el-form-item label="专业" prop="majorId">
          <el-select 
            v-model="addForm.majorId" 
            placeholder="请选择专业"
            filterable
          >
            <el-option
              v-for="m in majorOptions" :key="m.majorId" :label="m.majorName"
              :value="m.majorId" />
          </el-select>
        </el-form-item>
        <el-form-item label="班主任" prop="teacherId">
          <el-select 
            v-model="addForm.teacherId" 
            placeholder="请选择班主任" 
            clearable
            filterable
          >
            <el-option
              v-for="item in teacherOptions" :key="item.userId" :label="item.nickName"
              :value="item.userId" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitAdd">确 定</el-button>
        <el-button @click="addOpen = false">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import { listClass, addClass, updateClass, delClass, inviteClass, joinClass, joinByCode, getJoinedClassIds } from '@/api/edu/class'
import { listUser } from '@/api/system/user'
import { useRouter } from 'vue-router'
import { listMajor } from '@/api/edu/major'
import useUserStore from '@/store/modules/user'
import auth from '@/plugins/auth'

const queryParams = ref({ className: '', grade: '', majorId: undefined, teacherId: undefined, pageNum: 1, pageSize: 10 })
const list = ref([])
const loading = ref(false)
const showSearch = ref(true)
const queryRef = ref()
const dateRange = ref([])
const total = ref(0)
const addOpen = ref(false)
const addForm = ref({ className: '', grade: '', majorId: undefined, teacherId: undefined })
const addRules = {
  className: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  grade: [{ required: true, message: '请输入年级', trigger: 'blur' }],
  majorId: [{ required: true, message: '请选择专业', trigger: 'change' }],
  teacherId: [{ required: true, message: '请选择班主任', trigger: 'change' }]
}
const addRef = ref()
const majorOptions = ref([])
const teacherOptions = ref([])
const dlgTitle = ref('新建班级')
const isEdit = ref(false)
const router = useRouter()
const userStore = useUserStore()
const joinedIds = ref([])
const single = ref(true)
const multiple = ref(true)
const columns = ref([
  { key: 1, label: '班级', visible: true },
  { key: 2, label: '年级', visible: true },
  { key: 3, label: '专业', visible: true },
  { key: 4, label: '班主任', visible: true },
  { key: 5, label: '人数', visible: true },
])
const selectedRows = ref([])

function handleQuery() {
  loading.value = true
  listClass(queryParams.value).then(res => { list.value = res.rows || []; total.value = res.total || 0 }).finally(() => loading.value = false)
  getJoinedClassIds().then(res => { joinedIds.value = res.data || [] })
}
function openAdd() {
  addForm.value = { className: '', grade: '', majorId: undefined, teacherId: undefined }
  addOpen.value = true
  dlgTitle.value = '新建班级'
  isEdit.value = false
}
function viewDetail(row) {
  router.push(`/edu/class/detail/${row.classId}`)
}
function submitAdd() {
  addRef.value.validate((valid) => {
    if (!valid) return
    const api = isEdit.value ? updateClass : addClass
    api(addForm.value).then(() => { addOpen.value = false; handleQuery() })
  })
}
function openEdit(row) {
  addForm.value = { classId: row.classId, className: row.className, grade: row.grade, majorId: row.majorId, teacherId: row.teacherId }
  dlgTitle.value = '修改班级'
  isEdit.value = true
  addOpen.value = true
}
function doDel(row) {
  delClass(row.classId).then(() => handleQuery())
}
function canManage(row) {
  return auth.hasRole('admin') || (row.createBy && row.createBy === userStore.name)
}
function genInvite(row) { inviteClass(row.classId).then(res => { const d = res.data || {}; ElMessage.success(`邀请码：${d.inviteCode}，有效${d.expireHours}小时`) }) }
function doJoin(row) { joinClass(row.classId).then(() => { ElMessage.success('已加入'); handleQuery() }) }
function joinByCodePrompt() {
  ElMessageBox.prompt('请输入邀请码', '加入班级', { confirmButtonText: '加入', cancelButtonText: '取消' })
    .then(({ value }) => { return joinByCode(value) })
    .then(() => { ElMessage.success('已加入'); handleQuery() })
}
function isJoined(row) { return joinedIds.value.includes(row.classId) }

function resetQuery() { queryParams.value = { className: '', grade: '', majorId: undefined, teacherId: undefined, pageNum: 1, pageSize: queryParams.value.pageSize }; handleQuery() }

function getList() { handleQuery() }

function handleSelectionChange(selection) {
  selectedRows.value = selection
  single.value = selection.length !== 1
  multiple.value = selection.length === 0
}

function handleAdd() { openAdd() }
function handleUpdate() { if (selectedRows.value.length === 1) openEdit(selectedRows.value[0]) }
function handleDelete() {
  if (selectedRows.value.length === 0) return
  Promise.all(selectedRows.value.map(r => delClass(r.classId))).then(() => handleQuery())
}

listMajor({ pageNum: 1, pageSize: 1000, status: '0' }).then(res => { majorOptions.value = res.rows || [] })
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
