<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="学号" prop="studentName">
        <el-input
          v-model="queryParams.studentName"
          placeholder="请输入学号"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 200px">
          <el-option label="已提交" value="1" />
          <el-option label="已批改" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button icon="Back" @click="handleClose">返回</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="submissionList">
      <el-table-column label="学号" align="center" prop="studentName" />
      <el-table-column label="姓名" align="center" prop="nickName" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
            <el-tag v-if="scope.row.status == '1'">已提交</el-tag>
            <el-tag type="success" v-else-if="scope.row.status == '2'">已批改</el-tag>
            <el-tag type="info" v-else>草稿</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成绩" align="center" prop="grade" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="View"
            @click="handleView(scope.row)"
          >详情</el-button>
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleGrade(scope.row)"
          >批改</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- Grade Dialog -->
    <el-dialog title="批改作业" v-model="open" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" label-width="80px">
        <el-form-item label="成绩">
           <el-input v-model="form.grade" placeholder="请输入成绩 (例如: A, 90)" />
        </el-form-item>
        <el-form-item label="评语">
           <el-input v-model="form.gradeComment" type="textarea" :rows="4" placeholder="请输入评语" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitGrade">确 定</el-button>
          <el-button @click="open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- View Dialog -->
    <el-dialog title="作业详情" v-model="viewOpen" width="600px" append-to-body>
      <el-form :model="viewForm" label-width="80px">
        <el-form-item label="学号">
           <span>{{ viewForm.studentName }}</span>
        </el-form-item>
        <el-form-item label="姓名">
           <span>{{ viewForm.nickName }}</span>
        </el-form-item>
        <el-form-item label="提交内容">
           <div v-html="viewForm.content" style="border: 1px solid #dcdfe6; padding: 10px; border-radius: 4px; min-height: 100px;"></div>
        </el-form-item>
        <el-form-item label="附件">
           <el-link v-if="viewForm.fileUrl" :href="viewForm.fileUrl" target="_blank" type="primary" icon="Download">下载附件</el-link>
           <span v-else>无</span>
        </el-form-item>
        <el-form-item label="提交时间">
           <span>{{ viewForm.createTime }}</span>
        </el-form-item>
        <el-form-item label="成绩">
           <span>{{ viewForm.grade }}</span>
        </el-form-item>
        <el-form-item label="评语">
           <span>{{ viewForm.gradeComment }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="viewOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listSubmission, updateSubmission } from "@/api/edu/submission"
import { ElMessage } from 'element-plus'

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const submissionList = ref([])
const total = ref(0)
const showSearch = ref(true)
const open = ref(false)
const viewOpen = ref(false)
const queryRef = ref(null)
const formRef = ref(null)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  homeworkId: null,
  studentName: null,
  status: null
})

const form = ref({})
const viewForm = ref({})

const getList = () => {
  loading.value = true
  listSubmission(queryParams).then(response => {
    submissionList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  proxy.resetForm("queryRef")
  handleQuery()
}

const handleClose = () => {
  router.go(-1)
}

const handleView = (row) => {
    viewForm.value = { ...row }
    viewOpen.value = true
}

const handleGrade = (row) => {
    form.value = {
        id: row.id,
        grade: row.grade,
        gradeComment: row.gradeComment
    }
    open.value = true
}

const submitGrade = () => {
    form.value.status = '2' // Graded
    updateSubmission(form.value).then(response => {
        ElMessage.success("批改成功")
        open.value = false
        getList()
    })
}

onMounted(() => {
    const homeworkId = route.params.homeworkId
    if (homeworkId) {
        queryParams.homeworkId = homeworkId
        getList()
    }
})
</script>
