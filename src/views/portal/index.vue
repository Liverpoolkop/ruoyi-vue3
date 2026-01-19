<template>
  <div class="portal-container">
    <!-- Navbar -->
    <portal-navbar />

    <!-- Banner -->
    <div class="banner">
      <h1>探索知识的海洋</h1>
      <p>海量优质课程等你来学</p>
      <div class="banner-search">
        <el-input 
          v-model="searchText" 
          placeholder="搜索感兴趣的课程..." 
          class="search-input-lg" 
          prefix-icon="Search" 
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>
    </div>

    <div class="main-content">
      <!-- Editor's Recommendation -->
      <div class="section">
        <div v-if="recommendList.length > 0" class="course-grid">
          <el-card v-for="course in recommendList" :key="course.courseId" class="course-card" :body-style="{ padding: '0px' }" shadow="hover" @click="goDetail(course.courseId)">
            <img :src="course.courseImg || defaultImg" class="image" />
            <div class="card-content">
              <div class="course-title" :title="course.courseName">{{ course.courseName }}</div>
              <div class="school-info">{{ course.teacherNames || '未知教师' }}</div>
              <div class="course-meta">
                <span>{{ course.studentCount || 0 }}人参加</span>
              </div>
              <div class="course-desc" :title="course.courseDesc">{{ course.courseDesc || '暂无描述' }}</div>
            </div>
          </el-card>
        </div>
        <el-empty v-else description="暂无相关课程" />
        
        <!-- Pagination -->
        <div class="pagination-container" v-show="total > 0">
          <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[8, 12, 16, 20]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="getList"
            @current-change="getList"
          />
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>Copyright © 2025 在线课程平台 All Rights Reserved.</p>
    </div>
  </div>


    <el-tooltip content="AI智能教学助手" placement="left" effect="dark">
      <div class="chat-float-btn" @click="toggleChatWindow" v-if="userStore.token">
        <span class="icon-emoji">🤖</span>
        
        </div>
    </el-tooltip>

    <div v-show="isChatOpen" class="chat-window">
      <div class="chat-header">
        <span>智能问答助手</span>
        <i class="el-icon-close close-btn" @click="toggleChatWindow"></i>
      </div>

      <div class="chat-body" ref="chatBodyRef">
        <div v-for="(msg, index) in messageList" :key="index" class="message-row" :class="msg.role === 'user' ? 'row-right' : 'row-left'">
          <div class="avatar" v-if="msg.role === 'ai'">🤖</div>
          
          <div class="bubble" :class="msg.role === 'user' ? 'bubble-user' : 'bubble-ai'">
            <span v-if="msg.role === 'user'">{{ msg.content }}</span>
            
            <div v-else class="md-content" v-html="renderMessage(msg.content)"></div>
          </div>
          
          <div class="avatar" v-if="msg.role === 'user'">🧑</div>
        </div>
        
        <div v-if="loading" class="message-row row-left">
           <div class="avatar">🤖</div>
           <div class="bubble bubble-ai">正在思考中...</div>
        </div>
      </div>

      <div class="chat-footer">
        <el-input 
          v-model="inputMsg" 
          placeholder="请输入您的问题..." 
          @keyup.enter="sendMessage"
          size="small">
        </el-input>
        <el-button type="primary" size="small" @click="sendMessage" :loading="loading">发送</el-button>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, nextTick, computed } from 'vue'
import PortalNavbar from '@/components/PortalNavbar/index.vue'
import { useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import useAppStore from '@/store/modules/app'
import { listPortalCourse, getHotCourses, getNewCourses } from '@/api/portal'
import { ElMessageBox } from 'element-plus'
import axios from 'axios'; // 确保引入了axios
// RuoYi-Vue3 标准请求工具 (自动携带Token，处理baseURL)
import request from '@/utils/request'; 
// 1. 引入 Markdown 解析器
import MarkdownIt from 'markdown-it';
// 1. 【新增】引入 KaTeX 插件
import mk from 'markdown-it-katex';

// 2. 【新增】引入 KaTeX 的 CSS 样式 (这一步非常重要，不引的话公式会乱码！)
import 'katex/dist/katex.min.css';

// 2. 初始化解析器实例
const md = new MarkdownIt();
md.use(mk); // <--- 加上这一行，这就开启了数学公式支持
// 3. 定义一个解析函数，在模板里调用
function renderMessage(content) {
  // 防止 null 或 undefined 报错
  return md.render(content || '');
}

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()
const searchText = ref('')
const recommendList = ref([])
const hotList = ref([])
const newList = ref([])
const defaultImg = 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'

const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 8,
  courseName: undefined
})

function getList() {
  listPortalCourse(queryParams).then(res => {
    recommendList.value = res.rows || []
    total.value = res.total || 0
  })
}

function handleSearch() {
  queryParams.pageNum = 1
  queryParams.courseName = searchText.value || undefined
  getList()
}

