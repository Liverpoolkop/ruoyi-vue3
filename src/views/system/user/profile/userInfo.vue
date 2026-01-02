<template>
   <el-form ref="userRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="用户昵称" prop="nickName">
         <el-input v-model="form.nickName" maxlength="30" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
         <el-input v-model="form.phonenumber" maxlength="11" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
         <el-input v-model="form.email" maxlength="50" />
      </el-form-item>
      <el-form-item label="性别">
         <el-radio-group v-model="form.sex">
            <el-radio label="0">男</el-radio>
            <el-radio label="1">女</el-radio>
         </el-radio-group>
      </el-form-item>
      <el-form-item>
      <el-button type="primary" @click="submit">保存</el-button>
      <el-button type="danger" @click="close">关闭</el-button>
      </el-form-item>
   </el-form>

   <!-- 密码验证弹窗 -->
   <el-dialog title="安全验证" v-model="pwdVisible" width="400px" append-to-body>
     <el-form :model="pwdForm" :rules="pwdRules" ref="pwdRef" label-width="80px">
       <el-form-item label="登录密码" prop="password">
         <el-input v-model="pwdForm.password" type="password" placeholder="请输入当前登录密码" show-password />
       </el-form-item>
     </el-form>
     <template #footer>
       <span class="dialog-footer">
         <el-button @click="pwdVisible = false">取 消</el-button>
         <el-button type="primary" @click="confirmPwd">确 定</el-button>
       </span>
     </template>
   </el-dialog>
</template>

<script setup>
import { updateUserProfile } from "@/api/system/user";

const props = defineProps({
  user: {
    type: Object
  }
});

const { proxy } = getCurrentInstance();

const form = ref({});
const pwdVisible = ref(false);
const pwdForm = ref({ password: '' });
const pwdRef = ref(null);

const rules = ref({
  nickName: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
  email: [{ required: true, message: "邮箱地址不能为空", trigger: "blur" }, { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
  phonenumber: [{ required: true, message: "手机号码不能为空", trigger: "blur" }, { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }]
});

const pwdRules = ref({
  password: [{ required: true, message: "请输入登录密码", trigger: "blur" }]
});

/** 提交按钮 */
function submit() {
  proxy.$refs.userRef.validate(valid => {
    if (valid) {
      pwdForm.value.password = '';
      pwdVisible.value = true;
    }
  });
};

/** 确认密码并提交 */
function confirmPwd() {
  proxy.$refs.pwdRef.validate(valid => {
    if (valid) {
      const data = { ...form.value, password: pwdForm.value.password };
      updateUserProfile(data).then(response => {
        proxy.$modal.msgSuccess("修改成功");
        props.user.phonenumber = form.value.phonenumber;
        props.user.email = form.value.email;
        pwdVisible.value = false;
      });
    }
  });
}

/** 关闭按钮 */
function close() {
  proxy.$tab.closePage();
};

// 回显当前登录用户信息
watch(() => props.user, user => {
  if (user) {
    form.value = { nickName: user.nickName, phonenumber: user.phonenumber, email: user.email, sex: user.sex };
  }
},{ immediate: true });
</script>
