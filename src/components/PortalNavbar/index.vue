<template>
  <div class="navbar">
    <div class="logo" @click="router.push('/portal')">
      <img src="@/assets/logo/logo.png" alt="logo" class="logo-img" />
      <span class="logo-text">在线课程平台</span>
    </div>
    <div class="nav-right">

      <div v-if="!userStore.token" class="auth-btns">
        <a href="#" @click.prevent="appStore.setLoginVisible(true)">登录</a>
      </div>
      <template v-else>
        <!-- 站内信按钮 -->
        <el-popover
          placement="bottom"
          :width="300"
          trigger="click"
          popper-class="message-popover"
          @show="loadMessages"
        >
          <template #reference>
            <div class="right-menu-item hover-effect">
              <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99" class="message-badge">
                <el-icon class="message-icon"><Bell /></el-icon>
              </el-badge>
            </div>
          </template>
          <div class="message-box">
             <div class="message-header">
               <span>未读消息</span>
               <el-button type="primary" link size="small" @click="markAllRead" v-if="unreadCount > 0">全部已读</el-button>
             </div>
             <div class="message-list" v-loading="msgLoading">
               <div v-if="messageList.length === 0" class="empty-msg">暂无未读消息</div>
               <div v-else v-for="msg in messageList" :key="msg.id" class="message-item" :class="{ unread: msg.readStatus === '0' }" @click="handleRead(msg)">
                  <div class="msg-title">{{ msg.title }}</div>
                  <div class="msg-content">{{ msg.content }}</div>
                  <div class="msg-time">{{ msg.createTime }}</div>
               </div>
             </div>
             <div class="message-footer">
               <span class="view-all" @click="router.push('/portal/profile?tab=messages')">查看全部</span>
             </div>
          </div>
        </el-popover>

        <div class="user-info">
          <el-dropdown>
            <span class="el-dropdown-link">
              <img :src="userAvatar" class="user-avatar" />
              <span class="username">{{ userStore.name }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/portal/profile')">个人信息</el-dropdown-item>
                <el-dropdown-item v-if="isAdmin" @click="router.push('/index')">进入后台</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
    </div>

    <!-- Message Detail Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentMessage.title"
      width="500px"
      append-to-body
    >
      <div class="msg-detail">
        <div class="detail-time">{{ currentMessage.createTime }}</div>
        <div class="detail-content">{{ currentMessage.content }}</div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import useUserStore from '@/store/modules/user'
import useAppStore from '@/store/modules/app'
import { ElMessageBox } from 'element-plus'
import { ArrowDown, Bell } from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'
import { getUnreadCount, listMessage, readMessage } from '@/api/edu/message'

import defAva from '@/assets/images/profile.jpg'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

// Message Logic
const unreadCount = ref(0)
const messageList = ref([])
const msgLoading = ref(false)
const dialogVisible = ref(false)
const currentMessage = ref({})
let timer = null

function loadUnread() {
    if (userStore.token) {
        getUnreadCount().then(res => {
            unreadCount.value = res.data
        })
    }
}

function loadMessages() {
    msgLoading.value = true
    // Only load unread messages
    listMessage({ pageNum: 1, pageSize: 5, readStatus: '0' }).then(res => {
        messageList.value = res.rows
        msgLoading.value = false
    })
}

function handleRead(msg) {
    currentMessage.value = msg
    dialogVisible.value = true
    if (msg.readStatus === '0') {
        readMessage(msg.id).then(() => {
            msg.readStatus = '1'
            if (unreadCount.value > 0) unreadCount.value--
        })
    }
}

function markAllRead() {
    messageList.value.forEach(msg => {
        if (msg.readStatus === '0') handleRead(msg)
    })
}

onMounted(() => {
    loadUnread()
    timer = setInterval(loadUnread, 60000)
})

onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
})

const userAvatar = computed(() => {
  console.log(userStore)
  if (userStore.avatar) {
    return userStore.avatar
  }
  return defAva
})

const isAdmin = computed(() => {
  return userStore.roles && userStore.roles.includes('admin')
})

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
</script>

<style scoped>
.navbar {
  background: #fff;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 50px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo-img {
  width: 40px;
  height: 40px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}

.username {
  vertical-align: middle;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.menu-items {
  margin-right: 20px;
}

.menu-link {
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  transition: color 0.3s;
  
  &:hover {
    color: #409EFF;
  }
}

.auth-btns {
  font-size: 14px;
  color: #606266;
}

.auth-btns a {
  color: #606266;
  text-decoration: none;
  margin: 0 5px;
}

.auth-btns a:hover {
  color: #409EFF;
}

.right-menu-item {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
  cursor: pointer;
  transition: background .3s;
  
  &:hover {
    background: rgba(0,0,0,.025);
  }
}

.message-icon {
  font-size: 20px;
  color: #5a5e66;
}

.message-badge {
  display: flex;
  align-items: center;
  
  :deep(.el-badge__content) {
    top: 0;
    right: 0;
  }
}

.message-box {
    .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
        font-weight: bold;
    }
    .message-list {
        max-height: 300px;
        overflow-y: auto;
        .empty-msg {
            padding: 20px;
            text-align: center;
            color: #999;
        }
        .message-item {
            padding: 10px;
            border-bottom: 1px solid #f5f5f5;
            cursor: pointer;
            &:hover { background: #f9f9f9; }
            &.unread { background: #e6f7ff; }
            .msg-title { font-weight: bold; font-size: 14px; margin-bottom: 4px; }
            .msg-content { color: #666; font-size: 12px; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .msg-time { color: #999; font-size: 12px; }
        }
    }
    .message-footer {
        padding-top: 10px;
        text-align: center;
        border-top: 1px solid #eee;
        .view-all { font-size: 12px; color: #409EFF; cursor: pointer; }
    }
}

.msg-detail {
  padding: 10px 0;
  .detail-time {
    color: #999;
    font-size: 12px;
    margin-bottom: 15px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }
  .detail-content {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    white-space: pre-wrap;
  }
}
</style>