function handleLogout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/portal';
    })
  })
}

function goDetail(id) {
  // If we have a public detail page, go there.
  // Currently we reused the admin detail page which might require login?
  // Let's assume we want to show detail. The current detail page implementation might need adjustment to work without login if it calls protected APIs.
  // But for now, let's route to the detail page. 
  // If the detail page API is protected, the user will be intercepted by request interceptor (401) and redirected to login. This is acceptable behavior for now.
  router.push(`/system/course/index/${id}`)
}

onMounted(() => {
  getList()
  getHotCourses().then(res => {
    hotList.value = res.data ? res.data.slice(0, 10) : []
  })
  getNewCourses().then(res => {
    newList.value = res.data ? res.data.slice(0, 10) : []
  })
})


// --- 1. 状态定义 (相当于 data) ---
const isChatOpen = ref(false);
const inputMsg = ref('');
const loading = ref(false);
const chatBodyRef = ref(null); // 对应模板里的 ref="chatBodyRef"
const messageList = ref([
  { role: 'ai', content: '你好！我是您的智能助手，有什么可以帮您？' }
]);

// --- 2. 方法定义 (相当于 methods) ---



// --- [新增] 获取历史记录函数 ---
function getHistory() {
  request({
    url: '/api/ai/history',
    method: 'get'
  }).then(res => {
    // res.data 是后端返回的 List<SysAiHistory>
    const history = res.data || [];
    
    // 重置消息列表，保留第一条欢迎语 (或者你也可以不保留)
    messageList.value = [
       { role: 'ai', content: '你好！我是您的智能助手，有什么可以帮您？' }
    ];
    
    // 把后端的数据转换一下格式推入列表
    history.forEach(item => {
       messageList.value.push({
          role: item.role, // 数据库里存的是 'user' 或 'ai'，正好对应
          content: item.content
       });
    });
    
    scrollToBottom();
  });
}

// 切换窗口显示
function toggleChatWindow() {
  isChatOpen.value = !isChatOpen.value;
  if (isChatOpen.value) {
    // 窗口打开时，去后端拉取历史记录
    getHistory(); 
    scrollToBottom();
  }
}

// 发送消息
function sendMessage() {
  if (!inputMsg.value.trim()) return;

  // A. 推送用户消息
  const userText = inputMsg.value;
  messageList.value.push({ role: 'user', content: userText });
  inputMsg.value = ''; // 清空输入框
  scrollToBottom();
  loading.value = true;

  // B. 调用后端接口
  request({
    url: '/api/ai/chat',
    method: 'post',
    data: { message: userText },
    timeout: 300000 // <--- 关键修改！设置为 300000ms (5分钟)
  }).then(res => {
    // --- 🔍 调试大法：先打印看看结构 ---
    console.log("AI接口返回原始数据:", res);

    // --- 🛠️ 修复点：兼容两种取值方式 ---
    // 若依的标准 AjaxResult 把数据放在 res.data 里
    // 我们做一个兼容：如果 res.data 存在就有 res.data.reply，否则尝试直接取 res.reply
    let aiText = '';
    if (res.data && res.data.reply) {
        aiText = res.data.reply;
    } else if (res.reply) {
        aiText = res.reply;
    } else {
        aiText = "AI 返回的数据格式异常，请查看控制台。";
    }

    messageList.value.push({ role: 'ai', content: aiText });
  }).catch(err => {
    messageList.value.push({ role: 'ai', content: '抱歉，网络开小差了，请稍后再试。' });
    console.error("请求报错:", err);
  }).finally(() => {
    loading.value = false;
    scrollToBottom();
  });
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
    }
  });
}
</script>

