<template>
  <div class="question-bank-panel">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-group">
        <el-input
          v-model="queryParams.content"
          placeholder="搜索题目内容..."
          class="search-input"
          clearable
          @keyup.enter="handleQuery"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select 
          v-model="queryParams.type" 
          placeholder="题目类型" 
          class="type-select"
          clearable
          @change="handleQuery"
        >
          <el-option label="单选题" value="1" />
          <el-option label="多选题" value="2" />
          <el-option label="判断题" value="3" />
          <el-option label="简答题" value="4" />
        </el-select>
        
        <el-button type="primary" class="search-btn" @click="handleQuery">
          搜索
        </el-button>
      </div>

      <div class="action-group">
        <el-button type="primary" class="add-btn" @click="handleAdd">
          <el-icon class="el-icon--left"><Plus /></el-icon>
          新建题目
        </el-button>
        <el-button-group>
          <el-button plain @click="handleImport">
            <el-icon><Upload /></el-icon>
            导入
          </el-button>
          <el-button plain @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- Question List -->
    <div class="question-list-wrapper">
      <el-table 
        v-loading="loading" 
        :data="questionList" 
        class="custom-table"
        height="100%"
      >
        <el-table-column label="题目内容" min-width="400">
          <template #default="{ row }">
            <div class="question-content-wrapper">
              <div class="content-text" :title="stripHtml(row.content)">
                {{ stripHtml(row.content) }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="标签" width="200">
          <template #default="{ row }">
            <div class="tags-row" v-if="row.tags">
              <el-tag 
                v-for="tag in row.tags.split(',')" 
                :key="tag" 
                type="info" 
                size="small" 
                class="mini-tag"
                effect="plain"
              >
                # {{ tag }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="题目类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)" effect="light" round>
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" prop="createTime" width="180" align="center">
          <template #default="{ row }">
            <span class="time-text">{{ row.createTime }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button link type="danger" @click="handleDelete(row)">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="getList"
          @current-change="getList"
        />
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <el-dialog
      :title="title"
      v-model="open"
      width="600px"
      append-to-body
      class="question-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="question-form-container">
        <el-form ref="questionRef" :model="form" :rules="rules" label-position="top">
          
          <div class="form-section">
            <div class="section-header">基本信息</div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="题目类型" prop="type">
                  <el-select v-model="form.type" placeholder="请选择" @change="handleTypeChange" style="width: 100%">
                    <el-option label="单选题" value="1" />
                    <el-option label="多选题" value="2" />
                    <el-option label="判断题" value="3" />
                    <el-option label="简答题" value="4" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="标签" prop="tags">
                  <el-select
                    v-model="form.tagsArray"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    placeholder="输入标签按回车确认"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="题目内容" prop="content">
              <Editor v-model="form.content" :min-height="192" />
            </el-form-item>
          </div>

          <!-- Options Section (Choice only) -->
          <div class="form-section" v-if="['1', '2'].includes(form.type)">
            <div class="section-header">选项设置</div>
            <div class="options-list">
              <div v-for="(item, index) in form.options" :key="index" class="option-item-row">
                <div class="option-key">{{ item.key }}</div>
                <el-input v-model="item.value" placeholder="请输入选项内容" class="option-input">
                  <template #suffix>
                    <el-button link type="danger" @click="removeOption(index)" v-if="form.options.length > 2">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </template>
                </el-input>
              </div>
              <el-button plain type="primary" size="small" @click="addOption" style="margin-top: 8px;">
                <el-icon><Plus /></el-icon> 添加选项
              </el-button>
            </div>
          </div>

          <div class="form-section">
            <div class="section-header">答案与解析</div>
            <el-form-item label="正确答案" prop="answer">
              <!-- Single Choice -->
              <el-radio-group v-model="form.answer" v-if="form.type === '1'">
                <el-radio v-for="opt in form.options" :key="opt.key" :label="opt.key">
                  {{ opt.key }}
                </el-radio>
              </el-radio-group>
              <!-- Multiple Choice -->
              <el-checkbox-group v-model="form.answerArray" v-if="form.type === '2'">
                <el-checkbox v-for="opt in form.options" :key="opt.key" :label="opt.key">
                  {{ opt.key }}
                </el-checkbox>
              </el-checkbox-group>
              <!-- Judge -->
              <el-radio-group v-model="form.answer" v-if="form.type === '3'">
                <el-radio label="A">正确</el-radio>
                <el-radio label="B">错误</el-radio>
              </el-radio-group>
              <!-- Text -->
              <el-input v-model="form.answer" type="textarea" v-if="form.type === '4'" placeholder="请输入参考答案" />
            </el-form-item>

            <el-form-item label="解析" prop="analysis">
              <el-input
                v-model="form.analysis"
                type="textarea"
                :rows="2"
                placeholder="请输入题目解析（可选）"
              />
            </el-form-item>
          </div>

        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="open = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Import Dialog -->
    <el-dialog :title="importTitle" v-model="importOpen" width="500px" append-to-body class="import-dialog">
      <div class="import-container">
        <el-upload
          class="custom-upload"
          drag
          :action="uploadUrl"
          :headers="headers"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :before-upload="beforeUpload"
          :show-file-list="false"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处，或 <em>点击上传</em>
          </div>
          <div class="upload-hint">支持 .xlsx, .xls 格式文件</div>
        </el-upload>
        
        <div class="import-options">
          <div class="template-download">
            <el-icon><Document /></el-icon>
            <el-link type="primary" :underline="false" @click="importTemplate">下载导入模板</el-link>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { Search, Plus, Upload, Download, Delete, Document, UploadFilled, Edit } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { listQuestion, getQuestion, delQuestion, addQuestion, updateQuestion } from '@/api/edu/question';
import { download } from '@/utils/request';
import { getToken } from "@/utils/auth";
import Editor from '@/components/Editor/index.vue';

const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const questionList = ref([]);
const title = ref("");
const open = ref(false);
const importOpen = ref(false);
const importTitle = ref("导入题目");
const uploadUrl = ref(import.meta.env.VITE_APP_BASE_API + "/system/question/importData");
const headers = ref({ Authorization: "Bearer " + getToken() });

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  content: null,
  type: null,
});

