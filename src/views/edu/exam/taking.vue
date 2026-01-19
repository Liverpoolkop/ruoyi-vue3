<template>
  <div class="exam-taking-container" v-loading="loading" element-loading-text="正在加载试卷...">
    
    <div class="exam-header">
      <div class="header-left">
        <span class="exam-title" v-if="examInfo">{{ examInfo.title }}</span>
        <el-tag v-if="examInfo" type="info" size="small" style="margin-left: 10px">
          卷面总分: {{ examInfo.totalScore }}
        </el-tag>
      </div>
      
      <div class="header-center" v-if="!isFinished">
        <div class="countdown-box" :class="{ 'urgent': remainingSeconds < 300 }">
          <el-icon><Timer /></el-icon>
          <span class="label">剩余时间：</span>
          <span class="time-text">{{ formattedTime }}</span>
        </div>
      </div>
      <div class="header-center" v-else>
        <el-tag type="success" size="large" effect="dark">
          {{ recordInfo.status === '3' ? '已阅卷' : '已交卷' }}
        </el-tag>
      </div>

      <div class="header-right">
        <el-avatar :size="30" :src="userStore.avatar" style="margin-right: 10px"></el-avatar>
        <span class="user-name">{{ userStore.nickName }}</span>
        
        <el-button v-if="!isFinished" type="primary" size="small" style="margin-left: 20px" @click="handleSubmitCheck">
          交 卷
        </el-button>
        <el-button v-else type="info" plain size="small" style="margin-left: 20px" @click="handleExit">
          退出
        </el-button>
      </div>
    </div>

    <div class="exam-body" v-if="!isFinished">
      <div class="question-area modern-scroll">
        <div v-for="(q, index) in questionList" :key="q.id" :id="'q-' + index" class="question-card">
          <div class="q-header">
            <span class="q-index">{{ index + 1 }}</span>
            <span class="q-type">[{{ getTypeName(q.type) }}]</span>
            <span class="q-score">({{ q.score }}分)</span>
          </div>
          <div class="q-content">{{ q.content }}</div>
          
          <div class="q-answer">
            <el-radio-group v-if="q.type === '1'" v-model="answers[q.id]">
              <el-radio v-for="opt in parseOptions(q.options)" :key="opt.key" :label="opt.key" class="option-item">
                {{ opt.key }}. {{ opt.value }}
              </el-radio>
            </el-radio-group>
            <el-checkbox-group v-if="q.type === '2'" v-model="answers[q.id]">
              <el-checkbox v-for="opt in parseOptions(q.options)" :key="opt.key" :label="opt.key" class="option-item">
                {{ opt.key }}. {{ opt.value }}
              </el-checkbox>
            </el-checkbox-group>
            <el-radio-group v-if="q.type === '3'" v-model="answers[q.id]">
              <el-radio label="A">正确</el-radio>
              <el-radio label="B">错误</el-radio>
            </el-radio-group>
            <el-input v-if="q.type === '4'" v-model="answers[q.id]" type="textarea" :rows="5" placeholder="请输入您的答案..." />
          </div>
        </div>
      </div>

      <div class="answer-sheet">
        <div class="sheet-title">答题卡</div>
        <div class="sheet-grid">
          <div 
            v-for="(q, index) in questionList" 
            :key="q.id" 
            class="sheet-item"
            :class="{ 'answered': isAnswered(q.id) }"
            @click="scrollToQuestion(index)"
          >
            {{ index + 1 }}
          </div>
        </div>
        <div class="sheet-legend">
          <span class="legend-item"><span class="dot answered"></span> 已答</span>
          <span class="legend-item"><span class="dot"></span> 未答</span>
        </div>
      </div>
    </div>

    <div class="result-body" v-else>
      
      <div v-if="recordInfo.status === '2'" class="score-card">
         <el-result icon="success" title="提交成功" sub-title="试卷已提交给老师，请耐心等待阅卷结果。">
           <template #extra>
             <el-button type="primary" @click="handleExit">返回课程</el-button>
           </template>
         </el-result>
      </div>

      <div v-else-if="recordInfo.status === '3'" class="score-card">
        <div class="score-circle">
          <div class="score-num">{{ recordInfo.totalScore || 0 }}</div>
          <div class="score-label">最终得分</div>
        </div>
        
        <div class="score-details">
          <div class="detail-item">
             <span class="label">客观题得分</span>
             <span class="value">{{ recordInfo.objectiveScore || 0 }} 分</span>
          </div>
          <div class="detail-item">
             <span class="label">主观题得分</span>
             <span class="value">{{ recordInfo.subjectiveScore || 0 }} 分</span>
          </div>
          <div class="detail-item" v-if="recordInfo.teacherComment">
             <span class="label">老师评语</span>
             <span class="value" style="max-width:200px; text-align:right">{{ recordInfo.teacherComment }}</span>
          </div>
        </div>

        <div class="result-actions">
          <el-button type="primary" size="large" @click="handleExit">返回课程</el-button>
        </div>
      </div>
      
    </div>
    
    <div class="anti-cheat-mask" v-if="!isFinished" @contextmenu.prevent></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { startExam, submitExamPaper, recordCheat } from '@/api/edu/exam'
