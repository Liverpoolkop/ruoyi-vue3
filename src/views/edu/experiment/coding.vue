<template>
  <div class="coding-container">
    <!-- Header -->
    <div class="coding-header">
      <div class="header-left">
        <el-button icon="ArrowLeft" @click="goBack">返回课程</el-button>
        <span class="experiment-title">{{ experiment.experimentName }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" :loading="running" @click="handleRun">
          <el-icon><VideoPlay /></el-icon> 运行代码
        </el-button>
        <el-button type="success" :loading="submitting" @click="handleSubmit">
          <el-icon><Check /></el-icon> 提交判题
        </el-button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="coding-body">
      <!-- Left: Problem Description -->
      <div class="problem-panel">
        <div class="panel-header">题目描述</div>
        <div class="panel-content">
          <div class="problem-section">
            <h3>实验要求</h3>
            <div class="problem-desc">{{ experiment.description || '暂无描述' }}</div>
          </div>
          
          <div class="problem-section" v-if="experiment.testInput">
            <h3>示例输入</h3>
            <pre class="sample-block">{{ experiment.testInput }}</pre>
          </div>
          
          <div class="problem-section" v-if="experiment.testOutput">
            <h3>期望输出</h3>
            <pre class="sample-block">{{ experiment.testOutput }}</pre>
          </div>
        </div>
      </div>

      <!-- Right: Code Editor & Result -->
      <div class="editor-panel">
        <div class="panel-header">
          <span>代码编辑器</span>
          <el-tag type="info" size="small">Java</el-tag>
        </div>
        
        <!-- Code Editor Area -->
        <div class="editor-wrapper">
          <el-input
            v-model="code"
            type="textarea"
            :rows="15"
            placeholder="请在此编写 Java 代码..."
            class="code-textarea"
            resize="none"
          />
        </div>

        <!-- Custom Input Area -->
        <div class="input-wrapper">
          <div class="input-header">
            <span>自定义输入</span>
            <el-tooltip content="运行代码时会将此处内容作为程序的标准输入" placement="top">
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
          <el-input
            v-model="customInput"
            type="textarea"
            :rows="3"
            placeholder="在此输入测试数据（如果程序需要输入）..."
            class="input-textarea"
          />
        </div>

        <!-- Result Panel -->
        <div class="result-panel">
          <div class="result-header">
            <span>执行结果</span>
            <el-tag v-if="result.status" :type="getResultTagType(result.status)" size="small">
              {{ result.status }}
            </el-tag>
          </div>
          
          <div class="result-content" v-if="result.show">
            <div v-if="result.stdout" class="result-section">
              <div class="result-label">输出:</div>
              <pre class="result-block">{{ result.stdout }}</pre>
            </div>
            
            <div v-if="result.stderr" class="result-section">
              <div class="result-label error">错误:</div>
              <pre class="result-block error">{{ result.stderr }}</pre>
            </div>
            
            <div v-if="result.compileOutput" class="result-section">
              <div class="result-label error">编译输出:</div>
              <pre class="result-block error">{{ result.compileOutput }}</pre>
            </div>
            
            <div v-if="result.time || result.memory" class="result-meta">
              <span v-if="result.time">⏱️ 运行时间: {{ result.time }}s</span>
              <span v-if="result.memory">💾 内存: {{ (result.memory / 1024).toFixed(2) }} MB</span>
            </div>
          </div>
          
          <div v-else class="result-empty">
            点击"运行代码"或"提交判题"查看结果
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getExperiment, runCode, submitCode } from '@/api/edu/experiment'
import { ElMessage } from 'element-plus'
import { VideoPlay, Check, ArrowLeft, InfoFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const experimentId = route.params.id

const experiment = ref({})
const code = ref(`public class Main {
    public static void main(String[] args) {
        // 请在此编写代码
        System.out.println("Hello World");
    }
}`)
const customInput = ref('')


const running = ref(false)
const submitting = ref(false)
const result = ref({
  show: false,
  status: '',
  stdout: '',
  stderr: '',
  compileOutput: '',
  time: null,
  memory: null
})

onMounted(() => {
  loadExperiment()
})

function loadExperiment() {
  getExperiment(experimentId).then(res => {
    experiment.value = res.data || {}
  })
}

function goBack() {
  router.go(-1)
}

function handleRun() {
  if (!code.value.trim()) {
    ElMessage.warning('请先编写代码')
    return
  }
  
  running.value = true
  result.value = { show: false }
  
  runCode(experimentId, code.value, customInput.value).then(res => {
    parseResult(res.data)
  }).catch(err => {
    ElMessage.error('运行失败: ' + (err.message || '未知错误'))
  }).finally(() => {
    running.value = false
  })
}

function handleSubmit() {
  if (!code.value.trim()) {
    ElMessage.warning('请先编写代码')
    return
  }
  
  submitting.value = true
  result.value = { show: false }
  
  submitCode(experimentId, code.value).then(res => {
    const data = res.data
    if (data.judgeResult) {
      parseResult(data.judgeResult)
    }
    if (data.submission) {
      ElMessage.success('提交成功')
    }
  }).catch(() => {
    // 错误已由 request 拦截器处理，这里不再重复提示
  }).finally(() => {
    submitting.value = false
  })
}

function parseResult(data) {
  console.log('Judge0 返回数据:', data)
  
  // 检查是否有错误
  if (data.error) {
    result.value = {
      show: true,
      status: '错误',
      stdout: '',
      stderr: data.error,
      compileOutput: '',
      time: null,
      memory: null
    }
    return
  }
  
  // 解析状态 - 兼容不同的数据结构
  let statusDesc = 'Unknown'
  if (data.status) {
    if (typeof data.status === 'object' && data.status.description) {
      statusDesc = data.status.description
    } else if (typeof data.status === 'string') {
      statusDesc = data.status
    }
  }
  
  // 翻译为中文
  statusDesc = translateStatus(statusDesc)
  
  result.value = {
    show: true,
    status: statusDesc,
    stdout: data.stdout || '',
    stderr: data.stderr || '',
    compileOutput: data.compile_output || '',
    time: data.time,
    memory: data.memory
  }
}

// 状态翻译映射
const statusMap = {
  'Accepted': '通过',
  'Wrong Answer': '答案错误',
  'Compilation Error': '编译错误',
  'Runtime Error': '运行时错误',
  'Time Limit Exceeded': '超时',
  'Memory Limit Exceeded': '内存超限',
  'Internal Error': '内部错误',
  'Exec Format Error': '执行格式错误',
  'In Queue': '排队中',
  'Processing': '处理中',
  'Unknown': '未知'
}

function translateStatus(status) {
  return statusMap[status] || status
}

function getResultTagType(status) {
  if (status === '通过') return 'success'
  if (status === '答案错误' || status.includes('错误')) return 'danger'
  if (status === '超时' || status === '内存超限') return 'warning'
  if (status === '排队中' || status === '处理中') return 'info'
  return 'info'
}
</script>

<style scoped>
.coding-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.coding-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.experiment-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 10px;
}

