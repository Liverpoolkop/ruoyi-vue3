<template>
  <div class="portal-homework-container">
    <portal-navbar />
    <div class="main-content">
      <div class="content-header">
        <h2>作业提交管理</h2>
        <el-button @click="router.back()">返回</el-button>
      </div>

      <div class="search-bar">
        <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
          <el-form-item label="学号" prop="studentName">
            <el-input
              v-model="queryParams.studentName"
              placeholder="请输入学号"
              clearable
              style="width: 200px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 200px">
              <el-option label="未批改" value="1" />
              <el-option label="已批改" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            <el-button type="warning" icon="Download" @click="handleExport">导出</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-container" v-loading="loading">
        <el-table :data="submissionList">
          <el-table-column label="学号" align="center" prop="id" />
          <el-table-column label="姓名" align="center" prop="studentName" />
          <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
                <el-tag type="warning" v-if="scope.row.status == '1'">未批改</el-tag>
                <el-tag type="success" v-else-if="scope.row.status == '2'">已批改</el-tag>
                <el-tag type="info" v-else>草稿</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="提交时间" align="center" prop="createTime" width="180">
            <template #default="scope">
              <span>{{ scope.row.createTime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="成绩" align="center" prop="grade">
             <template #default="scope">
                <span v-if="scope.row.status == '2'" style="font-weight: bold; color: #67c23a;">{{ scope.row.grade }}</span>
                <span v-else>-</span>
             </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click="handleGrade(scope.row)"
              >批改</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container" v-show="total>0">
            <el-pagination
                v-model:current-page="queryParams.pageNum"
                v-model:page-size="queryParams.pageSize"
                layout="prev, pager, next"
                :total="total"
                @current-change="getList"
            />
        </div>
      </div>
    </div>

    <!-- Grade Dialog -->
    <el-dialog title="批改作业" v-model="open" width="1000px" append-to-body destroy-on-close class="grading-dialog">
      <div class="grade-dialog-content">
          <div class="grade-layout">
              <!-- Left Side: Requirements & Submission -->
              <div class="grade-left">
                  <!-- 1. Homework Requirement -->
                  <div class="section-block">
                      <div class="section-title">作业要求</div>
                      <div class="content-box">
                          <div class="hw-title">{{ currentHomework.title }}</div>
                          <div class="hw-content" v-html="currentHomework.content"></div>
                      </div>
                  </div>

                  <!-- 2. Student Submission -->
                  <div class="section-block">
                      <div class="section-title">学生提交 ({{ currentSubmission.studentName }})</div>
                      <div class="content-box">
                          <div class="sub-content" v-if="currentSubmission.content">{{ currentSubmission.content }}</div>
                          <div class="sub-content empty" v-else>无文本内容</div>

                          <!-- Attachments -->
                          <div v-if="currentSubmission.fileUrl" class="attachments-area">
                              <div class="attach-label">附件：</div>
                              <div class="attach-list">
                                  <template v-for="(url, index) in currentSubmission.fileUrl.split(',')" :key="index">
                                      <div class="attach-card">
                                          <!-- Icon/Thumbnail -->
                                          <div class="file-icon" @click="handlePreview(url)">
                                              <el-image v-if="isImageUrl(url)" :src="getResourceUrl(url)" fit="cover" class="img-thumb" />
                                              <div v-else-if="isVideoUrl(url)" class="type-icon video"><el-icon><VideoPlay /></el-icon></div>
                                              <div v-else-if="isPdfUrl(url)" class="type-icon pdf"><el-icon><Document /></el-icon></div>
                                              <div v-else class="type-icon file"><el-icon><Document /></el-icon></div>
                                          </div>
                                          <!-- Info & Actions -->
                                          <div class="file-info">
                                              <div class="file-name" :title="getFileName(url)">{{ getFileName(url) }}</div>
                                              <div class="file-actions">
                                                  <el-button v-if="canPreview(url)" link type="primary" size="small" @click="handlePreview(url)">预览</el-button>
                                                  <el-button link type="primary" size="small" @click="downloadResource(getResourceUrl(url))">下载</el-button>
                                              </div>
                                          </div>
                                      </div>
                                  </template>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Right Side: Grading Form -->
              <div class="grade-right">
                  <!-- 3. Grading Form -->
                  <div class="section-block grading">
                      <div class="section-title">评分与评语</div>
                      <el-form ref="formRef" :model="form" label-width="60px" label-position="top">
                          <el-form-item label="成绩">
                             <el-input v-model="form.grade" placeholder="输入分数" size="large" />
                          </el-form-item>
                          <el-form-item label="评语">
                             <el-input v-model="form.gradeComment" type="textarea" :rows="10" placeholder="请输入详细评语" />
                          </el-form-item>
                      </el-form>
                  </div>
              </div>
          </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitGrade" size="large" style="width: 150px;">提交批改</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Preview Dialog -->
    <el-dialog v-model="previewOpen" :title="getFileName(currentPreview.url)" width="800px" append-to-body destroy-on-close center class="preview-dialog">
      <div class="preview-container">
         <video 
            v-if="isVideoUrl(currentPreview.url)" 
            :src="currentPreview.url" 
            controls 
            autoplay
            class="preview-content"
         >
            您的浏览器不支持视频播放。
         </video>
         <el-image
            v-else-if="isImageUrl(currentPreview.url)"
            :src="currentPreview.url"
            :preview-src-list="[currentPreview.url]"
            fit="contain"
            class="preview-content"
         />
         <iframe
            v-else-if="isPdfUrl(currentPreview.url) || isTextUrl(currentPreview.url)"
            :src="currentPreview.url"
            class="preview-content pdf"
         ></iframe>
         <iframe
            v-else-if="isOfficeUrl(currentPreview.url)"
            :src="'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(currentPreview.url)"
            class="preview-content pdf"
         ></iframe>
         <div v-else class="resource-preview">
            <el-icon size="60"><Document /></el-icon>
            <p style="margin-top: 20px;">该资源格式暂不支持在线预览，请下载后查看</p>
         </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="downloadResource(currentPreview.url)" icon="Download" round size="large">
            下载资源
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PortalHomeworkSubmission">
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PortalNavbar from '@/components/PortalNavbar/index.vue'
import { listSubmission, updateSubmission } from "@/api/edu/submission"
import { getHomework } from "@/api/edu/homework"
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download, Edit, Document, Picture, VideoPlay } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const loading = ref(true)
const submissionList = ref([])
const total = ref(0)
const open = ref(false)
const previewOpen = ref(false)
const currentPreview = ref({})
const queryRef = ref(null)
const currentHomework = ref({})

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  homeworkId: null,
  studentName: null,
  status: null
})

