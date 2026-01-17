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
        
        <!-- Resources -->
        <div v-else-if="activeMenu === 'resources'" class="content-wrapper">
  <div class="content-header">
    <h2>教学资源</h2>
    <el-button v-if="isTeacher" type="primary" size="small" icon="Upload" @click="openResourceUpload">上传资源</el-button>
  </div>

  <el-table 
    v-if="resourceList && resourceList.length > 0"
    :data="resourceList" 
    style="width: 100%"
    :header-cell-style="{background:'#f8f9fa', color:'#606266'}"
  >
    <el-table-column label="资源名称" min-width="280">
      <template #default="scope">
        <div style="display: flex; align-items: center; gap: 8px;">
          <el-icon :size="20" color="#409EFF" v-if="scope.row.category === 'video'"><VideoPlay /></el-icon>
          <el-icon :size="20" color="#67C23A" v-else-if="scope.row.category === 'image'"><Picture /></el-icon>
          <el-icon :size="20" color="#E6A23C" v-else-if="scope.row.category === 'doc'"><Document /></el-icon>
          <el-icon :size="20" color="#909399" v-else><Files /></el-icon>
          
          <el-tag size="small" type="info" effect="plain" style="font-family: monospace;">
            {{ getFileExt(scope.row.filePath) }}
          </el-tag>

          <span style="font-weight: 500;">{{ scope.row.resourceName }}</span>
          
          <el-tag v-if="isTeacher && scope.row.status === '1'" type="warning" size="small" effect="dark" style="margin-left: 5px;">
             隐藏中
          </el-tag>
        </div>
      </template>
    </el-table-column>

    <el-table-column prop="fileSize" label="大小" width="100" align="center" />
    <el-table-column prop="createTime" label="上传时间" width="160" align="center" />
    
    <el-table-column prop="downloadCount" label="下载" width="90" align="center">
      <template #default="scope">{{ scope.row.downloadCount }} 次</template>
    </el-table-column>

    <el-table-column v-if="isTeacher" label="状态" width="100" align="center">
      <template #default="scope">
        <el-switch
          v-model="scope.row.status"
          active-value="0"
          inactive-value="1"
          active-text="发布"
          inactive-text="隐藏"
          inline-prompt
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
          @change="handleStatusChange(scope.row)"
        />
      </template>
    </el-table-column>

    <el-table-column label="操作" width="220" align="center" fixed="right">
      <template #default="scope">
        <el-button link type="success" icon="View" @click="handlePreview(scope.row)">预览</el-button>
        
        <el-button link type="primary" icon="Download" @click="handleDownload(scope.row)">下载</el-button>
        
        <el-button 
          v-if="isTeacher" 
          link 
          type="danger" 
          icon="Delete" 
          @click="handleDeleteResource(scope.row)"
        >删除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-empty v-else description="暂无教学资源" />
        </div>

        <!-- Homework -->
        <div v-else-if="activeMenu === 'homework'" class="content-wrapper">
          <div class="content-header">
            <h2>测验与作业</h2>
          </div>
          <el-empty description="暂无作业" />
        </div>

        <!-- Exam -->
        <div v-else-if="activeMenu === 'exam'" class="content-wrapper">
           <div class="content-header">
            <h2>考试</h2>
          </div>
          <el-empty description="暂无考试" />
        </div>

        <!-- Experiment -->
        <div v-else-if="activeMenu === 'experiment'" class="content-wrapper">
          <div class="content-header">
            <h2>实验</h2>
            <el-button v-if="isTeacher" type="primary" size="small" icon="Plus" @click="openExperimentDialog()">发布实验</el-button>
          </div>
          
          <div v-if="experimentList && experimentList.length > 0" class="experiment-list">
            <el-card v-for="exp in experimentList" :key="exp.experimentId" class="experiment-card" shadow="hover">
              <div class="exp-header">
                <div class="exp-title">{{ exp.experimentName }}</div>
                <el-tag :type="exp.status === '1' ? 'success' : 'info'" size="small">
                  {{ exp.status === '1' ? '已发布' : '草稿' }}
                </el-tag>
              </div>
              <div class="exp-desc">{{ exp.description || '暂无描述' }}</div>
              <div class="exp-footer">
                <div class="exp-meta">
                  <span class="exp-time">创建时间: {{ exp.createTime }}</span>
                  <span v-if="exp.deadline" class="exp-time">截止时间: {{ exp.deadline }}</span>
                </div>
                <div class="exp-actions">
                  <el-button v-if="isTeacher" type="primary" link size="small" @click="openExperimentDialog(exp)">编辑</el-button>
                  <el-button v-if="isTeacher" type="warning" link size="small" @click="viewExperimentSubmissions(exp)">查看提交</el-button>
                  <el-button v-if="isTeacher" type="danger" link size="small" @click="handleDeleteExperiment(exp)">删除</el-button>
                  <el-button v-if="!isTeacher" type="success" size="small" @click="goToExperimentCoding(exp.experimentId)">进入实验</el-button>
                </div>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="暂无实验" />
        </div>

        <!-- Members -->
        <div v-else-if="activeMenu === 'members'" class="content-wrapper">
           <div class="content-header">
            <h2>人员管理</h2>
            <el-button type="primary" size="small" icon="Plus" @click="openStudentAddDialog">添加成员</el-button>
          </div>
          
          <el-table 
            v-if="students && students.length > 0"
            :data="students" 
            style="width: 100%" 
            :header-cell-style="{background:'#f8f9fa', color:'#606266', fontWeight:'500'}"
            class="member-table"
          >
            <el-table-column prop="userId" label="学号" width="100" align="center" sortable>
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
                    <div class="username">{{ scope.row.userName }}</div>
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
                  icon="Delete"
                  class="action-btn"
                  @click="handleRemoveStudent(scope.row)"
                >
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无课程成员" />
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
                  <el-button type="primary" icon="Edit" @click="openEditCourseDialog">编辑课程信息</el-button>
                  <el-button type="danger" plain icon="Delete" @click="handleDeleteCourse">删除课程</el-button>
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

    <!-- Add Resource Dialog -->
    <el-dialog v-model="previewOpen" :title="previewTitle" width="70%" top="5vh" append-to-body>
    <div class="preview-container" style="text-align: center; min-height: 400px; display: flex; align-items: center; justify-content: center; background: #000;">
      <video v-if="previewType === 'video'" :src="previewUrl" controls style="max-width: 100%; max-height: 70vh;"></video>
      <img v-if="previewType === 'image'" :src="previewUrl" style="max-width: 100%; max-height: 70vh; object-fit: contain;">
      <iframe v-if="previewType === 'pdf'" :src="previewUrl" style="width: 100%; height: 70vh; border: none;"></iframe>
      <div v-if="previewType === 'other'" style="color: #fff;">
        <el-icon :size="50"><Warning /></el-icon>
        <p>该文件格式不支持在线预览，请下载后查看</p>
      </div>
    </div>
  </el-dialog>

  <el-dialog v-model="resourceUploadOpen" title="上传教学资源" width="500px">
    <el-form :model="resourceForm" ref="resourceRef" label-width="80px" :rules="resourceRules">
      <el-form-item label="文件" prop="filePath">
        <file-upload 
          v-model="resourceForm.filePath" 
          :limit="1" 
          :fileSize="500" 
          :fileType="['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'pdf', 'mp4', 'avi', 'mov', 'flv', 'png', 'jpg', 'jpeg']"
        />
        <div style="font-size: 12px; color: #999; line-height: 1.5; margin-top: 5px;">
          文件上传后将自动使用原始文件名作为资源名称
        </div>
      </el-form-item>
      
      <el-form-item label="状态">
        <el-radio-group v-model="resourceForm.status">
          <el-radio label="0">立即发布</el-radio>
          <el-radio label="1">暂存隐藏</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="resourceUploadOpen = false">取消</el-button>
      <el-button type="primary" @click="submitResource">确定上传</el-button>
    </template>
  </el-dialog>

  <!-- Experiment Dialog -->
  <el-dialog v-model="experimentOpen" :title="experimentForm.experimentId ? '编辑实验' : '发布实验'" width="600px">
    <el-form :model="experimentForm" ref="experimentRef" label-width="80px" :rules="experimentRules">
      <el-form-item label="实验名称" prop="experimentName">
        <el-input v-model="experimentForm.experimentName" placeholder="请输入实验名称" />
      </el-form-item>
      <el-form-item label="实验描述" prop="description">
        <el-input v-model="experimentForm.description" type="textarea" :rows="4" placeholder="请输入实验描述和要求" />
      </el-form-item>
      <el-form-item label="测试输入" prop="testInput">
        <el-input v-model="experimentForm.testInput" type="textarea" :rows="3" placeholder="程序的标准输入（可选）" />
      </el-form-item>
      <el-form-item label="期望输出" prop="testOutput">
        <el-input v-model="experimentForm.testOutput" type="textarea" :rows="3" placeholder="程序的期望输出（用于判题）" />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="experimentForm.status">
          <el-radio label="0">草稿</el-radio>
          <el-radio label="1">发布</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="截止时间">
        <el-date-picker
          v-model="experimentForm.deadline"
          type="datetime"
          placeholder="选择截止时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="experimentOpen = false">取消</el-button>
      <el-button type="primary" @click="submitExperiment">保存</el-button>
    </template>
  </el-dialog>

  <!-- Submission Records Dialog -->
  <el-dialog v-model="submissionDialogOpen" :title="`提交记录 - ${currentExperimentName}`" width="900px">
    <el-table :data="submissionList" stripe style="width: 100%">
      <el-table-column prop="studentId" label="学生ID" width="100" />
      <el-table-column prop="result" label="评测结果" width="130">
        <template #default="{ row }">
          <el-tag :type="getSubmissionTagType(row.result)" size="small">
            {{ translateResult(row.result) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="submitTime" label="提交时间" width="180" />
      <el-table-column prop="runTime" label="运行时间" width="100" />
      <el-table-column prop="memoryUsed" label="内存" width="100" />
      <el-table-column label="代码" width="80">
        <template #default="{ row }">
          <el-popover trigger="click" width="500">
            <template #reference>
              <el-button link type="primary" size="small">查看</el-button>
            </template>
            <pre style="max-height: 400px; overflow: auto; background: #f5f5f5; padding: 10px; font-family: monospace;">{{ row.code }}</pre>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="stdout" label="输出" min-width="150" show-overflow-tooltip />
    </el-table>
    <template #footer>
      <el-button @click="submissionDialogOpen = false">关闭</el-button>
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
import { listClass } from '@/api/edu/class'
import { getUserBrief } from '@/api/edu/class'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoPlay, Share, User, Search, InfoFilled, Delete, Setting, Edit, FolderAdd, DocumentAdd, EditPen, DeleteFilled } from '@element-plus/icons-vue'
import useUserStore from '@/store/modules/user'
import ImageUpload from '@/components/ImageUpload/index.vue'
import defaultImg from '@/assets/images/profile.jpg'
import defaultAvatar from '@/assets/images/profile.jpg'


import { listResource, addResource, delResource,updateResource,downloadResource } from "@/api/edu/resource";
import { listExperiment, addExperiment, updateExperiment, delExperiment, getAllSubmissions } from "@/api/edu/experiment";

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const courseId = route.params.id
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
function submitResource() {
  proxy.$refs["resourceRef"].validate(valid => {
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
    // --- 新增代码 START ---
    { key: 'resources', label: '教学资源', icon: 'FolderOpened' },
    // --- 新增代码 END ---
    { key: 'homework', label: '测验与作业', icon: 'EditPen' },
    { key: 'experiment', label: '实验', icon: 'Cpu' },
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
  }
  // 4. 教学资源
  else if (val === 'resources') {
    getResourceList()
  }
  // 5. 实验
  else if (val === 'experiment') {
    getExperimentList()
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
</style>
