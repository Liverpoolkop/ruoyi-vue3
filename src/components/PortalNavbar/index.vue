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
      <div v-else class="user-info">
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
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import useUserStore from '@/store/modules/user'
import useAppStore from '@/store/modules/app'
import { ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

import defAva from '@/assets/images/profile.jpg'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

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
</style>