const form = ref({})
const currentSubmission = ref({})

const getList = () => {
  loading.value = true
  listSubmission(queryParams).then(response => {
    submissionList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

const getHomeworkInfo = () => {
    if (queryParams.homeworkId) {
        getHomework(queryParams.homeworkId).then(res => {
            currentHomework.value = res.data
        })
    }
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryParams.studentName = null
  queryParams.status = null
  handleQuery()
}

const handleExport = () => {
  proxy.download('system/submission/export', {
    ...queryParams
  }, `submission_${new Date().getTime()}.xlsx`)
}

const handleGrade = (row) => {
    currentSubmission.value = row
    form.value = {
        id: row.id,
        grade: row.grade,
        gradeComment: row.gradeComment
    }
    open.value = true
}

const submitGrade = () => {
    form.value.status = '2' // Graded
    updateSubmission(form.value).then(response => {
        ElMessage.success("批改成功")
        open.value = false
        getList()
    })
}

const getExt = (url) => {
    if (!url) return ''
    let cleanUrl = url.split('?')[0].split('#')[0]
    return cleanUrl.substring(cleanUrl.lastIndexOf('.') + 1).toLowerCase()
}

const isImageUrl = (url) => {
    const ext = getExt(url)
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)
}

const isVideoUrl = (url) => {
    const ext = getExt(url)
    return ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext)
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

const canPreview = (url) => {
    return isImageUrl(url) || isVideoUrl(url) || isPdfUrl(url) || isTextUrl(url) || isOfficeUrl(url)
}

const getResourceUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
        return url
    }
    return import.meta.env.VITE_APP_BASE_API + url
}

const handlePreview = (url) => {
    if (!canPreview(url)) return
    currentPreview.value = { url: getResourceUrl(url) }
    previewOpen.value = true
}

const downloadResource = (url) => {
    window.open(url, '_blank')
}

