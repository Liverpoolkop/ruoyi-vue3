<template>
  <el-dialog 
    v-model="visible" 
    :title="showRegister ? '欢迎注册' : '欢迎登录'" 
    width="400px" 
    center
    append-to-body
    align-center
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form v-if="!showRegister" ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          type="text"
          size="large"
          auto-complete="off"
          placeholder="账号"
        >
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          v-model="loginForm.code"
          size="large"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleLogin"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img"/>
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          style="width:100%;"
          @click.prevent="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
        <div style="float: right;">
          <a href="#" @click.prevent="showRegister = true" class="link-type">立即注册</a>
        </div>
      </el-form-item>
    </el-form>

    <!-- 注册表单 -->
    <el-form v-else ref="registerRef" :model="registerForm" :rules="registerRules" class="login-form">
      <el-form-item prop="username">
        <el-input 
          v-model="registerForm.username" 
          type="text" 
          size="large" 
          auto-complete="off" 
          placeholder="邮箱"
        >
          <template #prefix><svg-icon icon-class="email" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code">
        <div style="display: flex; width: 100%; align-items: center;">
          <el-input
            size="large" 
            v-model="registerForm.code"
            auto-complete="off"
            placeholder="验证码"
            style="width: 200px; margin-right: 10px;"
          >
            <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
          </el-input>
          <div class="register-code" style="flex: 1;">
            <el-button size="large" type="primary" :disabled="isSending" @click="handleSendCode" style="width: 100%">
              {{ isSending ? `${count}s后重新获取` : '获取验证码' }}
            </el-button>
          </div>
        </div>
      </el-form-item>
       <el-form-item prop="nickName">
        <el-input 
          v-model="registerForm.nickName" 
          type="text" 
          size="large" 
          auto-complete="off" 
          placeholder="用户名字"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          size="large" 
          auto-complete="off"
          placeholder="密码"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          size="large" 
          auto-complete="off"
          placeholder="确认密码"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
     
      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="large" 
          type="primary"
          style="width:100%;"
          @click.prevent="handleRegister"
        >
          <span v-if="!loading">注 册</span>
          <span v-else>注 册 中...</span>
        </el-button>
        <div style="float: right;">
          <a href="#" @click.prevent="showRegister = false" class="link-type">使用已有账户登录</a>
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, getCurrentInstance } from 'vue'
import { getCodeImg, register, sendEmailCode } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt } from "@/utils/jsencrypt";
import useUserStore from '@/store/modules/user'
import useAppStore from '@/store/modules/app'
import { ElMessage, ElMessageBox } from 'element-plus'

const userStore = useUserStore()
const appStore = useAppStore()
const { proxy } = getCurrentInstance();

const visible = computed({
  get: () => appStore.loginVisible,
  set: (val) => appStore.setLoginVisible(val)
})

const showRegister = computed({
  get: () => appStore.showRegister,
  set: (val) => appStore.setShowRegister(val)
})

const loginForm = ref({
  username: "",
  password: "",
  rememberMe: false,
  code: "",
  uuid: ""
});

const registerForm = ref({
  username: "",
  password: "",
  confirmPassword: "",
  code: "",
  nickName: "",
  uuid: ""
});

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
};

const equalToPassword = (rule, value, callback) => {
  if (registerForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const registerRules = {
  username: [
    { required: true, trigger: "blur", message: "请输入您的邮箱" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }
  ],
  password: [
    { required: true, trigger: "blur", message: "请输入您的密码" },
    { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "请再次输入您的密码" },
    { required: true, validator: equalToPassword, trigger: "blur" }
  ],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }],
  nickName: [{ required: true, trigger: "blur", message: "请输入用户名称" }]
};

const codeUrl = ref("");
const loading = ref(false);
const captchaEnabled = ref(true);
const isSending = ref(false);
const count = ref(60);
let timer = null;

watch(visible, (val) => {
  if (val) {
    getCode();
    getCookie();
  }
})

watch(showRegister, (val) => {
  if (!val) {
    getCode();
  }
})

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img;
      loginForm.value.uuid = res.uuid;
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  };
}

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true;
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      userStore.login(loginForm.value).then(() => {
        loading.value = false;
        visible.value = false; // Close dialog
        ElMessage.success('登录成功');
        // Reload current page to refresh state? Or let the component handle it.
        // It's better to reload via router or let components watch user state.
        // window.location.reload(); 
      }).catch(() => {
        loading.value = false;
        if (captchaEnabled.value) {
          getCode();
        }
      });
    }
  });
}

function handleSendCode() {
  if (!registerForm.value.username) {
    ElMessage.error("请先输入邮箱");
    return;
  }
  // 简单校验邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(registerForm.value.username)) {
    ElMessage.error("请输入正确的邮箱地址");
    return;
  }

  isSending.value = true;
  sendEmailCode(registerForm.value.username).then(res => {
    ElMessage.success("验证码已发送，请注意查收");
    startCountDown();
  }).catch(() => {
    isSending.value = false;
  });
}

function startCountDown() {
  count.value = 60;
  timer = setInterval(() => {
    if (count.value > 0) {
      count.value--;
    } else {
      clearInterval(timer);
      isSending.value = false;
    }
  }, 1000);
}

function handleRegister() {
  proxy.$refs.registerRef.validate(valid => {
    if (valid) {
      loading.value = true;
      register(registerForm.value).then(res => {
        const username = registerForm.value.username;
        ElMessageBox.alert("<font color='red'>恭喜你，您的账号 " + username + " 注册成功！</font>", "系统提示", {
          dangerouslyUseHTMLString: true,
          type: "success",
        }).then(() => {
          showRegister.value = false;
          loading.value = false;
        }).catch(() => {
          loading.value = false;
        });
      }).catch(() => {
        loading.value = false;
      });
    }
  });
}

function handleClosed() {
  // Reset form or state if needed
}
</script>

<style scoped lang="scss">
.login-form {
  padding: 0 20px;
  .el-input {
    height: 40px;
    input { height: 40px; }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0;
  }
}
.login-code {
  width: 33%;
  height: 40px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
    width: 100%;
    height: 100%;
  }
}
</style>