import useUserStore from '@/store/modules/user'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Timer } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const examId = route.params.examId
const loading = ref(true)
const examInfo = ref(null)
const recordInfo = ref({})
const questionList = ref([])
const answers = ref({}) 
const serverTimeDiff = ref(0)
const remainingSeconds = ref(0)
let timer = null
const cheatCount = ref(0)

// 判断是否已完成（2=已提交，3=已阅卷）
const isFinished = computed(() => {
  return recordInfo.value.status === '2' || recordInfo.value.status === '3'
})

// ==================== 1. 生命周期部分 (添加 blur 监听) ====================

onMounted(() => {
  initExam()
  
  // 监听标签页切换/最小化
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // 👇👇👇【新增】监听窗口失去焦点 (检测鼠标点到外面) 👇👇👇
  window.addEventListener('blur', handleWindowBlur)
  
  // 拦截
  window.addEventListener('beforeunload', handleBeforeUnload)
  document.oncontextmenu = () => false
  document.onselectstart = () => false
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  
  // 移除监听
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('blur', handleWindowBlur) // 👇 别忘了移除这个
  window.removeEventListener('beforeunload', handleBeforeUnload)
  
  document.oncontextmenu = null
  document.onselectstart = null
})


// ==================== 2. 防作弊逻辑部分 (核心修改) ====================

// 通用的记录函数：无论是切屏还是失焦，都走这里
const recordCheatAction = (reason) => {
  // 1. 如果已交卷，直接忽略
  if (isFinished.value) return;

  // 2. 计数 +1
  cheatCount.value++
  
  // 3. 提示文案
  const warningText = `警告：检测到${reason}！这是第 ${cheatCount.value} 次，累计 5 次将强制交卷。`
  
  // 使用 grouping: true 防止短时间内连续弹窗刷屏
  ElMessage.warning({
    message: warningText,
    duration: 4000,
    grouping: true 
  })

  // 4. 调用后端接口
  if (recordInfo.value && recordInfo.value.id) {
    recordCheat({ id: recordInfo.value.id }).then(() => {
      console.log('作弊记录已上报');
    }).catch(() => {}) // 忽略网络错误，不影响流程
  }

  // 5. 达到阈值强制交卷
  if (cheatCount.value >= 5) {
    // 移除监听，防止强制交卷过程中重复触发
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('blur', handleWindowBlur)
    
    forceSubmit('切屏次数过多，被判定为作弊，强制交卷。')
  }
}

// 处理：标签页切换或最小化
const handleVisibilityChange = () => {
  if (document.hidden) {
    recordCheatAction("切屏或最小化")
  }
}

// 👇👇👇【新增】处理：鼠标点击浏览器外部 👇👇👇
const handleWindowBlur = () => {
  // 只有当文档还是可见状态时触发 blur，才算是"点到了外面"
  // (防止最小化时同时触发 visibilitychange 和 blur 导致记两次)
  if (!document.hidden) {
    recordCheatAction("鼠标离开考试窗口")
  }
}

const initExam = () => {
  startExam(examId).then(res => {
    examInfo.value = res.exam
    recordInfo.value = res.record
    questionList.value = res.questions || []

    // 👇👇👇【新增】同步服务端的作弊次数 👇👇👇
    if (recordInfo.value && recordInfo.value.cheatCount) {
      cheatCount.value = recordInfo.value.cheatCount
    }
    
    // 如果已经交卷，不再初始化答案和倒计时
    if (isFinished.value) {
      loading.value = false
      return
    }

    // 初始化答案对象
    questionList.value.forEach(q => {
      if (q.type === '2') {
        answers.value[q.id] = []
      } else {
        answers.value[q.id] = ''
      }
    })

    // 计算倒计时
    const serverNow = new Date(res.serverTime).getTime()
    const clientNow = Date.now()
    serverTimeDiff.value = clientNow - serverNow
    
    calculateTime()
    startTimer()
    
    loading.value = false
  }).catch(err => {
    loading.value = false
    ElMessageBox.alert('无法加载试卷: ' + err, '错误', {
      confirmButtonText: '返回',
      callback: () => { router.go(-1) }
    })
  })
}

const calculateTime = () => {
  const endTime = new Date(examInfo.value.endTime).getTime()
  let durationEndTime = Infinity
  if (examInfo.value.duration && examInfo.value.duration > 0) {
    const startTime = new Date(recordInfo.value.startTime).getTime()
    durationEndTime = startTime + (examInfo.value.duration * 60 * 1000)
  }
  
  const finalEndTime = Math.min(endTime, durationEndTime)
  const currentServerTime = Date.now() - serverTimeDiff.value
  const diff = Math.floor((finalEndTime - currentServerTime) / 1000)
  remainingSeconds.value = diff > 0 ? diff : 0
}

const startTimer = () => {
  timer = setInterval(() => {
    remainingSeconds.value--
    if (remainingSeconds.value <= 0) {
      clearInterval(timer)
      forceSubmit('考试时间已到，系统自动交卷。')
    }
  }, 1000)
}

