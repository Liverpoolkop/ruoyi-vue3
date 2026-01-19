<template>
  <div class="learn-container">
    <!-- Top Header -->
    <div class="learn-header">
      <div class="header-left">
        <div class="back-area" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </div>
        <div class="divider"></div>
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
        <el-button v-if="isTeacher" type="primary" plain round size="small" :icon="Share" @click="handleInvite" style="margin-right: 15px;">邀请加入</el-button>
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
            <el-button v-if="isTeacher" type="primary" size="small" :icon="Setting" @click="openChapterManage">管理目录</el-button>
          </div>
          
          <div class="chapter-list-container">
            <div v-if="chapters.length > 0">
              <div v-for="chapter in chapters" :key="chapter.chapterId" class="chapter-block">
                <div class="chapter-title">
                  {{ chapter.chapterName }}
                </div>
                <div class="section-list">
                  <!-- 1. Chapter Resources -->
                  <div v-if="chapter.resources && chapter.resources.length > 0">
                    <div v-for="resource in chapter.resources" :key="resource.resourceId" class="section-item" @click="handlePlayResource(resource)">
                      <div class="section-icon">
                        <el-tag size="small" effect="plain">{{ getResourceType(resource.url) }}</el-tag>
                      </div>
                      <div class="section-info">
                        <div class="section-title">{{ resource.resourceName }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- 2. Sub-Chapters and their Resources -->
                  <div v-if="chapter.children && chapter.children.length > 0">
                    <div v-for="subChapter in chapter.children" :key="subChapter.chapterId" class="sub-chapter-block">
                      <div class="sub-chapter-header">{{ subChapter.chapterName }}</div>
                      <div v-if="subChapter.resources && subChapter.resources.length > 0">
                        <div v-for="resource in subChapter.resources" :key="resource.resourceId" class="section-item" @click="handlePlayResource(resource)">
                          <div class="section-icon">
                            <el-tag size="small" effect="plain">{{ getResourceType(resource.url) }}</el-tag>
                          </div>
                          <div class="section-info">
                            <div class="section-title">{{ resource.resourceName }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="(!chapter.resources || chapter.resources.length === 0) && (!chapter.children || chapter.children.length === 0)" class="empty-section">本章暂无内容</div>
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
            <el-button v-if="isTeacher" type="primary" size="small" :icon="Plus" @click="openNoticeDialog">发布公告</el-button>
          </div>
          <div v-if="notices && notices.length > 0" class="notice-list">
             <div v-for="notice in notices" :key="notice.noticeId" class="notice-item">
                <div class="notice-main">
                   <div class="notice-title">{{ notice.noticeTitle }}</div>
                   <div class="notice-content">{{ notice.noticeContent }}</div>
                   <div class="notice-time">{{ notice.createTime }}</div>
                </div>
                <div v-if="isTeacher" class="notice-action">
                   <el-button type="danger" link :icon="Delete" @click="handleDelNotice(notice)">删除</el-button>
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
            <el-button v-if="isTeacher" type="primary" size="small" :icon="Plus" @click="openHomeworkDialog">发布作业</el-button>
          </div>

          <div v-if="homeworkList && homeworkList.length > 0" class="homework-list">
             <div v-for="hw in homeworkList" :key="hw.id" :class="['homework-item', 'status-' + hw.status]">
                <div class="homework-left-border"></div>
                <div class="homework-main">
                   <div class="homework-header">
                       <span class="homework-title">{{ hw.title }}</span>
                       <el-tag size="small" :type="getHomeworkStatusType(hw.status)" effect="plain" round>
                         {{ getHomeworkStatusText(hw.status) }}
                       </el-tag>
                   </div>

                   <div class="homework-meta">
                       <div class="meta-item">
                           <el-icon><Calendar /></el-icon>
                           <span>发布: {{ hw.createTime }}</span>
                       </div>
                       <div class="meta-item deadline" v-if="hw.deadline">
                           <el-icon><Warning /></el-icon>
                           <span>截止: {{ hw.deadline }}</span>
                       </div>
                   </div>

                   <!-- Content preview removed as per request -->
                </div>

                <div class="homework-right">
                   <template v-if="isTeacher">
                       <div class="action-buttons">
                           <el-button type="primary" link :icon="Edit" @click="handleEditHomework(hw)">编辑</el-button>
                           <el-button type="success" link :icon="View" @click="handleViewSubmissions(hw)">查看提交</el-button>
                           <el-button type="danger" link :icon="Delete" @click="handleDelHomework(hw)">删除</el-button>
                       </div>
                   </template>
                   <template v-else>
                       <div class="student-status-area">
                           <div v-if="isSubmitted(hw)" class="status-indicator submitted">
                               <el-icon class="status-icon"><Check /></el-icon>
                               <div class="status-text">
                                   <div class="main-text">{{ getSubmissionStatusText(hw) }}</div>
                                   <div v-if="getSubmissionGrade(hw)" class="grade-badge">{{ getSubmissionGrade(hw) }}分</div>
                               </div>
                           </div>
                           <div v-else class="status-indicator not-submitted">
                               <div class="status-dot"></div>
                               <span class="main-text">未提交</span>
                           </div>
                       </div>

                       <div class="student-actions">
                           <el-tooltip :content="getSubmitTooltip(hw)" :disabled="canSubmit(hw) || (isSubmitted(hw) && canSubmit(hw))" placement="top">
                               <span class="action-wrapper">
                                   <el-button
                                    v-if="!isSubmitted(hw)"
                                    type="primary"
                                    round
                                    :icon="Upload"
                                    :disabled="!canSubmit(hw)"
                                    @click="openSubmitDialog(hw)"
                                   >提交作业</el-button>

                                   <el-button
                                    v-else-if="canSubmit(hw)"
                                    type="warning"
                                    plain
                                    round
                                    :icon="Edit"
                                    @click="openSubmitDialog(hw)"
                                   >修改作业</el-button>

                                   <el-button
                                    v-else
                                    type="info"
                                    plain
                                    round
                                    :icon="View"
                                    @click="openViewDialog(hw)"
                                   >查看详情</el-button>
                               </span>
                           </el-tooltip>
                       </div>
                   </template>
                </div>
             </div>
          </div>
          <el-empty v-else description="暂无作业" />
        </div>

        <!-- Exam -->
        <div v-else-if="activeMenu === 'exam'" class="content-wrapper">
          <div class="content-header">
            <h2>考试</h2>
            <el-button v-if="isTeacher" type="primary" size="small" icon="Plus" @click="openExamDialog">发起考试</el-button>
          </div>

          <div v-if="examList && examList.length > 0" class="exam-list">
            <el-card v-for="exam in examList" :key="exam.id" class="exam-card" shadow="hover">
              <div class="exam-header">
                <div class="exam-title">
                  <el-tag :type="getExamStatusTag(exam)" effect="dark" style="margin-right: 8px;">
                    {{ getExamStatusText(exam) }}
                  </el-tag>
                  {{ exam.title }}
                </div>
                <div v-if="isTeacher" class="exam-actions">
                  <el-button link type="primary" @click="handleEditExam(exam)">
                    编辑
                  </el-button>
                  <el-button link type="success" @click="handlePublishExam(exam)" v-if="exam.status === '0'">
                    发布
                  </el-button>
                  <el-button link type="warning" @click="handleMarkExam(exam)" v-if="exam.status === '1'">
                    阅卷
                  </el-button>
                  <el-button link type="danger" @click="handleDeleteExam(exam)">
                    删除
                  </el-button>
                </div>
              </div>

              <div class="exam-info">
                <div class="info-item"><el-icon><Timer /></el-icon> 时长：{{ exam.duration ? exam.duration + '分钟' : '不限时' }}</div>
                <div class="info-item"><el-icon><Trophy /></el-icon> 总分：{{ exam.totalScore }}分</div>
                <div class="info-item"><el-icon><Calendar /></el-icon> 截止：{{ exam.endTime || '无截止' }}</div>
              </div>

              <div class="exam-desc" v-if="exam.description">{{ exam.description }}</div>

              <div v-if="!isTeacher" class="student-action">
                <el-button
                  type="primary"
                  round
                  :disabled="!canStartExam(exam)"
                  @click="handleStartExam(exam)"
                >
                  {{ getStudentExamBtnText(exam) }}
                </el-button>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="暂无考试安排" />

          <el-dialog v-model="examDialogOpen" :title="examForm.id ? '编辑考试' : '发起考试'" width="900px" top="5vh">
            <el-form :model="examForm" ref="examRef" :rules="examRules" label-width="100px">
              <el-form-item label="考试名称" prop="title">
                <el-input v-model="examForm.title" placeholder="请输入考试名称" />
              </el-form-item>
              <el-row>
                 <el-col :span="12">
                   <el-form-item label="答题时长" prop="duration">
                     <el-input-number v-model="examForm.duration" :min="0" placeholder="0为不限时" />
                     <span class="tip-text">分钟 (0或空为不限时)</span>
                   </el-form-item>
                 </el-col>
                 <el-col :span="12">
                   <el-form-item label="截止时间" prop="endTime">
                      <el-date-picker v-model="examForm.endTime" type="datetime" placeholder="选择截止时间" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%"/>
                   </el-form-item>
                 </el-col>
              </el-row>
              <el-form-item label="试卷须知">
                <el-input v-model="examForm.description" type="textarea" :rows="3" />
              </el-form-item>

              <el-divider content-position="left">试卷题目管理</el-divider>

              <div class="question-selector">
                 <div class="selector-header">
                    <el-button
                      type="success"
                      plain
                      size="small"
                      icon="Plus"
                      @click="openQuestionBankDialog"
                      :disabled="examForm.status === '1'"
                    >
                      从题库添加题目 {{ examForm.status === '1' ? '(已发布不可修改题目)' : '' }}
                    </el-button>
                    <span class="stats">当前题目数：{{ examForm.questionList.length }}，总分：{{ calculateTotalScore() }}</span>
                 </div>
                 <el-table :data="examForm.questionList" border style="margin-top: 10px; max-height: 300px; overflow-y: auto;">
                    <el-table-column type="index" label="序号" width="50" />
                    <el-table-column prop="content" label="题目内容" show-overflow-tooltip />
                    <el-table-column label="类型" width="80">
                       <template #default="{row}">{{ getQuestionType(row.type) }}</template>
                    </el-table-column>
                    <el-table-column label="分值" width="120">
                       <template #default="{row}">
                          <el-input-number v-model="row.score" :min="1" size="small" style="width: 90px" :disabled="examForm.status === '1'" />
                       </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80">
                       <template #default="scope">
                          <el-button
                            link
                            type="danger"
                            icon="Delete"
                            @click="removeQuestion(scope.$index)"
                            :disabled="examForm.status === '1'"
                          ></el-button>
                       </template>
                    </el-table-column>
                 </el-table>
              </div>
            </el-form>
            <template #footer>
              <el-button @click="examDialogOpen = false">取消</el-button>
              <el-button type="primary" @click="submitExam">保存</el-button>
            </template>
          </el-dialog>

          <el-dialog v-model="bankDialogOpen" title="选择题目" width="800px" append-to-body>
             <div class="bank-filter">
                <el-input v-model="qSearchTags" placeholder="输入标签搜索" style="width: 200px; margin-right: 10px;" />
                <el-button type="primary" icon="Search" @click="searchQuestions">搜索</el-button>
             </div>
             <el-table :data="bankQuestionList" @selection-change="handleQSelection" height="400px">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="content" label="题目" show-overflow-tooltip />
                <el-table-column prop="tags" label="标签" width="150" />
                <el-table-column prop="type" label="类型" width="100">
                    <template #default="{row}">{{ getQuestionType(row.type) }}</template>
                </el-table-column>
             </el-table>
             <template #footer>
                <el-button @click="bankDialogOpen = false">取消</el-button>
                <el-button type="primary" @click="confirmAddQuestions">添加选中 ({{ selectedBankQuestions.length }})</el-button>
             </template>
          </el-dialog>

          <el-dialog v-model="markingOpen" title="考试阅卷" width="800px">
            <el-table :data="markingList" v-loading="markingLoading">
              <el-table-column label="学生姓名" prop="studentName" align="center" />
              <el-table-column label="提交时间" prop="submitTime" align="center" width="180" />
              <el-table-column label="状态" align="center" width="100">
                <template #default="{row}">
                  <el-tag :type="row.status === '3' ? 'success' : 'primary'">{{ getRecordStatus(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="客观分" prop="objectiveScore" align="center" width="100" />
              <el-table-column label="总分" prop="totalScore" align="center" width="100">
                <template #default="{row}">
                  <span style="font-weight:bold; color:#f56c6c">{{ row.totalScore }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center">
                <template #default="{row}">
                  <el-button
                    v-if="row.status === '2'"
                    type="primary"
                    size="small"
                    @click="handleGrade(row)">
                    去阅卷
                  </el-button>
                  <el-button
                    v-else-if="row.status === '3'"
                    type="success"
                    size="small"
                    plain
                    @click="handleGrade(row)">
                    已阅卷 (修改)
                  </el-button>
                  <span v-else>未交卷</span>
                </template>
              </el-table-column>
            </el-table>
            <template #footer>
              <el-button @click="markingOpen = false">关 闭</el-button>
            </template>
          </el-dialog>


          <el-drawer v-model="gradingDrawerOpen" title="批改试卷" size="50%">
            <div style="padding: 20px; overflow-y: auto; height: calc(100vh - 150px);">
              <div v-for="(item, index) in studentAnswerList" :key="item.id" style="border-bottom:1px solid #eee; padding-bottom:20px; margin-bottom:20px">

                <div style="font-weight:bold; margin-bottom:10px;">
                  <el-tag :type="String(item.questionType) === '4' ? 'warning' : 'info'" size="small">
                      {{ String(item.questionType) === '4' ? '简答题' : '客观题' }}
                  </el-tag>
                  <span style="margin-left:10px;">第 {{ index + 1 }} 题</span>
                  <span style="font-size:12px; color:#666; margin-left:5px;">(满分: {{ item.maxScore }}分)</span>
                </div>

                <div style="margin-bottom:10px;">{{ item.questionContent }}</div>

                <div style="background:#f5f7fa; padding:10px; border-radius:4px; margin-bottom:10px;">
                  <p style="margin:0; font-size:12px; color:#999">学生作答：</p>
                  <p style="margin:5px 0 0 0; font-weight:bold">{{ item.studentAnswer || '未作答' }}</p>
                </div>
                <div style="background:#f0f9eb; padding:10px; border-radius:4px; margin-bottom:15px;">
                  <p style="margin:0; font-size:12px; color:#67c23a">参考答案：</p>
                  <p style="margin:5px 0 0 0">{{ item.refAnswer }}</p>
                </div>

                <div style="display:flex; align-items:center; background:#e6f7ff; padding:10px; border-radius:4px;">
                  <span style="font-weight:bold; color:#409EFF; margin-right:10px;">评分：</span>
                  <el-input-number v-model="item.score" :min="0" :max="item.maxScore" size="small" />
                  <span v-if="String(item.questionType) !== '4'" style="margin-left:10px; font-size:12px; color:#999">
                    (系统预判: {{ item.score }}分)
                  </span>
                </div>
              </div>

              <el-divider>评语</el-divider>
              <el-input v-model="teacherComment" type="textarea" placeholder="写点评语..." :rows="3" />
            </div>

            <template #footer>
              <el-button @click="gradingDrawerOpen = false">取消</el-button>
              <el-button type="primary" @click="submitGrade">提交成绩</el-button>
            </template>
          </el-drawer>
        </div>

        <!-- Members -->
        <div v-else-if="activeMenu === 'members'" class="content-wrapper">
           <div class="content-header">
            <h2>人员管理</h2>
            <el-button type="primary" size="small" :icon="Plus" @click="openStudentAddDialog">添加成员</el-button>
          </div>
          
          <el-table 
            v-if="students && students.length > 0"
            :data="students" 
            style="width: 100%" 
            :header-cell-style="{background:'#f8f9fa', color:'#606266', fontWeight:'500'}"
            class="member-table"
          >
            <el-table-column prop="userId" label="学号" width="150" align="center" sortable>
              <template #default="scope">
                <span class="id-cell">{{ scope.row.userId }}</span>
              </template>
            </el-table-column>
            <el-table-column label="姓名" min-width="200">
              <template #default="scope">
                <div class="user-cell">
                  <el-avatar :size="40" :src="scope.row.avatar" class="user-avatar">{{ scope.row.nickName ? scope.row.nickName.charAt(0) : 'U' }}</el-avatar>
                  <div class="user-info">
                    <div class="nickname">{{ scope.row.nickName || '未设置昵称' }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="phonenumber" label="手机号" width="150" align="center">
              <template #default="scope">
                <span v-if="scope.row.phonenumber">{{ scope.row.phonenumber }}</span>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="email" label="邮箱" min-width="200">
              <template #default="scope">
                <span v-if="scope.row.email">{{ scope.row.email }}</span>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center" fixed="right">
              <template #default="scope">
                <el-button 
                  type="danger" 
                  link 
                  size="small" 
                  :icon="Delete"
                  class="action-btn"
                  @click="handleRemoveStudent(scope.row)"
                >
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无课程成员" />
          <pagination
            v-show="studentTotal > 0"
            :total="studentTotal"
            v-model:page="studentQueryParams.pageNum"
            v-model:limit="studentQueryParams.pageSize"
            @pagination="loadStudents"
          />
        </div>

        <!-- Settings -->
        <div v-else-if="activeMenu === 'settings'" class="content-wrapper">
           <div class="content-header">
            <h2>课程设置</h2>
          </div>
          
          <div class="settings-container">
            <!-- Course Info Card -->
            <div class="info-card">
              <div class="card-left">
                <img :src="course.courseImg || defaultImg" class="settings-cover" />
              </div>
              <div class="card-right">
                <div class="info-header">
                  <h3 class="course-title">{{ course.courseName }}</h3>
                  <el-tag :type="course.status === '0' ? 'success' : (course.status === '1' ? 'info' : 'warning')">
                    {{ getStatusText(course.status) }}
                  </el-tag>
                </div>
                
                <div class="info-desc">{{ course.courseDesc || '暂无简介' }}</div>
                
                <div class="info-stats">
                  <div class="stat-item">
                    <div class="label">学生人数</div>
                    <div class="value">{{ course.studentCount || students.length || 0 }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="label">课时</div>
                    <div class="value">{{ course.lessonHours || 0 }}</div>
                  </div>
                </div>
                
                <div class="info-actions">
                  <el-button type="primary" :icon="Edit" @click="openEditCourseDialog">编辑课程信息</el-button>
                  <el-button type="danger" plain :icon="Delete" @click="handleDeleteCourse">删除课程</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    
    <!-- Chapter Management Dialog -->
    <el-dialog v-model="chapterManageOpen" title="课程目录管理" width="600px">
      <div class="chapter-manage-toolbar">
        <el-button type="primary" :icon="FolderAdd" @click="handleAddChapter()">添加章</el-button>
        <el-button type="default" :icon="Refresh" @click="getChapterList">刷新</el-button>
      </div>
      
      <el-tree
        :data="treeData"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        :props="{ label: 'label', children: 'children' }"
        class="chapter-tree"
        draggable
        :allow-drop="allowDrop"
        :allow-drag="allowDrag"
        @node-drop="handleNodeDrop"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <span class="node-label">
              <el-icon v-if="data.type === 'chapter'" class="mr-1" style="vertical-align: middle;"><Folder /></el-icon>
              <el-icon v-else class="mr-1" style="vertical-align: middle; color: #409EFF"><Document /></el-icon>
              {{ node.label }}
            </span>
            <span class="node-actions">
              <template v-if="data.type === 'chapter'">
                  <el-button
                    type="primary"
                    link
                    size="small"
                    :icon="EditPen"
                    @click.stop="handleEditChapter(data.raw)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="success"
                    link
                    size="small"
                    :icon="DocumentAdd"
                    @click.stop="handleAddChapter(data.raw)"
                  >
                    添加子章
                  </el-button>
                  <el-button
                    type="warning"
                    link
                    size="small"
                    :icon="Document"
                    @click.stop="handleAddResource(data.raw)"
                  >
                    添加资源
                  </el-button>
                  <el-button
                    type="danger"
                    link
                    size="small"
                    :icon="DeleteFilled"
                    @click.stop="handleDeleteChapter(data.raw)"
                  >
                    删除
                  </el-button>
              </template>
              <template v-else>
                   <el-button
                    type="primary"
                    link
                    size="small"
                    :icon="EditPen"
                    @click.stop="handleEditResource(data.raw)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    link
                    size="small"
                    :icon="DeleteFilled"
                    @click.stop="handleDeleteResource(data.raw)"
                  >
                    删除
                  </el-button>
              </template>
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
      </el-form>
      <template #footer>
        <el-button @click="chapterEditOpen = false">取消</el-button>
        <el-button type="primary" @click="submitChapter">保存</el-button>
      </template>
    </el-dialog>

    <!-- Resource Edit Dialog -->
    <el-dialog v-model="resourceEditOpen" :title="resourceForm.resourceId ? '编辑资源' : '添加资源'" width="600px">
      <el-form :model="resourceForm" ref="resourceRef" label-width="80px" :rules="resourceRules">
        <el-form-item label="所属章节">
           <el-input :model-value="parentChapterName" disabled />
        </el-form-item>
        <el-form-item label="资源名称" prop="resourceName">
          <el-input v-model="resourceForm.resourceName" placeholder="请输入资源名称" />
        </el-form-item>
        <el-form-item label="资源文件" prop="url">
           <FileUpload
             v-model="resourceForm.url"
             :limit="1"
             :file-type="['mp4', 'webm', 'ogg', 'mov', 'avi', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif']"
             :is-show-tip="false"
           />
           <div class="el-upload__tip" style="line-height: 1.5; margin-top: 5px;">
             支持视频(mp4/webm等)、文档(pdf/doc/ppt等)和图片格式，大小不超过5MB
           </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resourceEditOpen = false">取消</el-button>
        <el-button type="primary" @click="submitResource">保存</el-button>
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
                  <el-button @click="searchStudent" :icon="Search" />
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

    <!-- Homework Publish/Edit Dialog -->
    <el-dialog v-model="homeworkOpen" :title="homeworkForm.id ? '编辑作业' : '发布作业'" width="1200px" append-to-body top="5vh">
      <div class="homework-publish-container">
        <div class="publish-left">
          <el-form :model="homeworkForm" ref="homeworkRef" label-position="top" :rules="homeworkRules">
            <el-form-item label="作业标题" prop="title">
              <el-input v-model="homeworkForm.title" placeholder="请输入作业标题" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="状态" prop="status">
                  <el-select v-model="homeworkForm.status" style="width: 100%">
                    <el-option label="草稿" value="0" />
                    <el-option label="已发布" value="1" />
                    <el-option label="已结束" value="2" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="开始时间" prop="startTime">
                  <el-date-picker
                    v-model="homeworkForm.startTime"
                    type="datetime"
                    placeholder="选择开始时间"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="截止时间" prop="deadline">
                  <el-date-picker
                    v-model="homeworkForm.deadline"
                    type="datetime"
                    placeholder="选择截止时间"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="作业内容" prop="content" class="editor-item">
              <Editor v-model="homeworkForm.content" :min-height="400" />
            </el-form-item>
          </el-form>
        </div>

        <div class="publish-right">
          <div class="preview-header">
            <span class="preview-label">内容预览</span>
            <el-tag type="info" size="small">实时</el-tag>
          </div>
          <div class="content-preview-box modern-scroll">
            <div class="preview-title">{{ homeworkForm.title || '作业标题' }}</div>
            <div class="preview-meta">
              <span class="meta-item"><el-icon><Calendar /></el-icon> {{ homeworkForm.startTime || '未设置开始时间' }}</span>
              <span class="meta-item deadline"><el-icon><Timer /></el-icon> {{ homeworkForm.deadline || '未设置截止时间' }}</span>
            </div>
            <div class="preview-body ql-editor" v-html="homeworkForm.content || '<p class=\'placeholder\'>暂无内容...</p>'"></div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer" style="text-align: center;">
          <el-button @click="homeworkOpen = false" size="large">取 消</el-button>
          <el-button type="primary" @click="submitHomework" style="width: 200px;" size="large">立即发布</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Homework Submission Dialog -->
    <el-dialog v-model="submitOpen" :title="submitForm.id ? '修改作业' : '提交作业'" width="800px" custom-class="submission-dialog" append-to-body>
      <!-- Homework Detail Section -->
      <div class="homework-detail-section">
          <div class="detail-title">
              <span class="label">作业题目：</span>
              {{ currentHomework?.title }}
              <el-tag v-if="currentHomework?.deadline" type="danger" size="small" style="margin-left: 10px;">
                  截止时间：{{ currentHomework.deadline }}
              </el-tag>
          </div>
          <div class="detail-content">
              <div class="label">作业要求：</div>
              <div class="content-box" v-html="currentHomework?.content"></div>
          </div>
      </div>

      <el-divider />

      <el-form :model="submitForm" ref="submitRef" label-width="80px" :rules="submitRules" class="submission-form">
        <el-form-item label="内容描述" prop="content">
          <el-input v-model="submitForm.content" type="textarea" :rows="6" placeholder="请输入作业内容或描述" />
        </el-form-item>
        <el-form-item label="附件/图片" prop="fileUrl">
          <FileUpload v-model="submitForm.fileUrl" :limit="5" :file-type="['doc', 'docx', 'pdf', 'zip', 'rar', 'jpg', 'png', 'jpeg', 'gif']" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="submitOpen = false">取消</el-button>
          <el-button type="primary" @click="submitSubmission">提交</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- View Submission Dialog (Score Card Style) -->
    <el-dialog v-model="viewSubmissionOpen" title="作业反馈单" width="650px" custom-class="submission-card-dialog" append-to-body>
      <div class="score-card">
          <!-- Header / Score -->
          <div class="score-header" :class="{'is-graded': viewSubmissionData.status === '2'}">
              <div class="score-main">
                  <span class="label">最终得分</span>
                  <div class="score-value">
                      {{ viewSubmissionData.status === '2' ? viewSubmissionData.grade : '-' }}
                      <span class="suffix" v-if="viewSubmissionData.status === '2'">分</span>
                  </div>
              </div>
              <div class="status-badge">
                  <el-tag :type="viewSubmissionData.status === '2' ? 'success' : 'primary'" effect="dark" size="large">
                      {{ viewSubmissionData.status === '2' ? '已批改' : '已提交' }}
                  </el-tag>
              </div>
          </div>

          <!-- Timeline Info -->
          <div class="submission-info">
              <div class="info-row">
                  <span class="label">提交时间：</span>
                  <span class="value">{{ viewSubmissionData.createTime }}</span>
              </div>
              <div class="info-row" v-if="viewSubmissionData.status === '2'">
                  <span class="label">批改时间：</span>
                  <span class="value">{{ viewSubmissionData.updateTime }}</span>
              </div>
          </div>

          <el-divider border-style="dashed" />

          <!-- Student Content -->
          <div class="content-section">
              <div class="section-title">我的作业</div>
              <div class="content-box">
                  <div class="text-content">{{ viewSubmissionData.content || '（无文本内容）' }}</div>

                  <!-- Merged Display for FileUrl (Images + Files) -->
                  <div v-if="viewSubmissionData.fileUrl" class="attachments-container">
                      <template v-for="(url, index) in viewSubmissionData.fileUrl.split(',')" :key="index">
                          <!-- Image Display -->
                          <div v-if="isImageUrl(url)" class="image-item" style="display: inline-block; margin-right: 10px; margin-bottom: 10px;">
                              <el-image
                                :src="url"
                                :preview-src-list="[url]"
                                style="width: 100px; height: 100px; border-radius: 4px;"
                                fit="cover"
                              />
                          </div>
                          <!-- File Download -->
                          <div v-else class="file-item" style="margin-bottom: 5px;">
                              <el-link :href="url" target="_blank" type="primary" :icon="Paperclip">
                                  {{ getFileName(url) }}
                              </el-link>
                          </div>
                      </template>
                  </div>
              </div>
          </div>

          <!-- Teacher Feedback -->
          <div class="content-section feedback-section" v-if="viewSubmissionData.status === '2'">
              <div class="section-title">教师评语</div>
              <div class="feedback-box">
                  {{ viewSubmissionData.gradeComment || '（暂无评语）' }}
              </div>
          </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="viewSubmissionOpen = false" round>关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Resource Preview Dialog -->
    <el-dialog
      v-model="resourcePlayOpen"
      :title="currentResource.resourceName"
      width="90%"
      top="2vh"
      destroy-on-close
      center
      append-to-body
      class="resource-preview-dialog"
    >
      <div class="preview-container" :class="{'is-video': isVideoUrl(currentResource.url), 'is-office': isOfficeUrl(currentResource.url) || isPdfUrl(currentResource.url)}">
         <div class="preview-scroller" ref="previewScrollerRef">
            <video
                v-if="isVideoUrl(currentResource.url)"
                :src="getFullUrl(currentResource.url)"
                controls
                autoplay
                style="width: 100%; max-height: 75vh; display: block;"
            >
                您的浏览器不支持视频播放。
            </video>
            <el-image
                v-else-if="isImageUrl(currentResource.url)"
                :src="getFullUrl(currentResource.url)"
                :preview-src-list="[getFullUrl(currentResource.url)]"
                fit="contain"
                style="max-height: 75vh; max-width: 100%;"
            />
            <iframe
                v-else-if="isTextUrl(currentResource.url)"
                :src="getFullUrl(currentResource.url)"
                style="width: 100%; height: 75vh; border: none; background: #fff;"
            ></iframe>
            <VueOfficePdf
                v-else-if="isPdfUrl(currentResource.url)"
                :src="getFullUrl(currentResource.url)"
                style="width: 100%;"
            />
            <VueOfficeDocx
                v-else-if="isWordUrl(currentResource.url)"
                :src="getFullUrl(currentResource.url)"
                style="width: 100%;"
            />
            <VueOfficeExcel
                v-else-if="isExcelUrl(currentResource.url)"
                :src="getFullUrl(currentResource.url)"
                style="height: 75vh; width: 100%;"
            />
            <VueOfficePptx
                v-else-if="isPptUrl(currentResource.url)"
                :src="getFullUrl(currentResource.url)"
                style="width: 100%;"
            />
            <div v-else class="resource-preview">
                <el-icon size="60"><Document /></el-icon>
                <p style="margin-top: 20px;">该资源格式暂不支持在线预览，请下载后查看</p>
            </div>
         </div>

         <!-- Pagination Controls -->
         <div class="preview-pagination" v-if="isOfficeUrl(currentResource.url) || isPdfUrl(currentResource.url)">
            <div class="pagination-wrapper">
              <el-tooltip content="上一页" placement="left" :show-after="500">
                <el-button type="primary" :icon="ArrowUp" @click="prevPage" circle size="large" />
              </el-tooltip>
              <el-tooltip content="下一页" placement="left" :show-after="500">
                <el-button type="primary" :icon="ArrowDown" @click="nextPage" circle size="large" />
              </el-tooltip>
            </div>
         </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="downloadResource(currentResource.url)" :icon="Download">
            下载资源
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getToken } from '@/utils/auth'
import { getCourse, getCourseNotices, addCourseNotice, delCourseNotice, inviteCourse, getCourseStudents, addCourseStudents, removeCourseStudent, addCourseStudentsFromClass, updateCourse, delCourse } from '@/api/edu/course'
import { getNestedList, addChapter, updateChapter, delChapter } from '@/api/system/chapter'
import { listResource, addResource, updateResource, delResource } from '@/api/edu/resource'
import { listHomework, addHomework, updateHomework, delHomework } from '@/api/edu/homework'
import { addSubmission, updateSubmission, listSubmission } from '@/api/edu/submission'
import { listClass } from '@/api/edu/class'
import { getUserBrief } from '@/api/edu/class'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoPlay, Share, User, Search, InfoFilled, Delete, Setting, Edit, FolderAdd, DocumentAdd, EditPen, DeleteFilled, View, Upload, Plus, VideoCamera, Calendar, Timer, Check, Warning, Document, Download, Folder, ArrowUp, ArrowDown, Bell, Monitor, Refresh, Paperclip, ArrowLeft } from '@element-plus/icons-vue'
import useUserStore from '@/store/modules/user'
import ImageUpload from '@/components/ImageUpload/index.vue'
import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'
import VueOfficeExcel from '@vue-office/excel'
import '@vue-office/excel/lib/index.css'
import VueOfficePdf from '@vue-office/pdf'
import VueOfficePptx from '@vue-office/pptx'
import FileUpload from '@/components/FileUpload/index.vue'
import Editor from '@/components/Editor/index.vue'
import defaultImg from '@/assets/images/profile.jpg'
import defaultAvatar from '@/assets/images/profile.jpg'

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const goBack = () => {
  if (window.history.state && window.history.state.back) {
    router.back()
  } else {
    router.push('/portal')
  }
}

const courseId = route.params.id
const course = ref({})
const chapters = ref([])
const treeData = ref([])
const homeworkList = ref([])
const mySubmissions = ref([])
const viewSubmissionOpen = ref(false)
const viewSubmissionData = ref({})
const notices = ref([])
const students = ref([])
const studentTotal = ref(0)
const studentQueryParams = ref({
  pageNum: 1,
  pageSize: 10
})
const activeMenu = ref('courseware')
const isTeacher = ref(false)
const noticeOpen = ref(false)
const noticeForm = ref({})
const noticeRef = ref(null)
const noticeRules = {
  noticeTitle: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  noticeContent: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

// Homework Management
const homeworkOpen = ref(false)
const homeworkForm = ref({})
const homeworkRef = ref(null)
const homeworkRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

// Submission Management
const currentHomework = ref({})
const submitOpen = ref(false)
const submitForm = ref({})
const submitRef = ref(null)
const submitRules = {
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

// Chapter Management
const chapterManageOpen = ref(false)
const resourcePlayOpen = ref(false)
const currentResource = ref({})
const chapterEditOpen = ref(false)
const chapterForm = ref({})
const chapterRef = ref(null)
const parentChapterName = ref('')
const chapterRules = {
  chapterName: [{ required: true, message: '请输入章节名称', trigger: 'blur' }]
}

const openChapterManage = () => {
  chapterManageOpen.value = true
  getChapterList()
}

// Resource Management
const resourceEditOpen = ref(false)
const resourceForm = ref({})
const resourceRef = ref(null)
const resourceRules = {
  resourceName: [{ required: true, message: '请输入资源名称', trigger: 'blur' }],
  url: [{ required: true, message: '请上传资源文件', trigger: 'blur' }]
}

const handleAddResource = (chapter) => {
    resourceForm.value = {
        courseId: courseId,
        chapterId: chapter.chapterId,
        sort: 999, // Default to end
        resourceName: '',
        url: ''
    }
    parentChapterName.value = chapter.chapterName
    resourceEditOpen.value = true
}

const handleEditResource = (resource) => {
    resourceForm.value = { ...resource }
    // Find parent chapter name
    const findChapter = (list) => {
        for(let c of list) {
            if(c.chapterId === resource.chapterId) return c
            if(c.children) {
                const found = findChapter(c.children)
                if(found) return found
            }
        }
        return null
    }
    const parent = findChapter(chapters.value)
    parentChapterName.value = parent ? parent.chapterName : '未知章节'
    resourceEditOpen.value = true
}

const handleDeleteResource = (resource) => {
    ElMessageBox.confirm('确认删除该资源吗？', '警告', { type: 'warning' }).then(() => {
        delResource(resource.resourceId).then(() => {
            ElMessage.success('删除成功')
            getChapterList()
        })
    })
}

const submitResource = () => {
    resourceRef.value.validate(valid => {
        if(valid) {
            // Auto-detect type from URL extension
            const ext = getExt(resourceForm.value.url)
            let type = 'file'
            if(['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext)) type = 'video'
            else if(['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) type = 'image'
            else if(['pdf'].includes(ext)) type = 'pdf'
            else if(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) type = 'office'
            else if(['txt'].includes(ext)) type = 'text'

            resourceForm.value.type = type

            if(resourceForm.value.resourceId) {
                updateResource(resourceForm.value).then(() => {
                    ElMessage.success('更新成功')
                    resourceEditOpen.value = false
                    getChapterList()
                })
            } else {
                addResource(resourceForm.value).then(() => {
                    ElMessage.success('添加成功')
                    resourceEditOpen.value = false
                    getChapterList()
                })
            }
        }
    })
}

const handleAddChapter = (parent) => {
  chapterForm.value = {
    courseId: courseId,
    parentId: parent ? parent.chapterId : 0,
    sort: 999, // Default to end
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
  ElMessageBox.confirm('确认删除该章节吗？如果有子章节或关联资源也会被影响！', '警告', {
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

const previewContainerRef = ref(null)
const previewScrollerRef = ref(null)

const prevPage = () => {
  const scroller = previewScrollerRef.value
  if (scroller) {
    // 优先滚动外层容器
    if (scroller.scrollHeight > scroller.clientHeight) {
      scroller.scrollTo({
        top: scroller.scrollTop - scroller.clientHeight,
        behavior: 'smooth'
      })
    } else {
      // 如果外层不能滚动（比如 Excel），尝试查找内部可滚动元素
      const innerScroller = findScrollableChild(scroller)
      if (innerScroller) {
        innerScroller.scrollTo({
          top: innerScroller.scrollTop - innerScroller.clientHeight,
          behavior: 'smooth'
        })
      }
    }
  }
}

const nextPage = () => {
  const scroller = previewScrollerRef.value
  if (scroller) {
    if (scroller.scrollHeight > scroller.clientHeight) {
      scroller.scrollTo({
        top: scroller.scrollTop + scroller.clientHeight,
        behavior: 'smooth'
      })
    } else {
      const innerScroller = findScrollableChild(scroller)
      if (innerScroller) {
        innerScroller.scrollTo({
          top: innerScroller.scrollTop + innerScroller.clientHeight,
          behavior: 'smooth'
        })
      }
    }
  }
}

const findScrollableChild = (el, depth = 0) => {
  if (!el || !el.children || depth > 3) return null
  for (let i = 0; i < el.children.length; i++) {
    const child = el.children[i]
    // 检查是否可滚动
    const style = window.getComputedStyle(child)
    const isScrollable = (style.overflowY === 'auto' || style.overflowY === 'scroll') && child.scrollHeight > child.clientHeight
    if (isScrollable) return child

    // 递归查找
    const found = findScrollableChild(child, depth + 1)
    if (found) return found
  }
  return null
}

const handlePlayResource = (resource) => {
  currentResource.value = resource
  resourcePlayOpen.value = true
}

const getExt = (url) => {
  if (!url) return ''
  let cleanUrl = url.split('?')[0].split('#')[0]
  return cleanUrl.substring(cleanUrl.lastIndexOf('.') + 1).toLowerCase()
}

const isVideoUrl = (url) => {
  const ext = getExt(url)
  return ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext)
}

const getResourceType = (url) => {
    if(isVideoUrl(url)) return '视频'
    if(isImageUrl(url)) return '图片'
    if(isPdfUrl(url)) return 'PDF'
    if(isOfficeUrl(url)) return '文档'
    return '文件'
}

const getFullUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('https')) return url
  return import.meta.env.VITE_APP_BASE_API + url
}

// 获取预览专用的 URL (支持内网穿透)
const getPreviewUrl = (url) => {
  let fullUrl = getFullUrl(url)

  // 如果配置了公网预览地址 (VITE_APP_PREVIEW_DOMAIN)，则替换
  const previewDomain = import.meta.env.VITE_APP_PREVIEW_DOMAIN
  if (previewDomain && fullUrl.startsWith('/')) {
     // 补全协议
     return previewDomain.replace(/\/$/, '') + fullUrl
  }
  if (previewDomain && fullUrl.startsWith('http')) {
     // 替换域名
     const urlObj = new URL(fullUrl, window.location.origin)
     // 这里假设 VITE_APP_BASE_API 是相对路径 '/dev-api'，在浏览器中会被解析为 http://localhost:xx/dev-api
     // 如果用了穿透，通常需要把 http://localhost:xx 换成 https://xxxx.ngrok.io
     // 但更简单的是：直接把相对路径拼接到公网域名后
     if (fullUrl.startsWith(import.meta.env.VITE_APP_BASE_API)) {
         return previewDomain.replace(/\/$/, '') + fullUrl
     }
  }

  // 降级策略：如果是本地开发环境，尝试提示用户
  if (isLocalEnv.value && !previewDomain) {
      console.warn('当前为本地环境，Office 预览需要配置 VITE_APP_PREVIEW_DOMAIN 为公网地址 (如 ngrok)')
  }

  // 默认补全当前域名
  if (fullUrl.startsWith('/')) {
      return window.location.origin + fullUrl
  }

  return fullUrl
}

const downloadResource = (url) => {
  window.open(getFullUrl(url), '_blank')
}

// Drag and Drop Logic
const allowDrag = (draggingNode) => {
  return true // All nodes can be dragged
}

const allowDrop = (draggingNode, dropNode, type) => {
  // Prevent dropping resource into resource
  if (dropNode.data.type === 'resource' && type === 'inner') {
    return false
  }
  // Prevent dropping chapter into resource
  if (dropNode.data.type === 'resource' && draggingNode.data.type === 'chapter') {
      return false
  }
  return true
}

const handleNodeDrop = (draggingNode, dropNode, dropType, ev) => {
  const draggedData = draggingNode.data
  const dropData = dropNode.data

  // Calculate new parent
  let newParentId = 0
  if (dropType === 'inner') {
    newParentId = dropData.raw.chapterId
  } else {
    // sibling
    if (dropData.type === 'chapter') {
        newParentId = dropData.raw.parentId || 0
    } else {
        newParentId = dropData.raw.chapterId // if sibling of resource, parent is resource's chapter
    }
  }

  // Get siblings to update sort order
  const siblings = (dropType === 'inner') ? (dropData.children || []) : dropNode.parent.childNodes.map(n => n.data)

  // Update sort for all siblings
  const promises = []
  siblings.forEach((node, index) => {
      let p;
      if (node.type === 'chapter') {
          p = updateChapter({
              chapterId: node.raw.chapterId,
              parentId: newParentId,
              sort: index
          })
      } else if (node.type === 'resource') {
          p = updateResource({
              resourceId: node.raw.resourceId,
              chapterId: newParentId, // Resource must belong to a chapter
              sort: index
          })
      }
      if(p) promises.push(p)
  })

  Promise.all(promises).then(() => {
      ElMessage.success('排序更新成功')
      getChapterList() // Refresh to ensure consistency
  }).catch(() => {
      ElMessage.error('排序更新失败，请刷新重试')
      getChapterList()
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

//Resource Logic
// --- 状态定义 ---
const resourceList = ref([]);
const resourceUploadOpen = ref(false);
const previewOpen = ref(false); // [新增] 预览弹窗开关
const previewUrl = ref("");     // [新增] 预览地址
const previewType = ref("");    // [新增] 预览类型
const previewTitle = ref("");   // [新增] 预览标题

// 表单只需这两个字段，resourceName 后台或提交前处理
const resourceForm = ref({
  courseId: null,
  filePath: '',
  resourceName: '', // 虽然弹窗不填，但提交需要
  status: '0'
});

// 只需要校验文件是否存在
const resourceRules = {
  filePath: [{ required: true, message: "请上传文件", trigger: "change" }]
};

// --- 方法定义 ---

// --- [辅助] 获取文件后缀 ---
function getFileExt(path) {
  if (!path) return '';
  const parts = path.split('.');
  return parts[parts.length - 1].toUpperCase();
}

// 1. 获取资源列表 (修改：学生过滤隐藏资源)
function getResourceList() {
  listResource({ courseId: course.value.courseId }).then(response => {
    let rows = response.rows;
    // 如果不是老师，只显示 status 为 '0' 的
    if (!isTeacher.value) {
      rows = rows.filter(item => item.status === '0');
    }
    resourceList.value = rows;
  });
}

// 2. 打开上传弹窗 (重置)
function openResourceUpload() {
  resourceForm.value = {
    courseId: course.value.courseId,
    resourceName: '',
    filePath: '',
    status: '0'
  };
  resourceUploadOpen.value = true;
}

// [新增] 切换状态
function handleStatusChange(row) {
  const text = row.status === '0' ? '发布' : '隐藏';
  // 乐观更新：UI已经变了，发送请求。如果失败再变回来
  updateResource({ resourceId: row.resourceId, status: row.status }).then(() => {
    ElMessage.success(`已${text}该资源`);
  }).catch(() => {
    // 失败回滚
    row.status = row.status === '0' ? '1' : '0';
  });
}

// [新增] 预览逻辑
function handlePreview(row) {
  const ext = getFileExt(row.filePath).toLowerCase();
  // 拼接完整URL (假设你的 RuoYiConfig.profile 映射了 /dev-api/profile)
  // 注意：这里需要根据你的实际环境地址拼接
  const baseUrl = import.meta.env.VITE_APP_BASE_API;
  const fullUrl = baseUrl + row.filePath;

  previewTitle.value = row.resourceName;
  previewUrl.value = fullUrl;

  if (['mp4', 'webm', 'ogg'].includes(ext)) {
    previewType.value = 'video';
  } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
    previewType.value = 'image';
  } else if (['pdf'].includes(ext)) {
    previewType.value = 'pdf';
  } else {
    // Word/PPT/Excel 等浏览器无法直接预览
    previewType.value = 'other';
  }

  previewOpen.value = true;
}

// 3. 文件上传后的回调（为了自动回填文件名，提升体验）
// 注意：这取决于你的 FileUpload 组件怎么写的，通常它v-model绑定的是路径
// 如果组件不支持抛出文件名，这一步可以省略，让老师手填
function handleFileChange(val) {
  // 简单的自动填充逻辑：如果名称为空，尝试从路径截取文件名（仅作辅助）
  if (!resourceForm.value.resourceName && val) {
    const fileName = val.split('/').pop();
    // 去掉 UUID 前缀 (若依上传通常会加 uuid_filename)
    resourceForm.value.resourceName = fileName.substring(fileName.indexOf('_') + 1) || fileName;
  }
}

// 4. 提交保存
function submitUploadResource() {
  proxy.$refs["uploadResourceRef"].validate(valid => {
    if (valid) {
      // 1. 获取完整路径中的文件名
      // 例如路径: /profile/upload/2026/01/09/测试文件A_202601091230.txt
      const path = resourceForm.value.filePath;
      const fileNameWithTimestamp = path.split('/').pop(); // 拿到 "测试文件A_202601091230.txt"

      // 2. 提取文件后缀 (例如 .txt)
      const lastDotIndex = fileNameWithTimestamp.lastIndexOf('.');
      let nameBody = fileNameWithTimestamp;
      if (lastDotIndex > -1) {
        nameBody = fileNameWithTimestamp.substring(0, lastDotIndex); // 拿到 "测试文件A_202601091230"
      }

      // 3. 【核心修改】处理下划线逻辑
      // 现在的规则是：名字_时间戳。我们要去掉最后一个下划线及其后面的内容
      const lastUnderscoreIndex = nameBody.lastIndexOf('_');

      if (lastUnderscoreIndex > -1) {
        // 截取从 0 到 最后一个下划线 的部分
        resourceForm.value.resourceName = nameBody.substring(0, lastUnderscoreIndex);
      } else {
        // 如果没有下划线，就直接用文件名
        resourceForm.value.resourceName = nameBody;
      }

      // 发送请求
      addResource(resourceForm.value).then(() => {
        ElMessage.success("上传成功");
        resourceUploadOpen.value = false;
        getResourceList();
      });
    }
  });
}

// // 5. 下载文件
// function handleDownload(row) {
//   // 调用后端下载接口，或者直接访问静态资源
//   // 建议使用若依通用的 download 方法
//   proxy.$download.resource(row.filePath);
//   // 或者如果你的后端实现了计数接口：
//   // downloadResource(row.resourceId).then(res => { blob保存... })
// }

// 5. 下载文件 (已修改为：后端计数 + 流式下载)
function handleDownload(row) {
  // 1. 开启 Loading 遮罩，防止用户重复点击
  proxy.$modal.loading("正在下载资源，请稍候...");

  // 2. 调用后端接口 (传入 resourceId 而不是 filePath)
  downloadResource(row.resourceId).then(res => {
    // 3. 处理文件流 (Blob)
    const blob = new Blob([res]);

    // 4. 决定下载时的文件名
    // 优先使用原始文件名 (originName)，如果没有则使用资源标题 (resourceName)
    const fileName = row.originName || row.resourceName || "download_file";

    // 5. 创建临时的 <a> 标签触发浏览器下载
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName; // 设置文件名
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click(); // 模拟点击

    // 6. 清理内存和 DOM
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);

    // 7. 关闭 Loading 并提示成功
    proxy.$modal.closeLoading();
    proxy.$modal.msgSuccess("下载已开始");

    //(可选) 刷新列表，这样你能立刻看到下载次数 +1
    getResourceList();

  }).catch((err) => {
    // 处理错误
    proxy.$modal.closeLoading();
    console.error("下载出错:", err);
    proxy.$modal.msgError("下载失败，请检查文件是否存在");
  });
}

// 6. 删除文件
function handleDeleteResource(row) {
  ElMessageBox.confirm('确认删除该资源吗?', '提示', {
    type: 'warning'
  }).then(() => {
    delResource(row.resourceId).then(() => {
      ElMessage.success("删除成功");
      getResourceList();
    });
  });
}



// ==================== 实验模块 ====================
const experimentList = ref([])
const experimentOpen = ref(false)
const experimentForm = ref({})
const experimentRef = ref(null)
const experimentRules = {
  experimentName: [{ required: true, message: '请输入实验名称', trigger: 'blur' }]
}

// 获取实验列表
function getExperimentList() {
  listExperiment({ courseId: course.value.courseId }).then(res => {
    let rows = res.rows || []
    // 学生只能看到已发布的实验
    if (!isTeacher.value) {
      rows = rows.filter(item => item.status === '1')
    }
    experimentList.value = rows
  })
}

// 打开实验弹窗
function openExperimentDialog(exp) {
  if (exp) {
    experimentForm.value = { ...exp }
  } else {
    experimentForm.value = {
      courseId: course.value.courseId,
      experimentName: '',
      description: '',
      testInput: '',
      testOutput: '',
      status: '0',
      deadline: null
    }
  }
  experimentOpen.value = true
}

// 保存实验
function submitExperiment() {
  experimentRef.value.validate(valid => {
    if (valid) {
      if (experimentForm.value.experimentId) {
        updateExperiment(experimentForm.value).then(() => {
          ElMessage.success('更新成功')
          experimentOpen.value = false
          getExperimentList()
        })
      } else {
        addExperiment(experimentForm.value).then(() => {
          ElMessage.success('创建成功')
          experimentOpen.value = false
          getExperimentList()
        })
      }
    }
  })
}

// 删除实验
function handleDeleteExperiment(exp) {
  ElMessageBox.confirm('确认删除该实验吗?', '提示', { type: 'warning' }).then(() => {
    delExperiment(exp.experimentId).then(() => {
      ElMessage.success('删除成功')
      getExperimentList()
    })
  })
}

// 跳转到实验编码页面
function goToExperimentCoding(experimentId) {
  router.push(`/edu/experiment/coding/${experimentId}`)
}

// ==================== 教师查看提交记录 ====================
const submissionDialogOpen = ref(false)
const submissionList = ref([])
const currentExperimentName = ref('')

function viewExperimentSubmissions(exp) {
  currentExperimentName.value = exp.experimentName
  getAllSubmissions(exp.experimentId).then(res => {
    submissionList.value = res.data || []
    submissionDialogOpen.value = true
  })
}

// 评测结果翻译
const resultMap = {
  'Accepted': '通过',
  'Wrong Answer': '答案错误',
  'Compilation Error': '编译错误',
  'Runtime Error': '运行时错误',
  'Time Limit Exceeded': '超时',
  'Memory Limit Exceeded': '内存超限'
}

function translateResult(result) {
  return resultMap[result] || result
}

function getSubmissionTagType(result) {
  if (result === 'Accepted') return 'success'
  if (result === 'Wrong Answer' || result?.includes('Error')) return 'danger'
  if (result === 'Time Limit Exceeded') return 'warning'
  return 'info'
}

// ==================== 实验模块结束 ====================
// ==================== 考试模块 START ====================
// 引入 API (假设你已经创建了对应的 api js文件)
import {
  listExam,
  getExam,
  addExam,
  updateExam,
  delExam,
  publishExam,
  listQuestion,
  startExam,
  submitExamPaper,
  recordCheat,
  listExamRecord, getRecordDetail, gradeExam
} from "@/api/edu/exam";
const resourceEditOpen = ref(false); // 如果没有，请补上
const examList = ref([]);
const examDialogOpen = ref(false);
const bankDialogOpen = ref(false);
const examForm = ref({
  questionList: []
});
const examRules = {
  title: [{ required: true, message: "请输入考试名称", trigger: "blur" }],
  endTime: [{ required: true, message: "结束时间不能为空", trigger: "blur" }]
};
// 控制按钮的加载状态，防止重复点击
const buttonLoading = ref(false);

// 题库相关
const bankQuestionList = ref([]);
const selectedBankQuestions = ref([]);
const qSearchTags = ref("");

// 阅卷相关变量
const markingOpen = ref(false);
const markingList = ref([]);
const currentExamId = ref(null);
const markingLoading = ref(false);

// 阅卷详情弹窗控制
const gradingDrawerOpen = ref(false);
const currentRecordId = ref(null);
const studentAnswerList = ref([]);
const teacherComment = ref("");

// 打开打分界面
function handleGrade(row) {
  currentRecordId.value = row.id;
  teacherComment.value = row.teacherComment || "";

  // 加载答题详情
  getRecordDetail(row.id).then(res => {
    studentAnswerList.value = res.data;
    gradingDrawerOpen.value = true;
  });
}

// 提交分数
function submitGrade() {
  // 【关键修改】不再过滤 params.questionType，也不需要 params
  // 直接把所有题目的 id 和 score 传回去，让后端重算总分
  const allAnswers = studentAnswerList.value.map(item => ({
      id: item.id,
      score: item.score
  }));

  const data = {
    recordId: currentRecordId.value,
    answers: allAnswers,
    teacherComment: teacherComment.value
  };

  gradeExam(data).then(() => {
    ElMessage.success("阅卷完成，成绩已发布！");
    gradingDrawerOpen.value = false;
    loadMarkingList(); // 刷新列表
  });
}

// ✅ 这就是你报错缺少的函数
function handleMarkExam(exam) {
  currentExamId.value = exam.id;
  markingOpen.value = true;
  loadMarkingList();
}

// 加载提交记录
function loadMarkingList() {
  markingLoading.value = true;
  listExamRecord({ examId: currentExamId.value }).then(res => {
    markingList.value = res.rows;
    markingLoading.value = false;
  });
}

// 格式化状态
function getRecordStatus(status) {
  const map = { '0': '未开始', '1': '进行中', '2': '已提交', '3': '已阅卷' };
  return map[status] || '未知';
}

// 监听菜单切换
watch(activeMenu, (val) => {
  if (val === 'exam') {
    getExamList();
  }
});

// 获取考试列表
function getExamList() {
  listExam({ courseId: courseId }).then(res => {
    examList.value = res.rows || [];
  });
}

// 打开新建考试
function openExamDialog() {
  examForm.value = {
    courseId: courseId,
    title: "",
    duration: undefined, // undefined 代表空，即不限时
    description: "",
    questionList: [] // 存放选中的题目
  };
  examDialogOpen.value = true;
}

// 编辑考试
function handleEditExam(exam) {
  console.log("1. 点击了编辑按钮，考试ID:", exam.id);

  // 先重置表单，防止残留
  examForm.value = { questionList: [] };

  getExam(exam.id).then(res => {
    console.log("2. 后端返回详情:", res);
    examForm.value = res.data;

    // 确保题目列表是数组，防止报错
    if (!examForm.value.questionList) {
      examForm.value.questionList = [];
    }

    // 打开弹窗
    examDialogOpen.value = true;
    console.log("3. 弹窗变量已设为 true");
  }).catch(err => {
    console.error("获取详情失败:", err);
    ElMessage.error("无法获取试卷详情，请检查后端");
  });
}

// 打开题库选择
function openQuestionBankDialog() {
  bankDialogOpen.value = true;
  searchQuestions();
}

// 搜索题库
function searchQuestions() {
  listQuestion({ tags: qSearchTags.value, teacherId: userStore.id }).then(res => {
    bankQuestionList.value = res.rows || [];
  });
}

// 题库勾选
function handleQSelection(selection) {
  selectedBankQuestions.value = selection;
}

// 确认添加题目
function confirmAddQuestions() {
  // 过滤掉已经存在的题目
  const currentIds = examForm.value.questionList.map(q => q.id);
  const newQuestions = selectedBankQuestions.value
    .filter(q => !currentIds.includes(q.id))
    .map(q => ({
      ...q,
      questionId: q.id, // 关联ID
      score: 5 // 默认分值
    }));

  examForm.value.questionList.push(...newQuestions);
  bankDialogOpen.value = false;
  selectedBankQuestions.value = [];
}

// 移除题目
function removeQuestion(index) {
  examForm.value.questionList.splice(index, 1);
}

// 计算总分
function calculateTotalScore() {
  return examForm.value.questionList.reduce((sum, q) => sum + (q.score || 0), 0);
}

// 提交考试保存
function submitExam() {
  proxy.$refs["examRef"].validate(valid => {
    if (valid) {
      // 校验题目
      if (!examForm.value.questionList || examForm.value.questionList.length === 0) {
        ElMessage.warning("请至少添加一道题目");
        return;
      }

      // 1. 开启 Loading，锁住按钮
      buttonLoading.value = true;

      // 定义请求 Promise
      let requestPromise;

      if (examForm.value.id) {
        requestPromise = updateExam(examForm.value);
      } else {
        requestPromise = addExam(examForm.value);
      }

      // 2. 发送请求
      requestPromise.then(() => {
        ElMessage.success(examForm.value.id ? "修改成功" : "创建成功");
        examDialogOpen.value = false;
        getExamList(); // 刷新列表
      }).catch(() => {
        // 失败时不需做特殊处理，loading 会在 finally 关闭
      }).finally(() => {
        // 3. 无论成功还是失败，都关闭 Loading，解锁按钮
        buttonLoading.value = false;
      });
    }
  });
}

// 教师发布考试
function handlePublishExam(exam) {
  ElMessageBox.confirm('发布后学生将可见，且题目不可再增删，确认发布？', '提示').then(() => {
    publishExam(exam.id).then(() => {
      ElMessage.success("发布成功");
      getExamList();
    });
  });
}

// 学生开始考试 (跳转到独立的答题页面)
function handleStartExam(exam) {
  // 校验时间等逻辑...
  router.push(`/edu/exam/taking/${exam.id}`);
}

// 辅助函数
function getQuestionType(type) {
  const map = { '1': '单选', '2': '多选', '3': '判断', '4': '简答' };
  return map[type] || '未知';
}

function getExamStatusText(exam) {
  if (exam.status === '0') return '未发布';
  const now = new Date();
  if (exam.endTime && new Date(exam.endTime) < now) return '已截止';
  return '进行中';
}

function getExamStatusTag(exam) {
  if (exam.status === '0') return 'info';
  if (getExamStatusText(exam) === '已截止') return 'danger';
  return 'success';
}

function canStartExam(exam) {
  if (exam.status !== '1') return false;
  // 这里还可以加很多判断：是否已交卷、是否过期等
  return true;
}

function getStudentExamBtnText(exam) {
    if (exam.status !== '1') return '未开始';
    // 实际逻辑应该判断 exam_record 的状态
    return '开始答题';
}

// 删除考试按钮操作
function handleDeleteExam(row) {
  const examIds = row.id || ids.value; // 支持单个删除或批量删除
  ElMessageBox.confirm('是否确认删除考试编号为"' + examIds + '"的数据项？', "系统提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(function() {
    return delExam(examIds);
  }).then(() => {
    getExamList(); // 刷新列表
    ElMessage.success("删除成功");
  }).catch(() => {});
}

// ==================== 考试模块 END ====================

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
    { key: 'announcement', label: '公告', icon: Bell },
    { key: 'courseware', label: '课件', icon: Document },
    { key: 'homework', label: '作业', icon: EditPen },
    { key: 'exam', label: '考试', icon: Monitor }
  ]
  if (isTeacher.value) {
    items.push({ key: 'members', label: '人员管理', icon: User })
    items.push({ key: 'settings', label: '课程设置', icon: Setting })
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
    loadHomeworks()
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
    buildTreeData()
  })
}

const buildTreeData = () => {
    // Convert chapters + resources to unified tree
    const process = (list) => {
        return list.map(c => {
            const node = {
                id: 'c_' + c.chapterId,
                label: c.chapterName,
                type: 'chapter',
                raw: c,
                children: []
            }

            // Add sub-chapters
            if (c.children && c.children.length > 0) {
                node.children.push(...process(c.children))
            }

            // Add resources
            if (c.resources && c.resources.length > 0) {
                const resourceNodes = c.resources.map(v => ({
                    id: 'r_' + v.resourceId,
                    label: v.resourceName,
                    type: 'resource',
                    raw: v
                }))
                node.children.push(...resourceNodes)
            }

            return node
        })
    }
    treeData.value = process(chapters.value)
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
  getCourseStudents(courseId, studentQueryParams.value).then(res => {
    students.value = res.rows || []
    studentTotal.value = res.total || 0
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

const loadHomeworks = () => {
  listHomework({ courseId: courseId }).then(res => {
    homeworkList.value = res.rows || []
    if (!isTeacher.value) {
        loadMySubmissions()
    }
  })
}

const loadMySubmissions = () => {
    listSubmission({}).then(res => {
        mySubmissions.value = res.rows || []
    })
}

const isSubmitted = (hw) => {
    return mySubmissions.value.some(s => s.homeworkId === hw.id)
}

const getSubmission = (hw) => {
    return mySubmissions.value.find(s => s.homeworkId === hw.id)
}

const getSubmissionStatusText = (hw) => {
    const sub = getSubmission(hw)
    if (!sub) return '未提交'
    if (sub.status === '2') return '已批改'
    return '已提交'
}

const getSubmissionStatusType = (hw) => {
    const sub = getSubmission(hw)
    if (!sub) return 'info'
    if (sub.status === '2') return 'success'
    return 'primary'
}

const getSubmissionGrade = (hw) => {
    const sub = getSubmission(hw)
    if (sub && sub.status === '2') return sub.grade
    return null
}

const openHomeworkDialog = () => {
  homeworkForm.value = {
    courseId: courseId,
    status: '0',
    startTime: null,
    deadline: null
  }
  homeworkOpen.value = true
}

const handleEditHomework = (hw) => {
  homeworkForm.value = { ...hw }
  homeworkOpen.value = true
}

const getHomeworkStatusText = (status) => {
  if (status === '0') return '草稿'
  if (status === '1') return '已发布'
  if (status === '2') return '已结束'
  return '未知'
}

const getHomeworkStatusType = (status) => {
  if (status === '0') return 'info'
  if (status === '1') return 'success'
  if (status === '2') return 'danger'
  return 'info'
}

const canSubmit = (hw) => {
    if (hw.status !== '1') return false
    const now = new Date()
    if (hw.startTime && new Date(hw.startTime) > now) return false
    if (hw.deadline && new Date(hw.deadline) < now) return false
    return true
}

const getSubmitTooltip = (hw) => {
    if (hw.status === '0') return '作业未发布'
    if (hw.status === '2') return '作业已结束'
    const now = new Date()
    if (hw.startTime && new Date(hw.startTime) > now) return '作业尚未开始'
    if (hw.deadline && new Date(hw.deadline) < now) return '作业已截止'
    return ''
}

const handleDelHomework = (hw) => {
    ElMessageBox.confirm('确认删除该作业吗？', '提示', { type: 'warning' }).then(() => {
        delHomework(hw.id).then(() => {
            ElMessage.success('删除成功')
            loadHomeworks()
        })
    })
}

const submitHomework = () => {
    homeworkRef.value.validate(valid => {
        if(valid) {
            // Clean up empty date strings
            if (homeworkForm.value.startTime === '') {
                homeworkForm.value.startTime = null;
            }
            if (homeworkForm.value.deadline === '') {
                homeworkForm.value.deadline = null;
            }

            if (homeworkForm.value.id) {
                updateHomework(homeworkForm.value).then(() => {
                    ElMessage.success('更新成功')
                    homeworkOpen.value = false
                    loadHomeworks()
                })
            } else {
                addHomework(homeworkForm.value).then(() => {
                    ElMessage.success('发布成功')
                    homeworkOpen.value = false
                    loadHomeworks()
                })
            }
        }
    })
}

const handleViewSubmissions = (hw) => {
    router.push('/edu/homework/submission/' + hw.id)
}

const openViewDialog = (hw) => {
    const sub = getSubmission(hw)
    if (sub) {
        viewSubmissionData.value = sub
        viewSubmissionOpen.value = true
    }
}

const openSubmitDialog = (hw) => {
    currentHomework.value = hw
    const sub = getSubmission(hw)
    if (sub) {
        // Merge imageUrl into fileUrl for display and editing
        let combinedUrl = sub.fileUrl || ''
        if (sub.imageUrl) {
            combinedUrl = combinedUrl ? (combinedUrl + ',' + sub.imageUrl) : sub.imageUrl
        }

        submitForm.value = {
            id: sub.id,
            homeworkId: hw.id,
            content: sub.content,
            fileUrl: combinedUrl,
            imageUrl: '' // Clear imageUrl as we merged it
        }
    } else {
        submitForm.value = {
            homeworkId: hw.id,
            content: '',
            fileUrl: '',
            imageUrl: ''
        }
    }
    submitOpen.value = true
}

const submitSubmission = () => {
    submitRef.value.validate(valid => {
        if(valid) {
            if (submitForm.value.id) {
                updateSubmission(submitForm.value).then(() => {
                    ElMessage.success('更新成功')
                    submitOpen.value = false
                    loadMySubmissions()
                })
            } else {
                addSubmission(submitForm.value).then(() => {
                    ElMessage.success('提交成功')
                    submitOpen.value = false
                    loadMySubmissions()
                })
            }
        }
    })
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

const isImageUrl = (url) => {
    const ext = getExt(url)
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)
}

const isPdfUrl = (url) => {
    const ext = getExt(url)
    return ['pdf'].includes(ext)
}

const isTextUrl = (url) => {
    const ext = getExt(url)
    return ['txt'].includes(ext)
}

const isOfficeUrl = (url) => {
    const ext = getExt(url)
    return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)
}

const isWordUrl = (url) => {
    const ext = getExt(url)
    return ['doc', 'docx'].includes(ext)
}

const isExcelUrl = (url) => {
    const ext = getExt(url)
    return ['xls', 'xlsx'].includes(ext)
}

const isPptUrl = (url) => {
    const ext = getExt(url)
    return ['ppt', 'pptx'].includes(ext)
}

const isLocalEnv = computed(() => {
  const hostname = window.location.hostname
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')
})

const getFileName = (url) => {
    if (!url) return '附件'
    return url.substring(url.lastIndexOf('/') + 1)
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
    
    .back-area {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      color: #606266;
      font-size: 14px;
      transition: color 0.3s;

      &:hover {
        color: #409EFF;
      }
    }

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

.homework-list {
  display: flex;
  flex-direction: column;
  gap: 15px;

  .homework-item {
      background: #fff;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: stretch;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      overflow: hidden;
      position: relative;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        border-color: #dcdfe6;
      }

      &.status-0 .homework-left-border { background: #909399; } /* Draft */
      &.status-1 .homework-left-border { background: #409EFF; } /* Published */
      &.status-2 .homework-left-border { background: #F56C6C; } /* Closed */

      .homework-left-border {
          width: 4px;
          background: #dcdfe6;
      }

      .homework-main {
        flex: 1;
        padding: 20px 0 20px 20px;
        margin-right: 20px;
        display: flex;
        flex-direction: column;

        .homework-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;

            .homework-title {
              font-size: 18px;
              font-weight: 600;
              color: #303133;
              margin: 0;
            }
        }

        .homework-meta {
            display: flex;
            gap: 16px;
            margin-bottom: 16px;
            flex-wrap: wrap;

            .meta-item {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 13px;
                color: #606266;
                background: #f4f4f5;
                padding: 4px 10px;
                border-radius: 4px;

                &.deadline {
                    color: #e6a23c;
                    background: #fdf6ec;
                }
            }
        }

        .homework-content-preview {
          color: #606266;
          font-size: 14px;
          line-height: 1.6;
          max-height: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
      }

      .homework-right {
         padding: 20px;
         display: flex;
         flex-direction: column;
         justify-content: center;
         align-items: flex-end;
         border-left: 1px solid #f2f6fc;
         min-width: 200px;
         background: #fafafa;

         .action-buttons {
             display: flex;
             gap: 8px;
         }

         .student-status-area {
             margin-bottom: 15px;
             text-align: right;

             .status-indicator {
                 display: flex;
                 align-items: center;
                 justify-content: flex-end;
                 gap: 8px;

                 &.submitted {
                     .status-icon {
                         color: #67c23a;
                         font-size: 24px;
                     }
                     .status-text {
                         text-align: left;
                         .main-text {
                             font-size: 14px;
                             font-weight: bold;
                             color: #67c23a;
                         }
                         .grade-badge {
                             font-size: 12px;
                             color: #f56c6c;
                             font-weight: bold;
                             }
                     }
                 }

                 &.not-submitted {
                     .status-dot {
                         width: 8px;
                         height: 8px;
                         background: #909399;
                         border-radius: 50%;
                     }
                     .main-text {
                         color: #909399;
                         font-size: 14px;
                     }
                 }
             }
         }
      }
    }

    /* View Submission Dialog Styles */
    .score-card {
        padding: 0 10px;

        .score-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f0f2f5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;

            &.is-graded {
                background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);

                .score-value { color: #67c23a; }
            }

            .score-main {
                display: flex;
                flex-direction: column;

                .label {
                    font-size: 13px;
                    color: #909399;
                    margin-bottom: 4px;
                }

                .score-value {
                    font-size: 36px;
                    font-weight: bold;
                    color: #303133;
                    line-height: 1;

                    .suffix {
                        font-size: 16px;
                        font-weight: normal;
                        color: #606266;
                        margin-left: 4px;
                    }
                }
            }
        }

        .submission-info {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 15px;

            .info-row {
                font-size: 13px;
                color: #606266;

                .label { color: #909399; }
            }
        }

        .content-section {
            margin-top: 20px;

            .section-title {
                font-size: 15px;
                font-weight: bold;
                color: #303133;
                margin-bottom: 10px;
                border-left: 3px solid #409EFF;
                padding-left: 10px;
            }

            .content-box {
                background: #f9fafc;
                padding: 15px;
                border-radius: 4px;
                border: 1px solid #e4e7ed;

                .text-content {
                    white-space: pre-wrap;
                    color: #606266;
                    font-size: 14px;
                    line-height: 1.6;
                    margin-bottom: 10px;
                }
            }

            &.feedback-section {
                .section-title { border-color: #67c23a; }

                .feedback-box {
                    background: #f0f9eb;
                    border-color: #e1f3d8;
                    padding: 15px;
                    border-radius: 4px;
                    color: #67c23a;
                    font-size: 14px;
                }
            }
        }
  }
}

// Homework Publish Split Layout
.homework-publish-container {
  display: flex;
  height: 600px; /* Fixed height for split view */
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  margin: -20px -20px 0; /* Negate dialog padding */

  .publish-left {
    flex: 1;
    width: 50%;
    min-width: 0; /* Prevent flex item from expanding due to content */
    padding: 20px;
    overflow-y: auto;

    .editor-item {
      margin-bottom: 0;
      :deep(.el-form-item__content) {
        display: block; /* Ensure editor takes full width */
      }
    }
  }

  .publish-right {
    flex: 1;
    width: 50%;
    min-width: 0; /* Prevent flex item from expanding due to content */
    background: #fcfcfc;
    border-left: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;

    .preview-header {
      padding: 10px 20px;
      border-bottom: 1px solid #ebeef5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fff;

      .preview-label {
        font-weight: bold;
        color: #303133;
        font-size: 14px;
      }
    }

    .content-preview-box {
      flex: 1;
      padding: 30px;
      overflow-y: auto;

      .preview-title {
        font-size: 22px;
        font-weight: bold;
        color: #333;
        margin-bottom: 10px;
        text-align: center;
      }

      .preview-meta {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-bottom: 30px;
        color: #909399;
        font-size: 13px;
        border-bottom: 1px dashed #ebeef5;
        padding-bottom: 15px;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 5px;

          &.deadline { color: #e6a23c; }
        }
      }

      .preview-body {
        font-size: 15px;
        line-height: 1.8;
        color: #333;

        /* Mimic Quill editor output styles */
        p { margin-bottom: 1em; }
        :deep(img) {
          max-width: 80%;
          max-height: 400px;
          height: auto;
          display: block;
          margin: 10px auto;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .placeholder {
          color: #ccc;
          text-align: center;
          margin-top: 50px;
          font-style: italic;
        }
      }
    }
  }
}

/* Custom Scrollbar for preview */
.modern-scroll {
  &::-webkit-scrollbar { width: 6px; height: 6px; }
  &::-webkit-scrollbar-thumb { background: #dcdfe6; border-radius: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
}

.preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #f5f7fa;
  border-radius: 8px;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.02);
  overflow: hidden;
  position: relative;

  &.is-video {
    background: #000;
  }

  &.is-office {
    display: block;
    height: 75vh;
    background: #fff;
    box-shadow: 0 4px 16px rgba(0,0,0,0.05);
  }

  .preview-scroller {
    width: 100%;
    height: 100%;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: #dcdfe6;
      border-radius: 3px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  /* Center content in scroller for video/default */
  &:not(.is-office) .preview-scroller {
      display: flex;
      align-items: center;
      justify-content: center;
  }

  .preview-pagination {
    position: absolute;
    bottom: 40px;
    right: 40px;
    z-index: 100;

    .pagination-wrapper {
      display: flex;
      flex-direction: column;
      gap: 15px;

      .el-button {
        margin: 0;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border: none;
        background-color: rgba(64, 158, 255, 0.9);
        font-size: 20px;
        width: 48px;
        height: 48px;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

        &:hover {
          background-color: rgba(64, 158, 255, 1);
          transform: scale(1.1);
          box-shadow: 0 8px 20px rgba(64, 158, 255, 0.3);
        }

        &:active {
          transform: scale(0.95);
        }
      }
    }
  }
}

.resource-preview {
  color: #909399;
  padding: 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 实验列表样式 */
.experiment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.experiment-card {
  .exp-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .exp-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .exp-desc {
    font-size: 14px;
    color: #666;
    margin-bottom: 15px;
    line-height: 1.6;
    max-height: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .exp-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #eee;
    padding-top: 10px;
  }

  .exp-time {
    font-size: 12px;
    color: #999;
  }

  .exp-actions {
    display: flex;
    gap: 10px;
  }
}



.exam-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.exam-card {
  border-radius: 8px;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.exam-title {
  font-size: 18px;
  font-weight: bold;
}

.exam-info {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 13px;
  margin-bottom: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.exam-desc {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  color: #666;
  font-size: 13px;
  margin-bottom: 10px;
}

.question-selector {
  border: 1px solid #eee;
  padding: 10px;
  border-radius: 4px;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
</style>