.coding-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.problem-panel {
  width: 40%;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.panel-header {
  padding: 12px 15px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.problem-section {
  margin-bottom: 20px;
}

.problem-section h3 {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.problem-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  white-space: pre-wrap;
}

.sample-block {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: #303133;
  overflow-x: auto;
}

.editor-wrapper {
  flex: 1;
  padding: 10px;
  min-height: 300px;
}

.code-textarea {
  height: 100%;
}

.code-textarea :deep(.el-textarea__inner) {
  height: 100%;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  background: #1e1e1e;
  color: #d4d4d4;
  border: none;
  border-radius: 4px;
}

.input-wrapper {
  padding: 10px;
  border-top: 1px solid #e4e7ed;
}

.input-header {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
}

.input-textarea :deep(.el-textarea__inner) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.result-panel {
  border-top: 1px solid #e4e7ed;
  max-height: 250px;
  display: flex;
  flex-direction: column;
}

.result-header {
  padding: 10px 15px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-content {
  flex: 1;
  padding: 10px 15px;
  overflow-y: auto;
}

.result-section {
  margin-bottom: 10px;
}

.result-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.result-label.error {
  color: #f56c6c;
}

.result-block {
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: #303133;
  max-height: 100px;
  overflow: auto;
}

.result-block.error {
  background: #fef0f0;
  color: #f56c6c;
}

.result-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #909399;
  margin-top: 10px;
}

.result-empty {
  padding: 30px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>