const formattedTime = computed(() => {
  const s = remainingSeconds.value
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`
})

const getTypeName = (type) => {
  const map = { '1': '单选', '2': '多选', '3': '判断', '4': '简答' }
  return map[type]
}

const parseOptions = (jsonStr) => {
  try {
    return JSON.parse(jsonStr) || []
  } catch (e) {
    return []
  }
}

const isAnswered = (qid) => {
  const ans = answers.value[qid]
  if (Array.isArray(ans)) return ans.length > 0
  return !!ans
}

const scrollToQuestion = (index) => {
  const el = document.getElementById('q-' + index)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}


const handleBeforeUnload = (e) => {
  if (isFinished.value) return; // 如果已交卷，不拦截离开
  e.preventDefault()
  e.returnValue = '考试正在进行中，离开页面将导致计时继续，确定离开吗？'
}

const handleSubmitCheck = () => {
  const total = questionList.value.length
  let answeredCount = 0
  questionList.value.forEach(q => {
    if (isAnswered(q.id)) answeredCount++
  })

  const text = answeredCount < total 
    ? `还有 ${total - answeredCount} 道题未作答，确定交卷吗？` 
    : '确认提交试卷吗？提交后无法修改。'

  ElMessageBox.confirm(text, '交卷提示', {
    confirmButtonText: '确认交卷',
    cancelButtonText: '继续答题',
    type: 'warning'
  }).then(() => {
    doSubmit(false)
  })
}

const forceSubmit = (reason) => {
  ElMessageBox.alert(reason, '停止答题', {
    confirmButtonText: '确定',
    showClose: false,
    callback: () => {
      doSubmit(true)
    }
  })
}

const doSubmit = (forced) => {
  loading.value = true
  const answerList = []
  for (const qId in answers.value) {
    let val = answers.value[qId]
    if (Array.isArray(val)) {
      val = val.sort().join(',')
    }
    answerList.push({
      questionId: qId,
      studentAnswer: val
    })
  }

  const data = {
    recordId: recordInfo.value.id,
    examId: examInfo.value.id,
    answers: answerList,
    forced: forced
  }

  submitExamPaper(data).then(() => {
    loading.value = false
    ElMessage.success('交卷成功！')
    // 交卷后不跳转，而是重新加载数据，利用 isFinished 属性自动展示成绩页
    initExam() 
  }).catch(() => {
    loading.value = false
    ElMessage.error('交卷失败，请重试或联系老师')
  })
}

const handleExit = () => {
  router.go(-1)
}
</script>

<style scoped>
.exam-taking-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  user-select: none; 
}

/* 顶部栏 */
.exam-header {
  height: 60px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  z-index: 10;
}

.exam-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.countdown-box {
  background: #333;
  color: #fff;
  padding: 8px 20px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: monospace;
  font-size: 18px;
  font-weight: bold;
}

.countdown-box.urgent {
  background: #F56C6C;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.header-right {
  display: flex;
  align-items: center;
}

/* 主体布局 */
.exam-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 20px;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* 结果页布局 */
.result-body {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.score-card {
  background: #fff;
  width: 500px;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 8px solid #409EFF;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  color: #409EFF;
}

.score-num {
  font-size: 48px;
  font-weight: bold;
  line-height: 1;
}

.score-label {
  font-size: 14px;
  margin-top: 5px;
  opacity: 0.8;
}

.score-details {
  width: 100%;
  margin-bottom: 30px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px dashed #eee;
  color: #666;
  font-size: 15px;
}

.detail-item .value {
  font-weight: 500;
  color: #333;
}

/* 左侧题目 */
.question-area {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  overflow-y: auto;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.question-card {
  margin-bottom: 40px;
  border-bottom: 1px dashed #eee;
  padding-bottom: 30px;
}

.q-header {
  margin-bottom: 15px;
  font-size: 16px;
}

.q-index {
  color: #409EFF;
  font-weight: bold;
  font-size: 20px;
  margin-right: 10px;
}

.q-type {
  color: #666;
  margin-right: 5px;
}

.q-score {
  color: #999;
  font-size: 14px;
}

.q-content {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
  color: #333;
}

.option-item {
  display: block;
  margin: 10px 0;
  margin-left: 0 !important;
}

/* 右侧答题卡 */
.answer-sheet {
  width: 280px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}

.sheet-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
  border-left: 4px solid #409EFF;
  padding-left: 10px;
}

.sheet-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  flex: 1;
  align-content: start;
}

.sheet-item {
  width: 36px;
  height: 36px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.sheet-item:hover {
  border-color: #409EFF;
  color: #409EFF;
}

.sheet-item.answered {
  background-color: #409EFF;
  color: #fff;
  border-color: #409EFF;
}

.sheet-legend {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 20px;
  justify-content: center;
  font-size: 12px;
  color: #666;
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
  margin-right: 4px;
}

.dot.answered {
  background-color: #409EFF;
  border-color: #409EFF;
}

.modern-scroll::-webkit-scrollbar {
  width: 6px;
}
.modern-scroll::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}
</style>