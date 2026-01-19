<template>
  <div class="exam-detail-container">
    <portal-navbar />
    <div class="main-content" v-loading="loading">
      <div class="exam-header" v-if="examData">
        <div class="exam-title">{{ examData.title }}</div>
        <div class="exam-info">
          <span class="info-item"><el-icon><Timer /></el-icon> 考试时长: {{ examData.duration }} 分钟</span>
          <span class="info-item"><el-icon><DataBoard /></el-icon> 总分: {{ examData.totalScore }} 分</span>
          <span class="info-item warning"><el-icon><Warning /></el-icon> 请注意考试时间，倒计时结束将自动提交</span>
        </div>
        <div class="exam-timer" :class="{ urgent: remainingTime < 300 }">
          剩余时间: {{ formatTime(remainingTime) }}
        </div>
      </div>

      <div class="exam-body" v-if="examData">
        <el-form ref="examFormRef" :model="answerForm" label-position="top">
          <div v-for="(question, index) in examData.questions" :key="question.questionId" class="question-item">
            <div class="question-title">
              <span class="index">{{ index + 1 }}.</span>
              <span class="type-tag">
                {{ getQuestionTypeLabel(question.questionType) }}
              </span>
              <span class="score">({{ question.score }}分)</span>
              <div class="content">{{ question.content }}</div>
            </div>
            
            <div class="question-options">
              <!-- Single Choice -->
              <el-radio-group v-if="question.questionType === '1' || question.questionType === '3'" v-model="answerForm.answers[question.questionId]">
                <div v-for="opt in parseOptions(question)" :key="opt.key" class="option-item">
                  <el-radio :label="opt.key">{{ opt.key }}. {{ opt.value }}</el-radio>
                </div>
              </el-radio-group>
              
              <!-- Multiple Choice -->
              <el-checkbox-group v-if="question.questionType === '2'" v-model="answerForm.answers[question.questionId]">
                <div v-for="opt in parseOptions(question)" :key="opt.key" class="option-item">
                  <el-checkbox :label="opt.key">{{ opt.key }}. {{ opt.value }}</el-checkbox>
                </div>
              </el-checkbox-group>

              <!-- Short Answer -->
              <el-input 
                v-if="question.questionType === '4'" 
                type="textarea" 
                :rows="4" 
                v-model="answerForm.answers[question.questionId]"
                placeholder="请输入您的答案"
              />
            </div>
          </div>
        </el-form>
      </div>

      <div class="exam-footer" v-if="examData">
        <el-button @click="handleCancel">返回</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">提交试卷</el-button>
      </div>
      
      <el-empty v-if="!loading && !examData" description="未找到考试信息" />
    </div>
  </div>
</template>

<script setup name="ExamDetail">
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PortalNavbar from '@/components/PortalNavbar/index.vue'
import { getExam, submitExam } from '@/api/edu/exam'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Timer, DataBoard, Warning } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const examId = route.params.id

const loading = ref(false)
const submitting = ref(false)
const examData = ref(null)
const remainingTime = ref(0)
const timerInterval = ref(null)

const answerForm = reactive({
  answers: {} // questionId -> answer
})

const questionTypes = {
  '1': '单选题',
  '2': '多选题',
  '3': '判断题',
  '4': '简答题'
}

function getQuestionTypeLabel(type) {
  return questionTypes[type] || '未知题型'
}

function parseOptions(question) {
  // Assuming options are stored appropriately. 
  // If backend returns a JSON string in 'options' field or separated fields like optionA, optionB...
  // For now, let's assume specific fields or a standardized list.
  // Adapting to common RuoYi pattern or simple list.
  
  // If it's True/False
  if (question.questionType === '3') {
    return [
      { key: 'A', value: '正确' },
      { key: 'B', value: '错误' }
    ]
  }

  // If options are in a list
  if (question.optionList) {
      return question.optionList
  }

  // Fallback if options are just A, B, C, D text fields (common in simple DB designs)
  const opts = []
  if (question.optionA) opts.push({ key: 'A', value: question.optionA })
  if (question.optionB) opts.push({ key: 'B', value: question.optionB })
  if (question.optionC) opts.push({ key: 'C', value: question.optionC })
  if (question.optionD) opts.push({ key: 'D', value: question.optionD })
  if (question.optionE) opts.push({ key: 'E', value: question.optionE })
  
  return opts
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function startTimer() {
  if (timerInterval.value) clearInterval(timerInterval.value)
  timerInterval.value = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      clearInterval(timerInterval.value)
      ElMessageBox.alert('考试时间已到，系统将自动提交试卷', '提示', {
        confirmButtonText: '确定',
        callback: () => {
          doSubmit(true)
        }
      })
    }
  }, 1000)
}

