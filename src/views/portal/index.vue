<template>
  <div class="portal-container">
    <!-- Navbar -->
    <portal-navbar />

    <!-- Banner -->
    <div class="banner">
      <h1>探索知识的海洋</h1>
      <p>海量优质课程等你来学</p>
      <div class="banner-search">
        <el-input 
          v-model="searchText" 
          placeholder="搜索感兴趣的课程..." 
          class="search-input-lg" 
          prefix-icon="Search" 
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>
    </div>

    <div class="main-content">
      <!-- Editor's Recommendation -->
      <div class="section">
        <div v-if="recommendList.length > 0" class="course-grid">
          <el-card v-for="course in recommendList" :key="course.courseId" class="course-card" :body-style="{ padding: '0px' }" shadow="hover" @click="goDetail(course.courseId)">
            <img :src="course.courseImg || defaultImg" class="image" />
            <div class="card-content">
              <div class="course-title" :title="course.courseName">{{ course.courseName }}</div>
              <div class="school-info">{{ course.teacherNames || '未知教师' }}</div>
              <div class="course-meta">
                <span>{{ course.studentCount || 0 }}人参加</span>
              </div>
              <div class="course-desc" :title="course.courseDesc">{{ course.courseDesc || '暂无描述' }}</div>
            </div>
          </el-card>
        </div>
        <el-empty v-else description="暂无相关课程" />
        
        <!-- Pagination -->
        <div class="pagination-container" v-show="total > 0">
          <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[8, 12, 16, 20]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="getList"
            @current-change="getList"
          />
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>Copyright © 2025 在线课程平台 All Rights Reserved.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import PortalNavbar from '@/components/PortalNavbar/index.vue'
import { useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import useAppStore from '@/store/modules/app'
import { listPortalCourse, getHotCourses, getNewCourses } from '@/api/portal'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()
const searchText = ref('')
const recommendList = ref([])
const hotList = ref([])
const newList = ref([])
const defaultImg = 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'

const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 8,
  courseName: undefined
})

function getList() {
  listPortalCourse(queryParams).then(res => {
    recommendList.value = res.rows || []
    total.value = res.total || 0
  })
}

function handleSearch() {
  queryParams.pageNum = 1
  queryParams.courseName = searchText.value || undefined
  getList()
}

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

function goDetail(id) {
  // If we have a public detail page, go there.
  // Currently we reused the admin detail page which might require login?
  // Let's assume we want to show detail. The current detail page implementation might need adjustment to work without login if it calls protected APIs.
  // But for now, let's route to the detail page. 
  // If the detail page API is protected, the user will be intercepted by request interceptor (401) and redirected to login. This is acceptable behavior for now.
  router.push(`/system/course/index/${id}`)
}

onMounted(() => {
  getList()
  getHotCourses().then(res => {
    hotList.value = res.data ? res.data.slice(0, 10) : []
  })
  getNewCourses().then(res => {
    newList.value = res.data ? res.data.slice(0, 10) : []
  })
})
</script>

<style scoped>
.portal-container {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.banner {
  height: 300px;
  background: linear-gradient(135deg, #409EFF 0%, #36d1dc 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.banner h1 {
  font-size: 48px;
  margin-bottom: 20px;
}

.banner p {
  font-size: 20px;
  opacity: 0.9;
  margin-bottom: 30px;
}

.banner-search {
  width: 100%;
  max-width: 600px;
}

.search-input-lg :deep(.el-input__wrapper) {
  height: 50px;
  font-size: 16px;
  border-radius: 25px 0 0 25px;
  box-shadow: none;
  border: none;
}

.search-input-lg :deep(.el-input-group__append) {
  background-color: #fff;
  border-radius: 0 25px 25px 0;
  border: none;
  box-shadow: none;
}

.search-input-lg :deep(.el-button) {
  height: 50px;
  width: 60px;
  font-size: 20px;
  color: #409EFF;
}

.search-input-lg :deep(.el-input__inner) {
  height: 50px;
}

.main-content {
  width: 1200px;
  margin: 0 auto;
  padding: 40px 0;
}

.section {
  margin-bottom: 50px;
}

.section-title {
  font-size: 24px;
  font-weight: normal;
  color: #333;
  margin-bottom: 20px;
  border-left: 4px solid #409EFF;
  padding-left: 10px;
}

.subtitle {
  font-size: 14px;
  color: #999;
  margin-left: 10px;
  font-style: italic;
  font-weight: normal;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.course-card {
  cursor: pointer;
  transition: all 0.3s;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.course-card .image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.card-content {
  padding: 14px;
}

.course-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.school-info {
  font-size: 12px;
  color: #606266;
  margin-bottom: 8px;
}

.course-meta {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.course-desc {
  font-size: 12px;
  color: #999;
  background: #f4f4f5;
  padding: 5px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ranking-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.ranking-col {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.ranking-list {
  margin-top: 15px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.ranking-item:hover .rank-title {
  color: #409EFF;
}

.rank-num {
  font-size: 18px;
  font-weight: bold;
  color: #999;
  width: 30px;
  font-style: italic;
}

.rank-num.top-three {
  color: #ff6b6b;
}

.rank-content {
  flex: 1;
  overflow: hidden;
}

.rank-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-meta {
  font-size: 12px;
  color: #999;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.footer {
  background: #333;
  color: #fff;
  text-align: center;
  padding: 30px 0;
  margin-top: 50px;
}
</style>