const getFileName = (url) => {
    if (!url) return '附件'
    return url.substring(url.lastIndexOf('/') + 1)
}

onMounted(() => {
    const homeworkId = route.params.homeworkId
    if (homeworkId) {
        queryParams.homeworkId = homeworkId
        getHomeworkInfo()
        getList()
    } else {
        ElMessage.error("参数错误")
        router.back()
    }
})
</script>

<style scoped lang="scss">
.portal-homework-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.main-content {
  width: 1200px;
  margin: 30px auto;
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;

  h2 {
    font-size: 20px;
    color: #333;
    margin: 0;
  }
}

.search-bar {
  margin-bottom: 20px;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
}

.table-container {
  min-height: 400px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
  display: flex;
  justify-content: flex-end;
}

.grade-dialog-content {
    padding: 0 10px;

    .grade-layout {
        display: flex;
        gap: 30px;
        height: 600px; // Fixed height for scrolling content

        .grade-left {
            flex: 7;
            overflow-y: auto;
            padding-right: 10px;
            
            &::-webkit-scrollbar {
                width: 6px;
            }
            &::-webkit-scrollbar-thumb {
                background-color: #e4e7ed;
                border-radius: 3px;
            }
        }

        .grade-right {
            flex: 4;
            display: flex;
            flex-direction: column;
            border-left: 1px solid #ebeef5;
            padding-left: 20px;
        }
    }

    .section-block {
        margin-bottom: 25px;

        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            
            &::before {
                content: '';
                display: inline-block;
                width: 4px;
                height: 16px;
                background: #409EFF;
                margin-right: 8px;
                border-radius: 2px;
            }
        }

        .content-box {
            background: #fff;
            border: 1px solid #e4e7ed;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.02);

            .hw-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 12px;
                color: #333;
            }

            .hw-content {
                font-size: 14px;
                color: #606266;
                line-height: 1.8;
            }

            .sub-content {
                font-size: 14px;
                color: #303133;
                white-space: pre-wrap;
                line-height: 1.8;

                &.empty {
                    color: #909399;
                    font-style: italic;
                    text-align: center;
                    padding: 20px 0;
                }
            }

            .attachments-area {
                margin-top: 20px;
                border-top: 1px dashed #e4e7ed;
                padding-top: 15px;

                .attach-label {
                    font-size: 13px;
                    color: #909399;
                    margin-bottom: 10px;
                    font-weight: 500;
                }

                .attach-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;

                    .attach-card {
                        width: 140px;
                        border: 1px solid #e4e7ed;
                        border-radius: 6px;
                        overflow: hidden;
                        background: #fff;
                        transition: all 0.3s;
                        
                        &:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                        }

                        .file-icon {
                            height: 100px;
                            background: #f5f7fa;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            overflow: hidden;
                            
                            .img-thumb {
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                            }
                            
                            .type-icon {
                                font-size: 40px;
                                color: #909399;
                                
                                &.video { color: #409EFF; }
                                &.pdf { color: #F56C6C; }
                                &.file { color: #909399; }
                            }
                        }

                        .file-info {
                            padding: 8px;
                            
                            .file-name {
                                font-size: 12px;
                                color: #303133;
                                margin-bottom: 5px;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                            }
                            
                            .file-actions {
                                display: flex;
                                justify-content: space-between;
                                
                                .el-button {
                                    padding: 0;
                                    height: auto;
                                    font-size: 12px;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        &.grading {
            background: transparent;
            padding: 0;
            border: none;
            height: 100%;
            display: flex;
            flex-direction: column;

            .section-title {
                &::before { background: #67c23a; }
            }
            
            :deep(.el-form) {
                flex: 1;
                display: flex;
                flex-direction: column;
                
                .el-form-item {
                    margin-bottom: 25px;
                    
                    &:last-child {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        
                        .el-form-item__content {
                            flex: 1;
                            
                            .el-textarea {
                                height: 100%;
                                .el-textarea__inner {
                                    height: 100% !important;
                                    resize: none;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

.preview-container {
    background: #000;
    border-radius: 4px;
    min-height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    
    .preview-content {
        max-width: 100%;
        max-height: 600px;
        display: block;
        
        &.pdf {
            width: 100%;
            height: 600px;
            border: none;
            background: #fff;
        }
    }
    
    .resource-preview {
        color: #fff;
        text-align: center;
        padding: 40px;
    }
}
</style>