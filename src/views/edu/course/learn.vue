<template>
  <div class="learn-container">
    <!-- Top Header -->
    <div class="learn-header">
      <div class="header-left">
        <div class="logo-area" @click="router.push('/portal')">
          <img src="@/assets/logo/logo.png" alt="logo" class="logo" />
          <span class="platform-name">在线课程平台</span>
        </div>
        <div class="divider"></div>
        <div class="course-info">
          <img :src="course.courseImg || defaultImg" class="course-thumb" />
          <span class="course-name">{{ course.courseName }}</span>
          <span class="teacher-name">{{ course.teacherNames }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button v-if="isTeacher" type="primary" plain round size="small" icon="Share" @click="handleInvite" style="margin-right: 15px;">邀请加入</el-button>
        <div class="user-profile">
          <img :src="userStore.avatar || defaultAvatar" class="user-avatar" />
          <span class="user-name">{{ userStore.name }}</span>
        </div>
      </div>
    </div>

    <div class="learn-body">
      <!-- Sidebar -->
      <div class="sidebar">
        <div class="sidebar-wrapper">
          <div 
            v-for="item in menuItems" 
            :key="item.key"
            :class="['menu-item', { active: activeMenu === item.key }]"
            @click="activeMenu = item.key"
          >
            <el-icon class="menu-icon"><component :is="item.icon" /></el-icon>
            <span class="menu-label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Courseware -->
        <div v-if="activeMenu === 'courseware'" class="content-wrapper">
          <div class="content-header">
            <h2>课件</h2>
            <el-button v-if="isTeacher" type="primary" size="small" icon="Setting" @click="openChapterManage">管理目录</el-button>
          </div>
          
          <div class="chapter-list-container">
            <div v-if="chapters.length > 0">
              <div v-for="chapter in chapters" :key="chapter.chapterId" class="chapter-block">
                <div class="chapter-title">
                  <span class="chapter-idx">{{ chapter.sort }}</span>
                  {{ chapter.chapterName }}
                </div>
                <div class="section-list">
                  <!-- 1. Chapter Videos -->
                  <div v-if="chapter.videos && chapter.videos.length > 0">
                    <div v-for="video in chapter.videos" :key="video.videoId" class="section-item">
                      <div class="section-icon">
                        <el-tag size="small" effect="plain">视频</el-tag>
                      </div>
                      <div class="section-info">
                        <div class="section-title">{{ video.videoName }}</div>
                      </div>
                      <div class="section-action">
                        <el-icon><VideoPlay /></el-icon>
                      </div>
                    </div>
                  </div>

                  <!-- 2. Sub-Chapters and their Videos -->
                  <div v-if="chapter.children && chapter.children.length > 0">
                    <div v-for="subChapter in chapter.children" :key="subChapter.chapterId" class="sub-chapter-block">
                      <div class="sub-chapter-header">{{ subChapter.chapterName }}</div>
                      <div v-if="subChapter.videos && subChapter.videos.length > 0">
                        <div v-for="video in subChapter.videos" :key="video.videoId" class="section-item">
                          <div class="section-icon">
                            <el-tag size="small" effect="plain">视频</el-tag>
                          </div>
                          <div class="section-info">
                            <div class="section-title">{{ video.videoName }}</div>
                          </div>
                          <div class="section-action">
                            <el-icon><VideoPlay /></el-icon>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="(!chapter.videos || chapter.videos.length === 0) && (!chapter.children || chapter.children.length === 0)" class="empty-section">本章暂无内容</div>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无课程内容" />
          </div>
        </div>

        <!-- Announcements -->
        <div v-else-if="activeMenu === 'announcement'" class="content-wrapper">
          <div class="content-header">
            <h2>公告</h2>
            <el-button v-if="isTeacher" type="primary" size="small" icon="Plus" @click="openNoticeDialog">发布公告</el-button>
          </div>
          <div v-if="notices && notices.length > 0" class="notice-list">
             <div v-for="notice in notices" :key="notice.noticeId" class="notice-item">
                <div class="notice-main">
                   <div class="notice-title">{{ notice.noticeTitle }}</div>
                   <div class="notice-content">{{ notice.noticeContent }}</div>
                   <div class="notice-time">{{ notice.createTime }}</div>
                </div>
                <div v-if="isTeacher" class="notice-action">
                   <el-button type="danger" link icon="Delete" @click="handleDelNotice(notice)">删除</el-button>
                </div>
             </div>
          </div>
          <el-empty v-else description="暂无公告" />
        </div>

        <!-- Grading -->
        <div v-else-if="activeMenu === 'grading'" class="content-wrapper">
          <div class="content-header">
            <h2>评分标准</h2>
          </div>
          <div class="rich-text-content">
             <p>本课程主要包含视频学习、作业、考试三个部分。</p>
             <p>1. 视频学习（40%）：完成所有视频观看。</p>
             <p>2. 作业（30%）：完成所有章节作业。</p>
             <p>3. 考试（30%）：期末考试。</p>
          </div>
        </div>
        
<!-- Homework -->
<div v-else-if="activeMenu === 'homework'" class="content-wrapper">
  <div class="content-header">
    <h2>测验与作业</h2>
    <el-button
      v-if="isTeacher"
      type="primary"
      size="small"
      icon="Plus"
      @click="openHomeworkDialog"
    >
      创建作业
    </el-button>
    
  </div>

  <!--  ：筛选栏 -->
  <div class="homework-filter">
<el-input v-model="homeworkQuery.title" placeholder="按作业名筛选" clearable style="width:260px" />

<el-select v-model="homeworkQuery.status" placeholder="按状态筛选" clearable style="width:160px">
  <el-option label="草稿" value="0" />
  <el-option label="已发布" value="1" />
</el-select>

<el-button @click="() => { homeworkQuery.title=''; homeworkQuery.status=''; applyHomeworkFilter() }">重置</el-button>

  </div>
  <!-- 有作业 -->
  <div v-if="homeworkList.length">
      <el-table :data="filteredHomeworkList" style="width: 100%" @row-click="handleHomeworkRowClick">
      <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
      <el-table-column prop="content" label="内容" min-width="260" show-overflow-tooltip />
      <el-table-column prop="deadline" label="截止时间" width="180" align="center" />
      
      <!-- 增加批改按钮 -->
  <el-table-column label="批改" width="120" align="center">
  <template #default="{ row }">
    <el-button
      v-if="isTeacher"
      type="primary"
      size="small"
      @click.stop="openSubmitsDialog(row)"
    >
      批改
    </el-button>
  </template>
</el-table-column>

      <!-- 增加提交情况列 -->
  <el-table-column label="提交" width="120" align="center">
    <template #default="{ row }">
      <el-tag :type="mySubmitMap[row.homeworkId] ? 'success' : 'info'">
        {{ mySubmitMap[row.homeworkId] ? '已提交' : '未提交' }}
      </el-tag>
    </template>
  </el-table-column>
      <el-table-column label="状态" width="100" align="center">

        <template #default="{ row }">
          <el-tag :type="row.status === '1' ? 'success' : 'info'">
            {{ row.status === '1' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createBy" label="创建人" width="140" align="center" />
      <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
      </el-table>


  </div>

  <!-- 无作业 -->
  <el-empty v-else description="暂无作业" />


  <el-dialog v-model="homeworkOpen" title="创建作业" width="520px">
    <el-form :model="homeworkForm" label-width="80px">
      <el-form-item label="标题">
        <el-input v-model="homeworkForm.title" placeholder="请输入作业标题" />
      </el-form-item>

      <el-form-item label="要求">
        <el-input
          v-model="homeworkForm.content"
          type="textarea"
          :rows="4"
          placeholder="请输入作业要求"
        />
      </el-form-item>

      <el-form-item label="截止时间">
        <el-date-picker
          v-model="homeworkForm.deadline"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="选择截止时间"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="状态">
        <el-radio-group v-model="homeworkForm.status">
          <el-radio label="0">草稿</el-radio>
          <el-radio label="1">发布</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="homeworkOpen = false">取消</el-button>
      <el-button type="primary" :loading="homeworkSaving" @click="submitCreateHomework">
        提交
      </el-button>
    </template>
  </el-dialog>
<!-- 评分与评语弹窗 -->
  <el-dialog v-model="gradeOpen" title="评分与评语" width="700px">
    <div v-if="gradingRow" style="margin-bottom: 10px;">
      <div><b>学生：</b>{{ gradingRow.studentName }}</div>
      <div><b>提交时间：</b>{{ gradingRow.submitTime }}</div>
    </div>

    <el-form label-width="80px">
      <el-form-item label="作业内容">
        <el-input :model-value="gradingRow?.submitContent" type="textarea" :rows="8" disabled />
      </el-form-item>

      <el-form-item label="分数">
        <el-input-number v-model="gradeForm.score" :min="0" :max="100" />
      </el-form-item>

      <el-form-item label="评语">
        <el-input v-model="gradeForm.teacherComment" type="textarea" :rows="4" placeholder="请输入评语" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="gradeOpen=false">取消</el-button>
      <el-button type="primary" :loading="gradeLoading" @click="doGrade">保存</el-button>
    </template>
  </el-dialog>
  <!-- 教师：查看提交列表 -->
<el-dialog v-model="teacherSubmitsOpen" title="学生提交列表" width="900px">
  <div v-if="currentHomework" style="margin-bottom: 10px;">
    <b>作业：</b>{{ currentHomework.title }}
  </div>

  <el-table :data="teacherSubmits" style="width:100%">
    <el-table-column prop="studentName" label="学生" width="140" />
    <el-table-column prop="submitTime" label="提交时间" width="180" />
    <el-table-column prop="submitStatus" label="状态" width="100">
      <template #default="{ row }">
        <el-tag :type="row.submitStatus === '2' ? 'success' : 'info'">
          {{ row.submitStatus === '2' ? '已评分' : '已提交' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="score" label="分数" width="100" />
    <el-table-column prop="gradeTime" label="评分时间" width="180" />
    <el-table-column label="操作" width="140" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" link @click="openGradeDialog(row)">
          {{ row.submitStatus === '2' ? '查看/改分' : '评分' }}
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <template #footer>
    <el-button @click="teacherSubmitsOpen=false">关闭</el-button>
  </template>
</el-dialog>



  <!--  学生提交作业弹窗 -->
<el-dialog v-model="homeworkSubmitOpen" title="提交作业" width="600px">
  <div v-if="currentHomework" style="margin-bottom: 10px;">
    <div><b>标题：</b>{{ currentHomework.title }}</div>
    <div><b>要求：</b>{{ currentHomework.content }}</div>
    <div><b>截止：</b>{{ currentHomework.deadline }}</div>
  </div>

  <el-form label-width="80px">
    <el-form-item label="作业内容">
      <el-input
        v-model="submitForm.submitContent"
        type="textarea"
        :rows="8"
        placeholder="请输入你的作业内容"
      />
    </el-form-item>
  </el-form>

  <template #footer>
    <el-button @click="homeworkSubmitOpen = false">取消</el-button>
    <el-button type="primary" :loading="submitLoading" @click="doSubmitHomework">
      提交
    </el-button>
  </template>
</el-dialog>

</div>


      </div>
    </div>
    
    <!-- Chapter Management Dialog -->
    <el-dialog v-model="chapterManageOpen" title="课程目录管理" width="600px">
      <div class="chapter-manage-toolbar">
        <el-button type="primary" icon="FolderAdd" @click="handleAddChapter()">添加章</el-button>
        <el-button type="default" icon="Refresh" @click="getChapterList">刷新</el-button>
      </div>
      
      <el-tree
        :data="chapters"
        node-key="chapterId"
        default-expand-all
        :expand-on-click-node="false"
        :props="{ label: 'chapterName', children: 'children' }"
        class="chapter-tree"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <span class="node-label">
              <span class="node-sort">[{{ data.sort }}]</span>
              {{ node.label }}
            </span>
            <span class="node-actions">
              <el-button
                type="primary"
                link
                size="small"
                icon="EditPen"
                @click.stop="handleEditChapter(data)"
              >
                编辑
              </el-button>
              <el-button
                v-if="data.parentId === 0"
                type="success"
                link
                size="small"
                icon="DocumentAdd"
                @click.stop="handleAddChapter(data)"
              >
                添加节
              </el-button>
              <el-button
                type="danger"
                link
                size="small"
                icon="DeleteFilled"
                @click.stop="handleDeleteChapter(data)"
              >
                删除
              </el-button>
            </span>
          </div>
        </template>
      </el-tree>
    </el-dialog>

    <!-- Chapter Edit Dialog -->
    <el-dialog v-model="chapterEditOpen" :title="chapterForm.chapterId ? '编辑章节' : '添加章节'" width="400px">
      <el-form :model="chapterForm" ref="chapterRef" label-width="80px" :rules="chapterRules">
        <el-form-item label="上级章节" prop="parentId" v-if="chapterForm.parentId !== 0">
           <el-input :model-value="parentChapterName" disabled />
        </el-form-item>
        <el-form-item label="章节名称" prop="chapterName">
          <el-input v-model="chapterForm.chapterName" placeholder="请输入章节名称" />
        </el-form-item>
        <el-form-item label="显示排序" prop="sort">
          <el-input-number v-model="chapterForm.sort" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="chapterEditOpen = false">取消</el-button>
        <el-button type="primary" @click="submitChapter">保存</el-button>
      </template>
    </el-dialog>

    <!-- Student Add Dialog -->
    <el-dialog v-model="studentAddOpen" title="添加课程成员" width="650px" custom-class="student-add-dialog">
      <el-tabs v-model="studentAddActiveTab" type="card">
        <!-- Tab 1: Search -->
        <el-tab-pane label="搜索添加" name="search">
          <div class="search-panel">
            <div class="search-bar">
              <el-input v-model="studentSearchQuery" placeholder="输入ID或用户名搜索" @keyup.enter="searchStudent" clearable>
                <template #append>
                  <el-button @click="searchStudent" icon="Search" />
                </template>
              </el-input>
            </div>
            
            <div class="search-results">
              <el-empty v-if="studentSearchResults.length === 0" description="请输入关键词搜索" :image-size="60" />
              <div v-else class="result-list">
                <div v-for="user in studentSearchResults" :key="user.userId" class="user-item">
                  <div class="user-info">
                    <el-avatar :size="36" :src="user.avatar">{{ user.nickName ? user.nickName.charAt(0) : 'U' }}</el-avatar>
                    <div class="info-text">
                      <div class="name">{{ user.nickName }} <span class="sub">({{ user.userName }})</span></div>
                      <div class="id">ID: {{ user.userId }}</div>
                    </div>
                  </div>
                  <el-button 
                    size="small" 
                    :type="isStudentSelected(user.userId) ? 'success' : 'primary'" 
                    :plain="!isStudentSelected(user.userId)"
                    :disabled="isAlreadyMember(user.userId)"
                    @click="toggleStudentSelection(user)"
                  >
                    {{ isAlreadyMember(user.userId) ? '已加入' : (isStudentSelected(user.userId) ? '已选' : '选择') }}
                  </el-button>
                </div>
              </div>
            </div>
            
            <div class="selected-panel" v-if="studentSelected.length > 0">
              <div class="panel-title">已选人员 ({{ studentSelected.length }})</div>
              <div class="selected-tags">
                <el-tag 
                  v-for="user in studentSelected" 
                  :key="user.userId" 
                  closable 
                  @close="removeSelectedStudent(user.userId)"
                  class="user-tag"
                >
                  {{ user.nickName || user.userName }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- Tab 3: Class Add -->
        <el-tab-pane label="按班级添加" name="class">
          <div class="class-panel">
            <el-form label-width="80px">
              <el-form-item label="选择班级">
                <el-select v-model="selectedClassId" placeholder="请选择班级" style="width: 100%" filterable>
                  <el-option 
                    v-for="cls in classList" 
                    :key="cls.classId" 
                    :label="cls.className" 
                    :value="cls.classId" 
                  />
                </el-select>
              </el-form-item>
              <div class="class-tip">
                <el-icon><InfoFilled /></el-icon>
                <span>选择班级后，将自动把该班级下的所有学生添加到本课程中（自动跳过已存在的学生）。</span>
              </div>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <el-button @click="studentAddOpen = false">取消</el-button>
        <el-button type="primary" @click="submitAddStudents()">确认添加</el-button>
      </template>
    </el-dialog>

    <!-- Edit Course Dialog -->
    <el-dialog v-model="editCourseOpen" title="编辑课程信息" width="500px">
      <el-form :model="editCourseForm" ref="editCourseRef" label-width="80px" :rules="editCourseRules">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="editCourseForm.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="课程简介" prop="courseDesc">
          <el-input v-model="editCourseForm.courseDesc" type="textarea" :rows="3" placeholder="请输入课程简介" />
        </el-form-item>
        <el-form-item label="课程封面" prop="courseImg">
          <ImageUpload v-model="editCourseForm.courseImg" :limit="1" />
        </el-form-item>
        <el-form-item label="课时" prop="lessonHours">
          <el-input-number v-model="editCourseForm.lessonHours" :min="1" :max="500" />
        </el-form-item>
        <el-form-item label="课程状态" prop="status">
          <el-radio-group v-model="editCourseForm.status">
            <el-radio label="2">未开始</el-radio>
            <el-radio label="0">进行中</el-radio>
            <el-radio label="1">已结束</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editCourseOpen = false">取消</el-button>
        <el-button type="primary" @click="submitEditCourse">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="noticeOpen" title="发布公告" width="500px">
      <el-form :model="noticeForm" ref="noticeRef" label-width="80px" :rules="noticeRules">
        <el-form-item label="标题" prop="noticeTitle">
          <el-input v-model="noticeForm.noticeTitle" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="内容" prop="noticeContent">
          <el-input v-model="noticeForm.noticeContent" type="textarea" :rows="4" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="noticeOpen = false">取消</el-button>
        <el-button type="primary" @click="submitNotice">发布</el-button>
      </template>
    </el-dialog>

    <!-- Invite Dialog -->
    <el-dialog v-model="inviteOpen" title="生成邀请码" width="400px">
      <el-form label-width="80px">
        <el-form-item label="有效期">
          <el-select v-model="inviteDuration" style="width: 100%">
            <el-option v-for="item in durationOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inviteOpen = false">取消</el-button>
        <el-button type="primary" @click="submitInvite">生成</el-button>
      </template>
    </el-dialog>

    <!-- Invite Result Dialog -->
    <el-dialog v-model="inviteResultOpen" title="邀请码" width="400px" center>
      <div style="text-align: center; padding: 20px 0;">
        <div style="font-size: 32px; font-weight: bold; color: #409EFF; letter-spacing: 4px; margin-bottom: 10px;">{{ inviteCode }}</div>
        <div style="color: #999; font-size: 13px;">有效期 {{ inviteExpireHours }} 小时</div>
      </div>
      <template #footer>
        <el-button type="primary" @click="copyCode">复制</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { addHomework, listHomework, submitHomework as submitHomeworkApi, listMySubmits,
  listHomeworkSubmits,
  gradeHomeworkSubmit } from '@/api/edu/homework'
import { ref, onMounted, computed, watch, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getToken } from '@/utils/auth'
import { getCourse, getCourseNotices, addCourseNotice, delCourseNotice, inviteCourse, getCourseStudents, addCourseStudents, removeCourseStudent, addCourseStudentsFromClass, updateCourse, delCourse } from '@/api/edu/course'
import { getNestedList, addChapter, updateChapter, delChapter } from '@/api/system/chapter'
import { listClass } from '@/api/edu/class'
import { getUserBrief } from '@/api/edu/class'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoPlay, Share, User, Search, InfoFilled, Delete, Setting, Edit, FolderAdd, DocumentAdd, EditPen, DeleteFilled } from '@element-plus/icons-vue'
import useUserStore from '@/store/modules/user'
import ImageUpload from '@/components/ImageUpload/index.vue'
import defaultImg from '@/assets/images/profile.jpg'
import defaultAvatar from '@/assets/images/profile.jpg'

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const gradeOpen = ref(false)  // 控制弹窗显示
const gradingRow = ref(null)  // 存储正在批改的作业数据
// ===== 教师：提交列表 & 批改 =====
const teacherSubmitsOpen = ref(false)
const teacherSubmits = ref([])

// 拉取某个作业的提交列表
const loadTeacherSubmits = async (homeworkId) => {
  const res = await listHomeworkSubmits({ homeworkId })
  teacherSubmits.value = res.data || res.rows || []
}

// 老师点“批改”按钮：打开提交列表弹窗
const openSubmitsDialog = async (homeworkRow) => {
  currentHomework.value = homeworkRow
  teacherSubmitsOpen.value = true
  await loadTeacherSubmits(homeworkRow.homeworkId)
}

const gradeForm = ref({
  score: null, // 分数
  teacherComment: ''  // 评语
})
const gradeLoading = ref(false)  // 提交按钮加载状态

// 打开评分弹窗
const openGradeDialog = (row) => {
  gradingRow.value = row
  gradeForm.value.score = row.score || null  // 如果已评分，则显示分数
  gradeForm.value.teacherComment = row.teacherComment || ''  // 显示评语
  gradeOpen.value = true
}

// 提交评分
const doGrade = async () => {
  if (gradeForm.value.score == null || gradeForm.value.teacherComment.trim() === '') {
    ElMessage.warning('分数和评语不能为空')
    return
  }
  gradeLoading.value = true
  try {
    // 提交评分的 API 请求
    await gradeHomeworkSubmit(gradingRow.value.submitId, gradeForm.value.score, gradeForm.value.teacherComment)
    ElMessage.success('评分成功')
    gradeOpen.value = false
    // 更新列表，重新加载作业提交情况
    await loadTeacherSubmits(currentHomework.value.homeworkId)

  } finally {
    gradeLoading.value = false
  }
}



const courseId = route.params.id
// ===== 作业创建（Homework Create）=====

const homeworkList = ref([])
//  筛选条件
const homeworkQuery = ref({
  title: '',   // 作业名关键字
  status: ''   // '' 表示全部；'0' 草稿；'1' 发布
})
const homeworkRaw = ref([])   //  后端全量数据（不直接渲染）
//学生提交作业用
// ===== 学生提交作业（Homework Submit）=====
const homeworkSubmitOpen = ref(false)
const currentHomework = ref(null)
const submitLoading = ref(false)

const submitForm = ref({
  homeworkId: null,
  submitContent: ''
})

// key=homeworkId，value=提交记录
const mySubmitMap = ref({})

const loadMySubmits = async () => {
  const res = await listMySubmits({ courseId: Number(courseId) })
  const arr = res.data || []
  const map = {}
  arr.forEach(s => { map[s.homeworkId] = s })
  mySubmitMap.value = map
}

// 点击作业行 -> 打开提交弹窗（老师不弹）
const handleHomeworkRowClick = async (row) => {
    // 老师：打开提交列表
  if (isTeacher.value) {
    return
  }
  currentHomework.value = row



  // 学生：打开提交弹窗
  if (String(row.status) !== '1') {
    ElMessage.warning('该作业尚未发布，不能提交')
    return
  }

  submitForm.value.homeworkId = row.homeworkId
  const existed = mySubmitMap.value[row.homeworkId]
  submitForm.value.submitContent = existed ? (existed.submitContent || '') : ''
  homeworkSubmitOpen.value = true
}


const doSubmitHomework = async () => {
  if (!submitForm.value.submitContent || !submitForm.value.submitContent.trim()) {
    ElMessage.warning('请填写作业内容')
    return
  }
  submitLoading.value = true
  try {
    await submitHomeworkApi({
      courseId: Number(courseId),
      homeworkId: submitForm.value.homeworkId,
      submitContent: submitForm.value.submitContent
    })
    ElMessage.success('提交成功')
    homeworkSubmitOpen.value = false
    await loadMySubmits() // 刷新“已提交/未提交”
  } finally {
    submitLoading.value = false
  }
}
//检查


//  展示用：过滤后的列表（实时响应）
const filteredHomeworkList = computed(() => {
  const kw = (homeworkQuery.value.title || '').trim().toLowerCase()
  const st = homeworkQuery.value.status

  return (homeworkList.value || []).filter(h => {
    const okStatus = !st || String(h.status) === String(st)
    const okTitle = !kw || String(h.title || '').toLowerCase().includes(kw)
    return okStatus && okTitle
  })
})


const applyHomeworkFilter = () => {
  const kw = (homeworkQuery.value.title || '').trim().toLowerCase()
  const st = homeworkQuery.value.status

  homeworkList.value = homeworkRaw.value.filter(h => {
    const okStatus = !st || String(h.status) === String(st)
    const okTitle = !kw || String(h.title || '').toLowerCase().includes(kw)
    return okStatus && okTitle
  })
}
watch(
  () => [homeworkQuery.value.title, homeworkQuery.value.status],
  () => applyHomeworkFilter()
)



const resetHomeworkFilter = () => {
  homeworkQuery.value.title = ''
  homeworkQuery.value.status = ''
}
const homeworkOpen = ref(false)
const homeworkSaving = ref(false)
const homeworkForm = ref({
  courseId: null,
  title: '',
  content: '',
  deadline: '',
  status: '0'
})



const loadHomework = async () => {
  const res = await listHomework({ courseId: Number(courseId) })
  homeworkRaw.value = res.data || res.rows || []
  applyHomeworkFilter()
}


const openHomeworkDialog = () => {
  homeworkForm.value = {
    courseId: Number(courseId),
    title: '',
    content: '',
    deadline: '',
    status: '0'
  }
  homeworkOpen.value = true
}

const submitCreateHomework = async () => {
  homeworkSaving.value = true
  try {
    homeworkForm.value.courseId = Number(courseId)
    await addHomework(homeworkForm.value)
    ElMessage.success('创建成功')
    homeworkOpen.value = false
    await loadHomework()
  } finally {
    homeworkSaving.value = false
  }
}


const course = ref({})
const chapters = ref([])
const notices = ref([])
const students = ref([])
const activeMenu = ref('courseware')
const isTeacher = ref(false)
const noticeOpen = ref(false)
const noticeForm = ref({})
const noticeRef = ref(null)
const noticeRules = {
  noticeTitle: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  noticeContent: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

// Chapter Management
const chapterManageOpen = ref(false)
const chapterEditOpen = ref(false)
const chapterForm = ref({})
const chapterRef = ref(null)
const parentChapterName = ref('')
const chapterRules = {
  chapterName: [{ required: true, message: '请输入章节名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

const openChapterManage = () => {

}

const handleAddChapter = (parent) => {
  chapterForm.value = {
    courseId: courseId,
    parentId: parent ? parent.chapterId : 0,
    sort: 0,
    chapterName: ''
  }
  parentChapterName.value = parent ? parent.chapterName : '顶级章节'
  chapterEditOpen.value = true
}

const handleEditChapter = (row) => {
  chapterForm.value = { ...row }
  // Find parent name if not root
  if (row.parentId !== 0) {
    // Simple find in current tree for display
    const parent = findParentInTree(chapters.value, row.parentId)
    parentChapterName.value = parent ? parent.chapterName : '未知上级'
  }
  chapterEditOpen.value = true
}

const findParentInTree = (tree, id) => {
  for (const node of tree) {
    if (node.chapterId === id) return node
    if (node.children) {
      const found = findParentInTree(node.children, id)
      if (found) return found
    }
  }
  return null
}

const handleDeleteChapter = (row) => {
  ElMessageBox.confirm('确认删除该章节吗？如果有子章节或关联视频也会被影响！', '警告', {
    type: 'warning'
  }).then(() => {
    delChapter(row.chapterId).then(() => {
      ElMessage.success('删除成功')
      getChapterList()
    })
  })
}

const submitChapter = () => {
  chapterRef.value.validate(valid => {
    if (valid) {
      if (chapterForm.value.chapterId) {
        updateChapter(chapterForm.value).then(() => {
          ElMessage.success('更新成功')
          chapterEditOpen.value = false
          getChapterList()
        })
      } else {
        addChapter(chapterForm.value).then(() => {
          ElMessage.success('添加成功')
          chapterEditOpen.value = false
          getChapterList()
        })
      }
    }
  })
}

// Student Management Logic
const studentAddOpen = ref(false)
const studentAddActiveTab = ref('search')
const studentSearchQuery = ref('')
const studentSearchResults = ref([])
const studentSelected = ref([])
const classList = ref([])
const selectedClassId = ref(null)

// Invite Logic
const inviteOpen = ref(false)
const inviteResultOpen = ref(false)
const inviteDuration = ref(24)
const inviteCode = ref('')
const inviteExpireHours = ref(0)

const durationOptions = [
  { label: '1小时', value: 1 },
  { label: '24小时', value: 24 },
  { label: '3天', value: 72 },
  { label: '7天', value: 168 },
  { label: '永久', value: 87600 } // ~10 years
]

const handleInvite = () => {
  inviteDuration.value = 24
  inviteOpen.value = true
}

const submitInvite = () => {
  inviteCourse(courseId, inviteDuration.value).then(res => {
    inviteCode.value = res.data.inviteCode
    inviteExpireHours.value = res.data.expireHours
    inviteOpen.value = false
    inviteResultOpen.value = true
  })
}

const copyCode = () => {
  navigator.clipboard.writeText(inviteCode.value).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const menuItems = computed(() => {
  const items = [
    { key: 'announcement', label: '公告', icon: 'Bell' },
    { key: 'courseware', label: '课件', icon: 'Document' },
    { key: 'homework', label: '测验与作业', icon: 'EditPen' },
    { key: 'exam', label: '考试', icon: 'Monitor' }
  ]
  if (isTeacher.value) {
    items.push({ key: 'members', label: '人员管理', icon: 'User' })
    items.push({ key: 'settings', label: '课程设置', icon: 'Setting' })
  }
  return items
})

const activeLabel = computed(() => {
  const item = menuItems.value.find(i => i.key === activeMenu.value)
  return item ? item.label : ''
})

watch(activeMenu, (val) => {
  if (val === 'announcement') {
    loadNotices()
  } else if (val === 'members') {
    loadStudents()
  } else if (val === 'homework') {
    loadHomework()
    loadMySubmits()
  }
})

onMounted(() => {
  if (courseId) {
    getCourseInfo()
    getChapterList()
  }
})

const getCourseInfo = () => {
  getCourse(courseId).then(res => {
    course.value = res.data || {}
    const teachers = res.teachers || []
    const userId = userStore.id
    isTeacher.value = teachers.some(t => String(t.userId) === String(userId)) || (userStore.roles && userStore.roles.includes('admin'))
    
    if (activeMenu.value === 'announcement') {
        loadNotices()
    }
  })
}

const getChapterList = () => {
  getNestedList(courseId).then(res => {
    chapters.value = res.data || []
  })
}

const loadNotices = () => {
  getCourseNotices(courseId).then(res => {
    notices.value = res.data || []
  })
}

const openNoticeDialog = () => {
  noticeForm.value = {}
  noticeOpen.value = true
}

const submitNotice = () => {
  noticeRef.value.validate(valid => {
    if (valid) {
      addCourseNotice(courseId, noticeForm.value).then(() => {
        ElMessage.success('发布成功')
        noticeOpen.value = false
        loadNotices()
      })
    }
  })
}

const handleDelNotice = (notice) => {
  ElMessageBox.confirm('确认删除该公告吗？', '提示', {
    type: 'warning'
  }).then(() => {
    delCourseNotice(courseId, notice.noticeId).then(() => {
      ElMessage.success('删除成功')
      loadNotices()
    })
  })
}

// Member Management Functions
const loadStudents = () => {
  getCourseStudents(courseId).then(res => {
    students.value = res.rows || []
  })
}

const handleRemoveStudent = (row) => {
  ElMessageBox.confirm('确认移除该学生吗？', '提示', { type: 'warning' }).then(() => {
    removeCourseStudent(courseId, row.userId).then(() => {
      ElMessage.success('移除成功')
      loadStudents()
    })
  })
}

const openStudentAddDialog = () => {
  studentAddOpen.value = true
  studentSearchQuery.value = ''
  studentSearchResults.value = []
  studentSelected.value = []
  studentAddActiveTab.value = 'search'
  
  // Load classes if not loaded
  if (classList.value.length === 0) {
    listClass().then(res => {
      classList.value = res.rows || []
    })
  }
}

const searchStudent = () => {
  if (!studentSearchQuery.value) return
  getUserBrief(studentSearchQuery.value).then(res => {
    if (res.data && Array.isArray(res.data)) {
        studentSearchResults.value = res.data
    } else if (res.data) {
        studentSearchResults.value = [res.data]
    } else {
        studentSearchResults.value = []
    }
  })
}

const isStudentSelected = (userId) => {
  return studentSelected.value.some(u => u.userId === userId)
}

const isAlreadyMember = (userId) => {
  return students.value.some(s => s.userId === userId)
}

const toggleStudentSelection = (user) => {
  if (isStudentSelected(user.userId)) {
    studentSelected.value = studentSelected.value.filter(u => u.userId !== user.userId)
  } else {
    studentSelected.value.push(user)
  }
}

const removeSelectedStudent = (userId) => {
  studentSelected.value = studentSelected.value.filter(u => u.userId !== userId)
}

const submitAddStudents = () => {
  if (studentAddActiveTab.value === 'search') {
    const ids = studentSelected.value.map(u => u.userId)
    if (ids.length === 0) return
    addCourseStudents(courseId, ids).then(() => {
      ElMessage.success('添加成功')
      studentAddOpen.value = false
      loadStudents()
    })
  } else if (studentAddActiveTab.value === 'class') {
    if (!selectedClassId.value) {
      ElMessage.warning('请选择班级')
      return
    }
    addCourseStudentsFromClass(courseId, selectedClassId.value).then(res => {
      ElMessage.success(res.msg)
      studentAddOpen.value = false
      loadStudents()
    })
  }
}

// Course Settings Logic
const editCourseOpen = ref(false)
const editCourseForm = ref({})
const editCourseRules = {
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择课程状态', trigger: 'change' }]
}

const openEditCourseDialog = () => {
  editCourseForm.value = {
    courseId: course.value.courseId,
    courseName: course.value.courseName,
    courseDesc: course.value.courseDesc,
    lessonHours: course.value.lessonHours,
    status: course.value.status,
    courseImg: course.value.courseImg
  }
  editCourseOpen.value = true
}

const submitEditCourse = () => {
  updateCourse(editCourseForm.value).then(() => {
    ElMessage.success('更新成功')
    editCourseOpen.value = false
    getCourseInfo() // Refresh info
  })
}

const handleDeleteCourse = () => {
  ElMessageBox.confirm('确认删除该课程吗？删除后不可恢复！', '警告', {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delCourse(courseId).then(() => {
      ElMessage.success('删除成功')
      router.push('/portal')
    })
  }).catch(() => {})
}

// Status text helper
const getStatusText = (status) => {
  if (status === '0') return '进行中'
  if (status === '1') return '已结束'
  if (status === '2') return '未开始'
  return '未知'
}
</script>

<style scoped lang="scss">
// ... (previous styles)

// Search Results Styles
.search-panel {
  .search-results {
    margin-top: 15px;
    height: 300px;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 10px;
    
    .result-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .user-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: #f9f9f9;
      border-radius: 4px;
      
      .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .info-text {
          .name { 
            font-weight: bold; 
            font-size: 14px;
            .sub { font-weight: normal; color: #999; font-size: 12px; margin-left: 4px; }
          }
          .id { font-size: 12px; color: #999; }
        }
      }
    }
  }
  
  .selected-panel {
    margin-top: 15px;
    border-top: 1px solid #eee;
    padding-top: 10px;
    
    .panel-title {
      font-size: 13px;
      color: #666;
      margin-bottom: 8px;
    }
    
    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
}

.class-panel {
  .class-tip {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: #e6f7ff;
    border: 1px solid #91d5ff;
    padding: 10px;
    border-radius: 4px;
    margin-top: 20px;
    color: #409EFF;
    font-size: 13px;
    line-height: 1.5;
  }
}

// Settings Styles
.settings-container {
  padding: 20px 0;
  
  .info-card {
    display: flex;
    gap: 30px;
    background: #fcfcfc;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    padding: 30px;
    
    .card-left {
      flex-shrink: 0;
      .settings-cover {
        width: 280px;
        height: 160px;
        border-radius: 8px;
        object-fit: cover;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
    }
    
    .card-right {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .info-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
        
        .course-title {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin: 0;
        }
      }
      
      .info-desc {
        color: #666;
        line-height: 1.6;
        margin-bottom: 25px;
        flex: 1;
      }
      
      .info-stats {
        display: flex;
        gap: 40px;
        margin-bottom: 30px;
        padding: 15px 0;
        border-top: 1px solid #eee;
        border-bottom: 1px solid #eee;
        
        .stat-item {
          .label { font-size: 13px; color: #999; margin-bottom: 5px; }
          .value { font-size: 20px; font-weight: bold; color: #333; }
        }
      }
      
      .info-actions {
        display: flex;
        gap: 15px;
      }
    }
  }
}

// Table Styles
.member-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #ebeef5;
  
  :deep(.el-table__row) {
    height: 70px;
  }
  
  .id-cell {
    color: #909399;
    font-family: monospace;
    font-size: 13px;
    background: #f5f7fa;
    padding: 2px 6px;
    border-radius: 4px;
  }
  
  .user-cell {
    display: flex;
    align-items: center;
    gap: 15px;
    
    .user-avatar {
      flex-shrink: 0;
      border: 2px solid #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      background-color: #409EFF;
      font-size: 16px;
      font-weight: bold;
    }
    
    .user-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      
      .nickname {
        font-weight: 600;
        color: #303133;
        font-size: 14px;
      }
      
      .username {
        color: #909399;
        font-size: 12px;
      }
    }
  }
  
  .empty-text {
    color: #c0c4cc;
    font-size: 12px;
  }
  
  .action-btn {
    opacity: 0.8;
    &:hover {
      opacity: 1;
      background-color: #fef0f0;
    }
  }
}

// Chapter Manage Styles
.chapter-manage-toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.chapter-tree {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
  
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
    
    .node-label {
      display: flex;
      align-items: center;
      gap: 5px;
      
      .node-sort {
        color: #999;
        font-size: 12px;
        font-family: monospace;
      }
    }
    
    .node-actions {
      display: none;
    }
    
    &:hover .node-actions {
      display: block;
    }
  }
}

.learn-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.learn-header {
  height: 60px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 10;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 15px;
    
    .logo-area {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      .logo { width: 30px; height: 30px; }
      .platform-name { font-weight: bold; font-size: 16px; color: #333; }
    }
    
    .divider {
      width: 1px;
      height: 20px;
      background: #e0e0e0;
    }
    
    .course-info {
      display: flex;
      align-items: center;
      gap: 10px;
      
      .course-thumb {
        width: 60px;
        height: 34px;
        border-radius: 4px;
        object-fit: cover;
      }
      
      .course-name {
        font-size: 16px;
        color: #333;
      }
      
      .teacher-name {
        font-size: 12px;
        color: #666;
        background: #f0f0f0;
        padding: 2px 6px;
        border-radius: 4px;
      }
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .user-profile {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .user-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
      }
      
      .user-name {
        font-size: 14px;
        color: #666;
      }
    }
  }
}

.learn-body {
  flex: 1;
  display: flex;
  max-width: 1200px;
  margin: 20px auto;
  width: 100%;
  gap: 20px;
  align-items: flex-start;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  
  .sidebar-wrapper {
    background: #fff;
    border-radius: 8px;
    padding: 10px 0;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    cursor: pointer;
    color: #666;
    transition: all 0.3s;
    border-left: 3px solid transparent;
    
    &:hover {
      background: #f5f7fa;
      color: #409EFF;
    }
    
    &.active {
      background: #e6f7ff;
      color: #409EFF;
      border-left-color: #409EFF;
      font-weight: 500;
    }
    
    .menu-icon {
      margin-right: 10px;
      font-size: 18px;
    }
    
    .menu-label {
      font-size: 14px;
    }
  }
}

.main-content {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  min-height: 500px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  padding: 30px;
}

.content-wrapper {
  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
    
    h2 {
      font-size: 20px;
      font-weight: 500;
      margin: 0;
      color: #333;
    }
    
    .header-action {
      font-size: 12px;
      color: #999;
      cursor: pointer;
      &:hover { color: #409EFF; }
    }
  }
}

.chapter-block {
  margin-bottom: 30px;
  
  .chapter-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 15px;
    background: #f8f9fa;
    padding: 10px 15px;
    border-radius: 4px;
    
    .chapter-idx {
      font-weight: bold;
      margin-right: 5px;
      color: #909399;
    }
  }
  
  .section-list {
    padding-left: 15px;
  }
  
  .section-item {
    display: flex;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid #f5f5f5;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: #f9f9f9;
      .section-title { color: #409EFF; }
    }
    
    .section-icon {
      margin-right: 12px;
    }
    
    .section-info {
      flex: 1;
      .section-title {
        font-size: 14px;
        color: #333;
      }
    }
    
    .section-action {
      color: #ccc;
    }
  }
  
  .empty-section {
    padding: 10px;
    color: #999;
    font-size: 13px;
    font-style: italic;
  }
}

.notice-item {
  background: #fff;
  border: 1px solid #eee;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  .notice-main {
    flex: 1;
    margin-right: 20px;
    
    .notice-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }
    
    .notice-content {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 10px;
      white-space: pre-wrap;
    }
    
    .notice-time {
      font-size: 12px;
      color: #999;
    }
  }
  
  .notice-action {
    flex-shrink: 0;
  }
}
.homework-filter {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 15px;
}

</style>
