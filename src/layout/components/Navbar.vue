<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!settingsStore.topNav" />
    <top-nav id="topmenu-container" class="topmenu-container" v-if="settingsStore.topNav" />

    <div class="right-menu">
      <template v-if="appStore.device !== 'mobile'">
        <screenfull id="screenfull" class="right-menu-item hover-effect" />
        <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>
      </template>
      
      <!-- Message Bell -->
      <el-popover
        placement="bottom"
        :width="300"
        trigger="click"
        popper-class="message-popover"
        @show="loadMessages"
      >
        <template #reference>
          <div class="right-menu-item hover-effect">
            <el-button type="primary" size="small" plain>
              站内信 {{ unreadCount > 0 ? '(' + unreadCount + ')' : '' }}
            </el-button>
          </div>
        </template>
        <div class="message-box">
           <div class="message-header">
             <span>站内信</span>
             <el-button type="primary" link size="small" @click="markAllRead" v-if="unreadCount > 0">全部已读</el-button>
           </div>
           <div class="message-list" v-loading="msgLoading">
             <div v-if="messageList.length === 0" class="empty-msg">暂无新消息</div>
             <div v-else v-for="msg in messageList" :key="msg.id" class="message-item" :class="{ unread: msg.readStatus === '0' }" @click="handleRead(msg)">
                <div class="msg-title">{{ msg.title }}</div>
                <div class="msg-content">{{ msg.content }}</div>
                <div class="msg-time">{{ msg.createTime }}</div>
             </div>
           </div>
           <div class="message-footer">
             <router-link to="/user/profile" class="view-all">查看全部</router-link>
           </div>
        </div>
      </el-popover>

      <el-button class="right-menu-item" type="primary" text @click="openInvite" v-if="userStore.roles.includes('student')">邀请码加入</el-button>
      <div class="avatar-container">
        <el-dropdown @command="handleCommand" class="right-menu-item hover-effect" trigger="click">
          <div class="avatar-wrapper">
            <img :src="userStore.avatar" class="user-avatar" />
            <el-icon><caret-bottom /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <router-link to="/portal">
                <el-dropdown-item>返回前台</el-dropdown-item>
              </router-link>
              <router-link to="/portal/profile">
                <el-dropdown-item>个人中心</el-dropdown-item>
              </router-link>
              <el-dropdown-item command="setLayout" v-if="settingsStore.showSettings">
                <span>布局设置</span>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
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
import { getToken } from '@/utils/auth'
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Bell, CaretBottom } from '@element-plus/icons-vue'
import { joinByInvite } from '@/api/edu/invite'
import { getUnreadCount, listMessage, readMessage } from '@/api/edu/message'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
 
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'

const appStore = useAppStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()

// Message Logic
const unreadCount = ref(0)
const messageList = ref([])
const msgLoading = ref(false)
const dialogVisible = ref(false)
const currentMessage = ref({})

function loadUnread() {
    if (getToken()) {
        getUnreadCount().then(res => {
            unreadCount.value = res.data
        })
    }
}

function loadMessages() {
    msgLoading.value = true
    listMessage({ pageNum: 1, pageSize: 5 }).then(res => {
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
    // Ideally backend should have markAllRead API
    messageList.value.forEach(msg => {
        if (msg.readStatus === '0') handleRead(msg)
    })
}

// Poll for messages every 60s
setInterval(loadUnread, 60000)
loadUnread()

function toggleSideBar() {
  appStore.toggleSideBar()
}

function handleCommand(command) {
  switch (command) {
    case "setLayout":
      setLayout();
      break;
    case "logout":
      logout();
      break;
    default:
      break;
  }
}

function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/portal';
    })
  }).catch(() => { });
}

function openInvite(){
  ElMessageBox.prompt('请输入邀请码', '加入', { confirmButtonText: '加入', cancelButtonText: '取消' })
    .then(({ value }) => joinByInvite(value))
    .then(() => ElMessage.success('加入成功'))
}

const emits = defineEmits(['setLayout'])
function setLayout() {
  emits('setLayout');
}
</script>

<style lang='scss' scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 40px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}

.message-badge {
    line-height: 1.5;
    margin-top: -5px;
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
        .view-all { font-size: 12px; color: #409EFF; }
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