<style scoped>
.portal-container {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.banner {
  height: 300px;
  background: linear-gradient(135deg, #409EFF 0%, #36d1dc 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.banner h1 {
  font-size: 48px;
  margin-bottom: 20px;
}

.banner p {
  font-size: 20px;
  opacity: 0.9;
  margin-bottom: 30px;
}

.banner-search {
  width: 100%;
  max-width: 600px;
}

.search-input-lg :deep(.el-input__wrapper) {
  height: 50px;
  font-size: 16px;
  border-radius: 25px 0 0 25px;
  box-shadow: none;
  border: none;
}

.search-input-lg :deep(.el-input-group__append) {
  background-color: #fff;
  border-radius: 0 25px 25px 0;
  border: none;
  box-shadow: none;
}

.search-input-lg :deep(.el-button) {
  height: 50px;
  width: 60px;
  font-size: 20px;
  color: #409EFF;
}

.search-input-lg :deep(.el-input__inner) {
  height: 50px;
}

.main-content {
  width: 1200px;
  margin: 0 auto;
  padding: 40px 0;
}

.section {
  margin-bottom: 50px;
}

.section-title {
  font-size: 24px;
  font-weight: normal;
  color: #333;
  margin-bottom: 20px;
  border-left: 4px solid #409EFF;
  padding-left: 10px;
}

.subtitle {
  font-size: 14px;
  color: #999;
  margin-left: 10px;
  font-style: italic;
  font-weight: normal;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.course-card {
  cursor: pointer;
  transition: all 0.3s;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.course-card .image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.card-content {
  padding: 14px;
}

.course-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.school-info {
  font-size: 12px;
  color: #606266;
  margin-bottom: 8px;
}

.course-meta {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.course-desc {
  font-size: 12px;
  color: #999;
  background: #f4f4f5;
  padding: 5px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ranking-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.ranking-col {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.ranking-list {
  margin-top: 15px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.ranking-item:hover .rank-title {
  color: #409EFF;
}

.rank-num {
  font-size: 18px;
  font-weight: bold;
  color: #999;
  width: 30px;
  font-style: italic;
}

.rank-num.top-three {
  color: #ff6b6b;
}

.rank-content {
  flex: 1;
  overflow: hidden;
}

.rank-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-meta {
  font-size: 12px;
  color: #999;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.footer {
  background: #333;
  color: #fff;
  text-align: center;
  padding: 30px 0;
  margin-top: 50px;
}

/* 悬浮按钮 - 纯图标版 */
.chat-float-btn {
  position: fixed;
  bottom: 40px;        /* 稍微往上提一点，避免贴底 */
  right: 40px;         /* 稍微往左一点 */
  width: 85px;         /* 缩小尺寸 */
  height: 85px;
  background: linear-gradient(135deg, #409EFF, #36d1dc); /* 给个渐变色更高级 */
  border-radius: 50%;
  color: white;
  display: flex;       /* Flex布局让内容居中 */
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.4); /* 漂亮的投影 */
  z-index: 9999;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* 弹性动画 */
  user-select: none;
}

/* 鼠标悬停效果 */
.chat-float-btn:hover {
  transform: scale(1.15) rotate(10deg); /* 悬停时放大并微微旋转 */
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.6);
}

/* 点击时的按压效果 */
.chat-float-btn:active {
  transform: scale(0.95);
}

/* Emoji 图标样式 */
.icon-emoji {
  font-size: 40px; /* Emoji 字体大小 */
  line-height: 1;
  margin-top: 2px; /* 微调垂直居中 */
}

/* 如果你用的是 Element 图标 (i 标签)，用这个样式 */
.chat-float-btn i { 
  font-size: 26px; 
}

/* 聊天窗口主体 */
.chat-window {
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 600px;
  height: 500px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  z-index: 9999;
  overflow: hidden;
  border: 1px solid #ebeef5;
}

/* 头部 */
.chat-header {
  height: 50px;
  background: #409EFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  font-weight: bold;
}
.close-btn { cursor: pointer; }

/* 消息内容区 */
.chat-body {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background: #f5f7fa;
}

/* 每一行消息 */
.message-row {
  display: flex;
  margin-bottom: 15px;
  align-items: flex-start;
}
.row-left { justify-content: flex-start; }
.row-right { justify-content: flex-end; }

/* 头像 */
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin: 0 8px;
}

/* 气泡 */
.bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
}
.bubble-user {
  background: #95ec69; /* 微信绿 */
  color: #000;
  border-top-right-radius: 0;
}
.bubble-ai {
  background: #ffffff;
  color: #333;
  border: 1px solid #e4e7ed;
  border-top-left-radius: 0;
}

/* 底部输入区 */
.chat-footer {
  height: 60px;
  border-top: 1px solid #eee;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
}
/* Markdown 内容专用样式 */
.md-content :deep(p) {
  margin: 5px 0;
  line-height: 1.6;
}

.md-content :deep(ul), .md-content :deep(ol) {
  padding-left: 20px;
  margin: 5px 0;
}

.md-content :deep(li) {
  margin-bottom: 5px;
  list-style-type: disc; /* 强制显示圆点 */
}

/* 代码块样式 */
.md-content :deep(pre) {
  background-color: #f6f8fa;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
  font-family: Consolas, Monaco, 'Andale Mono', monospace;
  font-size: 13px;
  border: 1px solid #eee;
}

.md-content :deep(code) {
  background-color: #f0f2f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  color: #d63384; /* 类似 GitHub 的代码粉色 */
}

.md-content :deep(pre) :deep(code) {
  background-color: transparent; /* 代码块内的 code 不要背景色，避免重叠 */
  padding: 0;
  color: #333;
}

/* 强调字体 */
.md-content :deep(strong) {
  font-weight: bold;
  color: #333;
}

/* KaTeX 公式字体大小调整，防止太大撑破气泡 */
.md-content :deep(.katex) {
  font-size: 1.1em; 
}

/* 块级公式 (就是 $$...$$ 包裹的) 让它居中并带滚动条 */
.md-content :deep(.katex-display) {
  overflow-x: auto;
  overflow-y: hidden;
  margin: 10px 0;
  padding: 5px 0;
}
</style>
