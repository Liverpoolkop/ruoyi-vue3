<template>
  <router-view />
  <login-dialog />
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings'
import { handleThemeStyle } from '@/utils/theme'
import LoginDialog from '@/components/LoginDialog'

onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme)
    // 移除 loading 动画
    const loader = document.getElementById('loader-wrapper');
    if (loader) {
        loader.style.display = 'none';
    }
  })
})
</script>