function loadExam() {
  loading.value = true
  getExam(examId).then(res => {
    examData.value = res.data
    // Initialize answers
    if (examData.value.questions) {
      examData.value.questions.forEach(q => {
        if (q.questionType === '2') {
          answerForm.answers[q.questionId] = []
        } else {
          answerForm.answers[q.questionId] = ''
        }
      })
    }
    
    // Set timer (minutes to seconds)
    remainingTime.value = (examData.value.duration || 60) * 60
    startTimer()
    loading.value = false
  }).catch(() => {
    loading.value = false
    ElMessage.error('加载考试信息失败')
  })
}

function handleCancel() {
  ElMessageBox.confirm('退出后考试进度将不会保存，确定退出吗？', '提示', {
    type: 'warning'
  }).then(() => {
    router.back()
  })
}

function handleSubmit() {
  // Check completion
  const total = examData.value.questions.length
  let answered = 0
  examData.value.questions.forEach(q => {
    const ans = answerForm.answers[q.questionId]
    if (Array.isArray(ans)) {
      if (ans.length > 0) answered++
    } else if (ans) {
      answered++
    }
  })

  if (answered < total) {
    ElMessageBox.confirm(`您还有 ${total - answered} 道题未完成，确定提交吗？`, '提示', {
      type: 'warning'
    }).then(() => {
      doSubmit()
    })
  } else {
    ElMessageBox.confirm('确定提交试卷吗？', '提示', {
      type: 'primary'
    }).then(() => {
      doSubmit()
    })
  }
}

function doSubmit(auto = false) {
  if (submitting.value) return
  submitting.value = true
  
  // Format answers for backend
  // Expecting a list of { questionId, userAnswer } or map
  const submission = {
    examId: examId,
    answers: JSON.stringify(answerForm.answers)
  }

  submitExam(submission).then(res => {
    ElMessage.success('提交成功')
    router.push('/portal/profile?tab=exams')
  }).catch(() => {
    submitting.value = false
  })
}

onMounted(() => {
  if (examId) {
    loadExam()
  } else {
    ElMessage.error('参数错误')
    router.back()
  }
})

onBeforeUnmount(() => {
  if (timerInterval.value) clearInterval(timerInterval.value)
})
</script>

<style scoped lang="scss">
.exam-detail-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.main-content {
  width: 1000px;
  margin: 30px auto;
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  position: relative;
}

.exam-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
  margin-bottom: 30px;
  position: relative;
  
  .exam-title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
    text-align: center;
  }
  
  .exam-info {
    display: flex;
    justify-content: center;
    gap: 30px;
    color: #666;
    font-size: 14px;
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 5px;
      
      &.warning {
        color: #e6a23c;
      }
    }
  }
  
  .exam-timer {
    position: fixed;
    top: 100px;
    right: 40px;
    background: #fff;
    padding: 10px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    font-size: 16px;
    font-weight: bold;
    color: #409EFF;
    z-index: 100;
    
    &.urgent {
      color: #F56C6C;
      animation: pulse 1s infinite;
    }
  }
}

.question-item {
  margin-bottom: 30px;
  
  .question-title {
    font-size: 16px;
    color: #333;
    margin-bottom: 15px;
    line-height: 1.6;
    
    .index {
      font-weight: bold;
      margin-right: 5px;
    }
    
    .type-tag {
      background: #ecf5ff;
      color: #409EFF;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      margin-right: 8px;
    }
    
    .score {
      color: #999;
      margin-right: 10px;
      font-size: 13px;
    }
    
    .content {
      display: inline;
    }
  }
  
  .question-options {
    padding-left: 20px;
    
    .option-item {
      margin-bottom: 10px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.exam-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
  gap: 20px;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>
