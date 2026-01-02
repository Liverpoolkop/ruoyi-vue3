<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :sm="24" :lg="24">
        <h2>2025专业实践——课程智慧教学平台（0912版）</h2>
        <p>
          面向管理员、教师、学生的教学管理系统，包含用户管理、课程管理、班级管理、作业管理（含AI助教）、题型与题库、考试管理等必做功能；选做方向支持课程知识图谱或实验在线评测。
        </p>
        <el-divider />
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :sm="24" :lg="12" style="padding-left: 20px">
        <h2>平台简介</h2>
        <p>
          提供教师/学生登录与注册、个人信息与密码管理；支持课程创建编辑、班级创建与学生批量导入；作业创建与批改、题型与题库管理、考试创建与成绩分析等教学全流程能力。
        </p>
        <p>
          <b>当前版本:</b> <span>v{{ version }}</span>
        </p>
        
      </el-col>
    </el-row>
    <el-divider />
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>模块概览</span>
            </div>
          </template>
          <div class="body">
            <ul>
              <li>用户管理：登录注册、个人信息、密码管理、学生批量导入</li>
              <li>课程管理：列表/详情、创建编辑、课程介绍富文本</li>
              <li>班级管理：列表分组、详情（学生与课程）、创建</li>
              <li>作业管理：创建、提交与批改，AI助教解析</li>
              <li>题库管理：题型、题目添加编辑、批量操作</li>
              <li>考试管理：创建、详情与结果分析</li>
              <li>选做：课程知识图谱 或 实验在线评测</li>
            </ul>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
const version = ref('3.8.7')

function goTarget(url) {
  window.open(url, '__blank')
}
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>