const form = reactive({
  id: null,
  type: '1',
  content: '',
  options: [],
  answer: '',
  answerArray: [],
  analysis: '',
  tags: '',
  tagsArray: []
});

const rules = {
  type: [{ required: true, message: "题目类型不能为空", trigger: "change" }],
  content: [{ required: true, message: "题目内容不能为空", trigger: "blur" }],
  answer: [{ required: true, message: "答案不能为空", trigger: "change" }]
};

watch(() => form.answerArray, (val) => {
  if (form.type === '2') {
    form.answer = val.join(',');
  }
}, { deep: true });

const questionRef = ref(null);

// Methods
function getList() {
  loading.value = true;
  listQuestion(queryParams).then(response => {
    questionList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

function reset() {
  form.id = null;
  form.type = '1';
  form.content = '';
  form.options = [
    { key: 'A', value: '' },
    { key: 'B', value: '' },
    { key: 'C', value: '' },
    { key: 'D', value: '' }
  ];
  form.answer = '';
  form.answerArray = [];
  form.analysis = '';
  form.tags = '';
  form.tagsArray = [];
  if (questionRef.value) questionRef.value.resetFields();
}

function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加题目";
}

function handleEdit(row) {
  reset();
  const id = row.id;
  getQuestion(id).then(response => {
    const data = response.data;
    // Parse options if string
    if (typeof data.options === 'string' && data.options) {
      try {
        data.options = JSON.parse(data.options);
      } catch (e) {
        data.options = [];
      }
    }
    // Parse tags
    data.tagsArray = data.tags ? data.tags.split(',') : [];
    
    // Handle answer for multiple choice
    if (data.type === '2') {
        data.answerArray = data.answer ? data.answer.split(',') : [];
    }

    Object.assign(form, data);
    open.value = true;
    title.value = "修改题目";
  });
}

function handleDelete(row) {
  ElMessageBox.confirm('是否确认删除该题目?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return delQuestion(row.id);
  }).then(() => {
    getList();
    ElMessage.success("删除成功");
  }).catch(() => {});
}

function submitForm() {
  questionRef.value.validate(valid => {
    if (valid) {
      // Process form data
      const data = { ...form };
      data.tags = data.tagsArray.join(',');
      data.options = JSON.stringify(data.options);

      if (form.id != null) {
        updateQuestion(data).then(() => {
          ElMessage.success("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addQuestion(data).then(() => {
          ElMessage.success("添加成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

// Option helpers
function addOption() {
  const keys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  if (form.options.length >= keys.length) return;
  const nextKey = keys[form.options.length];
  form.options.push({ key: nextKey, value: '' });
}

function removeOption(index) {
  form.options.splice(index, 1);
  // Re-index keys
  const keys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  form.options.forEach((opt, idx) => {
    opt.key = keys[idx];
  });
}

function handleTypeChange() {
    form.answer = '';
    form.answerArray = [];
    if (['1', '2'].includes(form.type) && (!form.options || form.options.length === 0)) {
        form.options = [
            { key: 'A', value: '' },
            { key: 'B', value: '' },
            { key: 'C', value: '' },
            { key: 'D', value: '' }
        ];
    }
}

// Display helpers
function getTypeTag(type) {
  const map = { '1': 'primary', '2': 'success', '3': 'warning', '4': 'info' };
  return map[type] || 'info';
}

function getTypeLabel(type) {
  const map = { '1': '单选题', '2': '多选题', '3': '判断题', '4': '简答题' };
  return map[type] || type;
}

function formatAnswer(row) {
    if (row.type === '3') return row.answer === 'A' ? '正确' : '错误';
    return row.answer;
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "");
}

// Import/Export
function handleImport() {
  importOpen.value = true;
}

function handleExport() {
  ElMessageBox.confirm('是否确认导出所有题目数据项?', "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    download('system/question/export', queryParams, `question_${new Date().getTime()}.xlsx`);
  }).catch(() => {});
}

function importTemplate() {
  download("system/question/importTemplate", {}, `question_template_${new Date().getTime()}.xlsx`);
}

function handleUploadSuccess(response) {
    importOpen.value = false;
    getList();
    ElMessage.success(response.msg || "导入成功");
}

function handleUploadError() {
    ElMessage.error("导入失败，请重试");
}

function beforeUpload(file) {
    const isExcel = file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.type === "application/vnd.ms-excel";
    if (!isExcel) {
        ElMessage.error("只能上传 Excel 文件!");
    }
    return isExcel;
}

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.question-bank-panel {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.question-list-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.custom-table {
    :deep(.el-table__header-wrapper) {
        th {
            background-color: #f9fafb !important;
            color: #4b5563;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.05em;
            padding: 16px 0;
        }
    }
    :deep(.el-table__row) {
        td { padding: 16px 0; }
        &:hover td { background-color: #e6f7ff !important; }
    }
}

.question-content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 4px 0;
}

.content-text {
    font-size: 15px;
    color: #1f2937;
    font-weight: 500;
    line-height: 1.6;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    
    .mini-tag {
        border: none;
        background: #f3f4f6;
        color: #6b7280;
        font-size: 12px;
        height: 22px;
        padding: 0 8px;
        border-radius: 4px;
    }
}

.time-text {
    color: #6b7280;
    font-family: 'Menlo', 'Monaco', monospace;
    font-size: 13px;
}

.table-actions {
    display: flex;
    justify-content: center;
    gap: 8px;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 20px;
  background: #f9fafb;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #f3f4f6;

  .search-group {
      display: flex;
      gap: 12px;
      flex: 1;
      max-width: 600px;
      
      .search-input {
          flex: 2;
          :deep(.el-input__wrapper) {
              border-radius: 12px;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
          }
      }
      .type-select {
          flex: 1;
          :deep(.el-input__wrapper) {
              border-radius: 12px;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
          }
      }
      .search-btn {
          border-radius: 12px;
          padding: 0 24px;
          font-weight: 600;
      }
  }

  .action-group {
      display: flex;
      gap: 12px;
      
      .add-btn {
          border-radius: 12px;
          padding: 0 24px;
          font-weight: 600;
          background: #409EFF;
          border: none;
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
          &:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(24, 144, 255, 0.3); }
      }
      
      :deep(.el-button-group) {
          .el-button {
              border-radius: 12px;
              &:first-child { border-top-right-radius: 0; border-bottom-right-radius: 0; }
              &:last-child { border-top-left-radius: 0; border-bottom-left-radius: 0; }
          }
      }
  }
}
.pagination-container {
    margin-top: auto;
    padding-top: 20px;
    display: flex;
    justify-content: flex-end;
}

/* Question Dialog Styles */
:deep(.question-dialog) {
  border-radius: 8px;
  
  .el-dialog__body {
    padding: 20px 30px;
  }
}

.question-form-container {
  .form-section {
    margin-bottom: 25px;
    
    .section-header {
      font-size: 14px;
      font-weight: bold;
      color: #303133;
      margin-bottom: 15px;
      padding-left: 8px;
      border-left: 3px solid #409EFF;
      line-height: 1;
    }
  }

  .options-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    
    .option-item-row {
      display: flex;
      align-items: center;
      gap: 10px;
      
      .option-key {
        width: 30px;
        height: 30px;
        background: #f4f4f5;
        color: #909399;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-weight: bold;
        flex-shrink: 0;
      }
      
      .option-input {
        flex: 1;
      }
    }
  }
}

/* Import Dialog */
:deep(.import-dialog) {
    border-radius: 20px;
    .el-dialog__header {
        padding: 24px 32px;
        border-bottom: 1px solid #f3f4f6;
    }
    .import-container {
        padding: 20px 0;
    }
    .custom-upload {
        width: 100%;
        .el-upload-dragger {
            border-radius: 16px;
            padding: 40px;
            border: 2px dashed #e5e7eb;
            &:hover { border-color: #1890ff; background: #e6f7ff; }
        }
    }
    .upload-hint {
        font-size: 13px;
        color: #9ca3af;
        margin-top: 8px;
    }
    .import-options {
        margin-top: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f9fafb;
        padding: 12px 20px;
        border-radius: 12px;
    }
    .template-download {
        font-size: 13px;
        color: #6b7280;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .import-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        .upload-confirm-btn {
            border-radius: 10px;
            font-weight: 600;
        }
    }
}
</style>