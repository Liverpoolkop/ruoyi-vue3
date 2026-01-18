<!--<template>-->
<!--   <div class="app-container">-->
<!--      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">-->
<!--         <el-form-item label="知识点名称" prop="knowledgeName">-->
<!--            <el-input-->
<!--               v-model="queryParams.knowledgeName"-->
<!--               placeholder="请输入知识点名称"-->
<!--               clearable-->
<!--               style="width: 200px"-->
<!--               @keyup.enter="handleQuery"-->
<!--            />-->
<!--         </el-form-item>-->
<!--         <el-form-item label="章节" prop="chapterId">-->
<!--            <el-select v-model="queryParams.chapterId" clearable style="width: 200px">-->
<!--              <el-option-->
<!--                  v-for="item in chapterOptions"-->
<!--                  :key="item.chapterId"-->
<!--                  :label="item.chapterName"-->
<!--                  :value="item.chapterId"-->
<!--              />-->
<!--            </el-select>-->
<!--         </el-form-item>-->
<!--         <el-form-item label="难度" prop="difficultyLevel">-->
<!--          <el-select v-model="queryParams.difficultyLevel" placeholder="请选择难度" clearable>-->
<!--            <el-option label="简单" value="easy" />-->
<!--            <el-option label="中等" value="medium" />-->
<!--            <el-option label="困难" value="hard" />-->
<!--          </el-select>-->
<!--         </el-form-item>-->
<!--         <el-form-item>-->
<!--            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>-->
<!--            <el-button icon="Refresh" @click="resetQuery">重置</el-button>-->
<!--         </el-form-item>-->
<!--      </el-form>-->

<!--      <el-row :gutter="10" class="mb8">-->
<!--         <el-col :span="1.5">-->
<!--            <el-button-->
<!--               type="primary"-->
<!--               plain-->
<!--               icon="Plus"-->
<!--               @click="handleAdd"-->
<!--               v-hasPermi="['knowledge:knowledge:add']"-->
<!--            >新增</el-button>-->
<!--         </el-col>-->
<!--         <el-col :span="1.5">-->
<!--            <el-button-->
<!--               type="success"-->
<!--               plain-->
<!--               icon="Edit"-->
<!--               :disabled="single"-->
<!--               @click="handleUpdate"-->
<!--               v-hasPermi="['knowledge:knowledge:edit']"-->
<!--            >修改</el-button>-->
<!--         </el-col>-->
<!--         <el-col :span="1.5">-->
<!--            <el-button-->
<!--               type="danger"-->
<!--               plain-->
<!--               icon="Delete"-->
<!--               :disabled="multiple"-->
<!--               @click="handleDelete"-->
<!--               v-hasPermi="['knowledge:knowledge:remove']"-->
<!--            >删除</el-button>-->
<!--         </el-col>-->
<!--         <el-col :span="1.5">-->
<!--            <el-button-->
<!--               type="warning"-->
<!--               plain-->
<!--               icon="Download"-->
<!--               @click="handleExport"-->
<!--               v-hasPermi="['knowledge:knowledge:export']"-->
<!--            >导出</el-button>-->
<!--         </el-col>-->
<!--         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>-->
<!--      </el-row>-->

<!--      <el-table v-loading="loading" :data="knowledgeList" @selection-change="handleSelectionChange">-->
<!--         <el-table-column type="selection" width="55" align="center" />-->
<!--         <el-table-column label="知识点名称" align="center" prop="knowledgeName" />-->
<!--         <el-table-column label="章节" align="center" prop="chapterName" />-->
<!--         <el-table-column label="难度" align="center" prop="difficultyLevel">-->
<!--            <template #default="scope">-->
<!--              <el-tag :type="scope.row.difficultyLevel === 'easy' ? 'success' :-->
<!--                         scope.row.difficultyLevel === 'medium' ? 'warning' : 'danger'">-->
<!--                {{ scope.row.difficultyLevel === 'easy' ? '简单' :-->
<!--                  scope.row.difficultyLevel === 'medium' ? '中等' : '困难' }}-->
<!--              </el-tag>-->
<!--            </template>-->
<!--         </el-table-column>-->
<!--         <el-table-column label="关键词" align="center" prop="keywords" width="180"/>-->
<!--        <el-table-column label="状态" align="center" prop="status">-->
<!--          <template #default="scope">-->
<!--            <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'" >-->
<!--              {{ scope.row.status === '0' ? '正常' : '停用' }}-->
<!--            </el-tag>-->
<!--          </template>-->
<!--        </el-table-column>-->
<!--         <el-table-column label="创建时间" align="center" prop="createTime" width="180">-->
<!--            <template #default="scope">-->
<!--               <span>{{ parseTime(scope.row.createTime) }}</span>-->
<!--            </template>-->
<!--         </el-table-column>-->
<!--         <el-table-column label="操作" width="180" align="center" class-name="small-padding fixed-width">-->
<!--            <template #default="scope">-->
<!--               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['knowledge:knowledge:edit']">修改</el-button>-->
<!--               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['knowledge:knowledge:remove']">删除</el-button>-->
<!--               <el-button link type="primary" icon="Connection" @click="handleViewGraph(scope.row)" >查看图谱</el-button>-->
<!--            </template>-->
<!--         </el-table-column>-->
<!--      </el-table>-->

<!--      <pagination-->
<!--         v-show="total > 0"-->
<!--         :total="total"-->
<!--         v-model:page="queryParams.pageNum"-->
<!--         v-model:limit="queryParams.pageSize"-->
<!--         @pagination="getList"-->
<!--      />-->

<!--      &lt;!&ndash; 添加或修改对话框 &ndash;&gt;-->
<!--      <el-dialog :title="title" v-model="open" width="500px" append-to-body>-->
<!--         <el-form ref="kgform" :model="form" :rules="rules" label-width="80px">-->
<!--            <el-form-item label="知识点名称" prop="knowledgeName">-->
<!--               <el-input v-model="form.knowledgeName" placeholder="请输入知识点名称" />-->
<!--            </el-form-item>-->
<!--            <el-form-item label="知识点编码" prop="knowledgeCode">-->
<!--               <el-input v-model="form.knowledgeCode" placeholder="请输入知识点编码" />-->
<!--            </el-form-item>-->
<!--            <el-form-item label="所属章节" prop="chapterId">-->
<!--             <el-select v-model="form.chapterId" placeholder="请先选择课程" :disabled="!form.courseId">-->
<!--               <el-option-->
<!--                   v-for="item in chapterOptions"-->
<!--                   :key="item.chapterId"-->
<!--                   :label="item.chapterName"-->
<!--                   :value="item.chapterId"-->
<!--               />-->
<!--             </el-select>-->
<!--            </el-form-item>-->
<!--            <el-form-item label="父知识点" prop="parentId">-->
<!--             <ElTreeSelect-->
<!--                 v-model="form.parentId"-->
<!--                 :options="knowledgeTreeOptions"-->
<!--                 :normalizer="normalizer"-->
<!--                 placeholder="请选择父知识点"-->
<!--                 style="width: 100%"-->
<!--             />-->
<!--            </el-form-item>-->
<!--            <el-form-item label="难度等级" prop="difficultyLevel">-->
<!--             <el-select v-model="form.difficultyLevel" placeholder="请选择难度等级">-->
<!--               <el-option label="简单" value="easy" />-->
<!--               <el-option label="中等" value="medium" />-->
<!--               <el-option label="困难" value="hard" />-->
<!--             </el-select>-->
<!--            </el-form-item>-->
<!--            <el-form-item label="关键词" prop="keywords">-->
<!--             <el-input v-model="form.keywords" placeholder="请输入关键词，多个用逗号分隔" />-->
<!--            </el-form-item>-->
<!--            <el-form-item label="知识点内容" prop="content">-->
<!--             <Editor v-model="form.content" :min-height="192" />-->
<!--            </el-form-item>-->
<!--            <el-form-item label="状态" prop="status">-->
<!--             <el-radio-group v-model="form.status">-->
<!--               <el-radio label="0">正常</el-radio>-->
<!--               <el-radio label="1">停用</el-radio>-->
<!--             </el-radio-group>-->
<!--            </el-form-item>-->
<!--            <el-form-item label="备注" prop="remark">-->
<!--               <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />-->
<!--            </el-form-item>-->
<!--         </el-form>-->
<!--         <template #footer>-->
<!--            <div class="dialog-footer">-->
<!--               <el-button type="primary" @click="submitForm">确 定</el-button>-->
<!--               <el-button @click="cancel">取 消</el-button>-->
<!--            </div>-->
<!--         </template>-->
<!--      </el-dialog>-->

<!--       &lt;!&ndash; 知识图谱对话框 &ndash;&gt;-->
<!--       <el-dialog v-model="graphOpen" width="90%" top="5vh" append-to-body>-->
<!--         <div style="height: 80vh;">-->
<!--           <KnowledgeGraph :graphData="graphData" v-if="graphOpen" />-->
<!--         </div>-->
<!--       </el-dialog>-->


<!--   </div>-->
<!--</template>-->

<!--<script setup name="Knowledge">-->
<!--import {-->
<!--  addKnowledge,-->
<!--  delKnowledge,-->
<!--  getKnowledge,-->
<!--  getKnowledgeGraphByCourseId,-->
<!--  listKnowledge,-->
<!--  updateKnowledge-->
<!--} from "@/api/edu/knowledge.js";-->
<!--import KnowledgeGraph from "@/components/Knowledge/knowledgeGraph.vue";-->
<!--import {treeSelect} from "@/api/edu/tree.js";-->
<!--import {listCourse} from "@/api/edu/course.js";-->
<!--import {listChapter} from "@/api/system/chapter.js";-->

<!--const { proxy } = getCurrentInstance();-->
<!--const { sys_normal_disable } = proxy.useDict("sys_normal_disable");-->
<!--const props = defineProps({-->
<!--  courseData: {-->
<!--    type: Object,-->
<!--    default: () => ({-->
<!--      courseId:'',-->
<!--      courseName: '高等数学'-->
<!--    })-->
<!--  }-->
<!--})-->
<!--const knowledgeList = ref([]);-->
<!--const chapterOptions = ref([]);-->
<!--const courseOptions = ref([]);-->
<!--const knowledgeTreeOptions = ref([]);// 知识点树选项-->
<!--const open = ref(false);-->
<!--const loading = ref(true);// 遮罩层-->
<!--const showSearch = ref(true);-->
<!--const ids = ref([]);// 选中数组-->
<!--const single = ref(true);// 非单个禁用-->
<!--const multiple = ref(true);// 非多个禁用-->
<!--const total = ref(0);-->
<!--const title = ref("");-->

<!--const graphData=ref({});// 知识图谱数据-->
<!--const graphOpen= ref(false);// 是否显示知识图谱弹出层-->

<!--const data = reactive({-->
<!--  form: {},-->
<!--  queryParams: {-->
<!--    pageNum: 1,-->
<!--    pageSize: 10,-->
<!--    knowledgeName: undefined,-->
<!--    courseId: undefined,-->
<!--    chapterId: undefined,-->
<!--    knowledgeId: undefined,-->
<!--    difficultyLevel: undefined,-->
<!--    parentId: 0,-->
<!--    status: undefined-->
<!--  },-->
<!--  rules: {-->
<!--    knowledgeName: [-->
<!--      { required: true, message: "知识点名称不能为空", trigger: "blur" }-->
<!--    ],-->
<!--    courseId: [-->
<!--      { required: true, message: "所属课程不能为空", trigger: "blur" }-->
<!--    ],-->
<!--    chapterId: [-->
<!--      { required: true, message: "所属章节不能为空", trigger: "blur" }-->
<!--    ]-->
<!--  }-->
<!--});-->

<!--const { queryParams, form, rules } = toRefs(data);-->

<!--/** 查询知识点列表 */-->
<!--function getList() {-->
<!--  loading.value = true;-->
<!--  listKnowledge(queryParams.value).then(response => {-->
<!--    knowledgeList.value = response.rows;-->
<!--    total.value = response.total;-->
<!--    loading.value = false;-->
<!--  }).catch(error => {-->
<!--    console.error('获取知识点列表失败:', error);-->
<!--    loading.value = false;-->
<!--  });-->
<!--}-->
<!--/** 取消按钮 */-->
<!--function cancel() {-->
<!--  open.value = false;-->
<!--  reset();-->
<!--}-->
<!--/** 表单重置 */-->
<!--function reset() {-->
<!--  form.value = {-->
<!--    knowledgeId: undefined,-->
<!--    knowledgeName: undefined,-->
<!--    knowledgeCode: undefined,-->
<!--    courseId: undefined,-->
<!--    chapterId: undefined,-->
<!--    content: undefined,-->
<!--    difficultyLevel: "medium",-->
<!--    keywords: undefined,-->
<!--    parentId: 0,-->
<!--    status: "0",-->
<!--    remark: undefined-->
<!--  };-->
<!--  proxy.resetForm("kgform");-->
<!--}-->
<!--/** 搜索按钮操作 */-->
<!--function handleQuery() {-->
<!--  queryParams.value.pageNum = 1;-->
<!--  getList();-->
<!--}-->
<!--/** 重置按钮操作 */-->
<!--function resetQuery() {-->
<!--  proxy.resetForm("queryRef");-->
<!--  handleQuery();-->
<!--}-->
<!--/** 多选框选中数据 */-->
<!--function handleSelectionChange(selection) {-->
<!--  ids.value = selection.map(item => item.knowledgeId);-->
<!--  single.value = selection.length != 1;-->
<!--  multiple.value = !selection.length;-->
<!--}-->
<!--/** 新增按钮操作 */-->
<!--function handleAdd() {-->
<!--  reset();-->
<!--  open.value = true;-->
<!--  title.value = "添加知识点";-->
<!--}-->
<!--/** 修改按钮操作 */-->
<!--function handleUpdate(row) {-->
<!--  reset();-->
<!--  const knowledgeId = row.knowledgeId || ids.value;-->
<!--  getKnowledge(knowledgeId).then(response => {-->
<!--    form.value = response.data;-->
<!--    open.value = true;-->
<!--    title.value = "修改知识点";-->
<!--    handleCourseChange(form.value.courseId);-->
<!--    getKnowledgeTree();-->
<!--  });-->
<!--}-->
<!--/** 提交按钮 */-->
<!--function submitForm() {-->
<!--  proxy.$refs["kgform"].validate(valid => {-->
<!--    if (valid) {-->
<!--      if (form.value.knowledgeId !== undefined) {-->
<!--        updateKnowledge(form.value).then(response => {-->
<!--          proxy.$modal.msgSuccess("修改成功");-->
<!--          open.value = false;-->
<!--          getList();-->
<!--        });-->
<!--      } else {-->
<!--        addKnowledge(form.value).then(response => {-->
<!--          proxy.$modal.msgSuccess("新增成功");-->
<!--          open.value = false;-->
<!--          getList();-->
<!--        });-->
<!--      }-->
<!--    }-->
<!--  });-->
<!--}-->

<!--/** 状态修改 */-->
<!--function handleStatusChange(value,row) {-->
<!--  const text = value === "0" ? "启用" : "停用";-->
<!--  proxy.$modal.confirm('确认要' + text + '"' + row.knowledgeName + '"吗？').then(function() {-->
<!--    return updateKnowledge(row);-->
<!--  }).then(() => {-->
<!--    proxy.$modal.msgSuccess(text + "成功");-->
<!--  }).catch(function() {-->
<!--    row.status = row.status === "0" ? "1" : "0";-->
<!--  });-->
<!--}-->
<!--/** 查看知识图谱 */-->
<!--function handleViewGraph(row) {-->
<!--  getKnowledgeGraphByCourseId(row.courseId).then(response => {-->
<!--    graphData.value = response.data;-->
<!--    graphOpen.value = true;-->
<!--    console.log(graphOpen);-->
<!--  });-->
<!--}-->
<!--/** 查询课程列表 */-->
<!--function getCourseList() {-->
<!--  listCourse().then(response => {-->
<!--    courseOptions.value = response.rows;-->
<!--  });-->
<!--}-->
<!--/** 课程变化时查询章节列表 */-->
<!--/** 课程变化时处理 */-->
<!--function handleCourseChange(courseId) {-->
<!--  console.log('课程变化，courseId:', courseId)-->

<!--  // 清空章节选择-->
<!--  form.value.chapterId = undefined-->

<!--  // 清空章节选项-->
<!--  chapterOptions.value = []-->

<!--  // 清空知识点树选项-->
<!--  knowledgeTreeOptions.value = []-->

<!--  // 如果有课程ID，获取该课程的章节-->
<!--  if (courseId) {-->
<!--    // 获取章节列表-->
<!--    listChapter({ courseId }).then(response => {-->
<!--      chapterOptions.value = response.rows-->
<!--      console.log('获取到章节列表:', chapterOptions.value)-->
<!--    }).catch(error => {-->
<!--      console.error('获取章节失败:', error)-->
<!--    })-->
<!--  }-->
<!--}-->
<!--function getChapterList() {-->
<!--  let courseId = courseData.value.courseId;-->
<!--  listChapter({ courseId }).then(response => {-->
<!--    chapterOptions.value = response.rows;-->
<!--  });-->
<!--}-->
<!--/** 查询知识点树结构 */-->
<!--function getKnowledgeTree() {-->
<!--  treeSelect({ courseId: form.courseId }).then(response => {-->
<!--    knowledgeTreeOptions.value = response.data;-->
<!--  });-->
<!--}-->
<!--/** 转换知识点数据结构 */-->
<!--function normalizer(node) {-->
<!--  return {-->
<!--    id: node.knowledgeId,-->
<!--    label: node.knowledgeName,-->
<!--    children: node.children-->
<!--  };-->
<!-- }-->
<!--/** 打开搜索对话框 */-->
<!--function openSearchDialog() {-->
<!--  searchOpen.value = true;-->
<!--  searchKeyword.value = "";-->
<!--  searchResult.value = [];-->
<!--}-->
<!--/** 执行搜索 */-->
<!--function handleSearch() {-->
<!--  if (!searchKeyword.value.trim()) {-->
<!--    proxy.$modal.msgWarning("请输入搜索关键词");-->
<!--    return;-->
<!--  }-->
<!--  searchLoading.value = true;-->
<!--  searchKnowledge(searchKeyword.value).then(response => {-->
<!--    searchResult.value = response.data;-->
<!--    searchLoading.value = false;-->
<!--  });-->
<!--}-->

<!--/** 选择知识点 */-->
<!--function handleSelectKnowledge(row) {-->
<!--  proxy.$emit('select-knowledge', row);-->
<!--  searchOpen.value = false;-->
<!--}-->

<!--/** 删除按钮操作 */-->
<!--function handleDelete(row) {-->
<!--  const knowledgeIds = row.knowledgeId || ids.value;-->
<!--  proxy.$modal.confirm('是否确认删除知识点编号为"' + knowledgeIds + '"的数据项？').then(function() {-->
<!--    return delKnowledge(knowledgeIds);-->
<!--  }).then(() => {-->
<!--    getList();-->
<!--    proxy.$modal.msgSuccess("删除成功");-->
<!--  }).catch(() => {});-->
<!--}-->
<!--/** 导出按钮操作 */-->
<!--function handleExport() {-->
<!--  proxy.download('knowledge/knowledge/export', {-->
<!--    ...queryParams.value-->
<!--  }, `knowledge_${new Date().getTime()}.xlsx`)-->
<!--}-->

<!--getList();-->
<!--getChapterList();-->
<!--</script>-->


<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="知识点名称" prop="knowledgeName">
        <el-input
            v-model="queryParams.knowledgeName"
            placeholder="请输入知识点名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="章节" prop="chapterId">
        <el-select v-model="queryParams.chapterId" clearable style="width: 200px">
          <el-option
              v-for="item in chapterOptions"
              :key="item.chapterId"
              :label="item.chapterName"
              :value="item.chapterId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="难度" prop="difficultyLevel">
        <el-select v-model="queryParams.difficultyLevel" placeholder="请选择难度" clearable>
          <el-option label="简单" value="easy" />
          <el-option label="中等" value="medium" />
          <el-option label="困难" value="hard" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="知识点状态" clearable>
          <el-option
              v-for="dict in sys_normal_disable"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 课程信息卡片 -->
    <div class="course-info-card" v-if="courseData.courseName">
      <el-card shadow="never">
        <div class="course-header">
          <div class="course-left">
            <img :src="courseData.courseImg || defaultCourseImg" class="course-img" />
            <div class="course-info">
              <h3>{{ courseData.courseName }}</h3>
              <p class="course-desc">{{ courseData.courseDesc }}</p>
              <div class="course-stats">
                  <span class="stat-item">
                    <el-icon><Collection /></el-icon>
                    知识点数量: {{ total }}
                  </span>
                <span v-if="courseData.lessonHours" class="stat-item">
                    <el-icon><Timer /></el-icon>
                    课时: {{ courseData.lessonHours }} 小时
                  </span>
              </div>
            </div>
          </div>
          <div class="course-actions">
            <el-button type="primary" @click="handleViewCourseGraph">
              <el-icon><Connection /></el-icon>
              查看课程知识图谱
            </el-button>
            <el-button type="success" @click="handleBatchManage">
              <el-icon><Setting /></el-icon>
              批量管理关系
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['knowledge:knowledge:add']"
        >新增知识点</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['knowledge:knowledge:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['knowledge:knowledge:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['knowledge:knowledge:export']"
        >导出知识点</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="info"
            plain
            icon="Upload"
            @click="handleImport"
            v-hasPermi="['knowledge:knowledge:import']"
        >导入知识点</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Sort"
            @click="handleViewTree"
            :disabled="!knowledgeTreeOptions.length"
        >查看知识树</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="knowledgeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="知识点名称" align="center" prop="knowledgeName" width="180">
        <template #default="scope">
          <div class="knowledge-name-cell">
            <span class="name-text">{{ scope.row.knowledgeName }}</span>
            <span v-if="scope.row.knowledgeCode" class="code-badge">{{ scope.row.knowledgeCode }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="所属章节" align="center" prop="chapterName" width="150" />
      <el-table-column label="难度" align="center" prop="difficultyLevel" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.difficultyLevel === 'easy' ? 'success' :
                         scope.row.difficultyLevel === 'medium' ? 'warning' : 'danger'">
            {{ scope.row.difficultyLevel === 'easy' ? '简单' :
              scope.row.difficultyLevel === 'medium' ? '中等' : '困难' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="关键词" align="center" prop="keywords" width="180">
        <template #default="scope">
          <div class="keywords-display">
            <el-tooltip
                v-if="scope.row.keywords && scope.row.keywords.split(',').length > 2"
                :content="scope.row.keywords"
                placement="top"
            >
              <span>{{ getShortKeywords(scope.row.keywords) }}</span>
            </el-tooltip>
            <span v-else>{{ scope.row.keywords || '-' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'" >
            {{ scope.row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['knowledge:knowledge:edit']" title="修改"></el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['knowledge:knowledge:remove']" title="删除"></el-button>
          <el-button link type="success" icon="Connection" @click="handleViewKnowledgeGraph(scope.row)" title="查看关联图谱"></el-button>
          <el-button link type="warning" icon="Document" @click="handleViewDetail(scope.row)" title="查看详情"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="kgform" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="知识点名称" prop="knowledgeName">
          <el-input v-model="form.knowledgeName" placeholder="请输入知识点名称" />
        </el-form-item>
        <el-form-item label="知识点编码" prop="knowledgeCode">
          <el-input v-model="form.knowledgeCode" placeholder="请输入知识点编码" />
        </el-form-item>
        <el-form-item label="所属章节" prop="chapterId">
          <el-select v-model="form.chapterId" placeholder="请选择章节" style="width: 100%">
            <el-option
                v-for="item in chapterOptions"
                :key="item.chapterId"
                :label="item.chapterName"
                :value="item.chapterId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="父知识点" prop="parentId">
          <el-tree-select
              v-model="form.parentId"
              :data="knowledgeTreeOptions"
              check-strictly
              :render-after-expand="false"
              placeholder="请选择父知识点"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="难度等级" prop="difficultyLevel">
          <el-select v-model="form.difficultyLevel" placeholder="请选择难度等级" style="width: 100%">
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词" prop="keywords">
          <el-input v-model="form.keywords" placeholder="请输入关键词，多个用逗号分隔" />
        </el-form-item>
        <el-form-item label="知识点内容" prop="content">
          <Editor v-model="form.content" :min-height="192" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注信息" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 知识图谱对话框 -->
    <el-dialog v-model="graphOpen" width="90%" top="5vh" append-to-body>
      <div style="height: 80vh;">
        <KnowledgeGraph :graphData="graphData" v-if="graphOpen" />
      </div>
    </el-dialog>

    <!-- 知识点详情对话框 -->
    <el-dialog v-model="detailOpen" title="知识点详情" width="600px" append-to-body>
      <div v-if="currentKnowledge" class="knowledge-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="知识点名称">{{ currentKnowledge.knowledgeName }}</el-descriptions-item>
          <el-descriptions-item label="知识点编码">{{ currentKnowledge.knowledgeCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="所属章节">{{ currentKnowledge.chapterName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="难度">
            <el-tag :type="currentKnowledge.difficultyLevel === 'easy' ? 'success' :
                         currentKnowledge.difficultyLevel === 'medium' ? 'warning' : 'danger'">
              {{ currentKnowledge.difficultyLevel === 'easy' ? '简单' :
                currentKnowledge.difficultyLevel === 'medium' ? '中等' : '困难' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="关键词">{{ currentKnowledge.keywords || '-' }}</el-descriptions-item>
          <el-descriptions-item label="知识点内容">
            <div v-html="currentKnowledge.content" class="knowledge-content" v-if="currentKnowledge.content"></div>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ parseTime(currentKnowledge.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ parseTime(currentKnowledge.updateTime) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ currentKnowledge.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog v-model="importOpen" title="导入知识点" width="500px" append-to-body>
      <div class="import-container">
        <el-alert
            title="支持导入Excel格式的知识点数据"
            type="info"
            show-icon
            style="margin-bottom: 20px;"
        />

        <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
            accept=".xlsx,.xls"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              仅支持导入Excel文件，请确保文件格式正确
            </div>
          </template>
        </el-upload>

        <div class="template-download">
          <a href="#" @click.prevent="downloadTemplate" class="template-link">
            <el-icon><Download /></el-icon> 下载导入模板
          </a>
        </div>
      </div>

      <template #footer>
           <span class="dialog-footer">
             <el-button @click="importOpen = false">取消</el-button>
             <el-button type="primary" @click="handleImportSubmit">开始导入</el-button>
           </span>
      </template>
    </el-dialog>

    <!-- 知识树对话框 -->
    <el-dialog v-model="treeOpen" title="课程知识树" width="700px" append-to-body>
      <div class="knowledge-tree-container">
        <el-tree
            :data="knowledgeTreeOptions"
            :props="{ label: 'knowledgeName', children: 'children' }"
            node-key="knowledgeId"
            default-expand-all
            :expand-on-click-node="false"
        >
          <template #default="{ node, data }">
               <span class="custom-tree-node">
                 <span>{{ node.label }}</span>
                 <span class="tree-node-actions">
                   <el-button link type="primary" size="small" @click="() => handleUpdate(data)">编辑</el-button>
                   <el-button link type="danger" size="small" @click="() => handleDelete(data)">删除</el-button>
                 </span>
               </span>
          </template>
        </el-tree>
      </div>
    </el-dialog>

  </div>
</template>

<script setup name="Knowledge">
import {
  addKnowledge,
  delKnowledge,
  getKnowledge,
  getKnowledgeGraphByCourseId,
  listKnowledge,
  updateKnowledge
} from "@/api/edu/knowledge.js";
import KnowledgeGraph from "@/components/Knowledge/knowledgeGraph.vue";
import {treeSelect} from "@/api/edu/tree.js";
import {listChapter} from "@/api/system/chapter.js";
import { Collection, Connection, Setting, Timer, UploadFilled, Download } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const props = defineProps({
  courseData: {
    type: Object,
    required: true,
    default: () => ({
      courseId: '',
      courseName: '',
      courseDesc: '',
      courseImg: '',
      lessonHours: 0
    })
  }
})

// 响应式数据
const knowledgeList = ref([]);
const chapterOptions = ref([]);
const knowledgeTreeOptions = ref([]);// 知识点树选项
const open = ref(false);
const graphOpen = ref(false);
const detailOpen = ref(false);
const importOpen = ref(false);
const treeOpen = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const graphData = ref({});
const currentKnowledge = ref({});
const defaultCourseImg = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
const uploadFile = ref(null);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    courseId: '', // 从props中获取
    knowledgeName: undefined,
    chapterId: undefined,
    difficultyLevel: undefined,
    status: undefined
  },
  rules: {
    knowledgeName: [
      { required: true, message: "知识点名称不能为空", trigger: "blur" }
    ],
    chapterId: [
      { required: true, message: "所属章节不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 监听courseData变化
watch(() => props.courseData, (newVal) => {
  if (newVal.courseId) {
    queryParams.value.courseId = newVal.courseId;
    form.value.courseId = newVal.courseId;
    initData();
  }
}, { immediate: true, deep: true });

/** 初始化数据 */
function initData() {
  if (!queryParams.value.courseId) return;

  // 获取章节列表
  getChapterList();

  // 获取知识点列表
  getList();

  // 获取知识点树结构
  getKnowledgeTree();
}

/** 查询知识点列表 */
function getList() {
  loading.value = true;
  listKnowledge(queryParams.value).then(response => {
    knowledgeList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  }).catch(error => {
    console.error('获取知识点列表失败:', error);
    loading.value = false;
  });
}

/** 获取章节列表 */
function getChapterList() {
  if (!queryParams.value.courseId) return;

  listChapter({ courseId: queryParams.value.courseId }).then(response => {
    chapterOptions.value = response.rows;
  }).catch(error => {
    console.error('获取章节列表失败:', error);
  });
}

/** 获取知识点树结构 */
function getKnowledgeTree() {
  if (!queryParams.value.courseId) return;

  treeSelect({ courseId: queryParams.value.courseId }).then(response => {
    knowledgeTreeOptions.value = response.data || [];
  }).catch(error => {
    console.error('获取知识点树失败:', error);
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    knowledgeId: undefined,
    knowledgeName: undefined,
    knowledgeCode: undefined,
    courseId: queryParams.value.courseId,
    chapterId: undefined,
    content: undefined,
    difficultyLevel: "medium",
    keywords: undefined,
    parentId: 0,
    status: "0",
    remark: undefined
  };
  proxy.resetForm("kgform");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  // 保留课程ID
  queryParams.value = {
    ...queryParams.value,
    pageNum: 1,
    knowledgeName: undefined,
    chapterId: undefined,
    difficultyLevel: undefined,
    status: undefined
  };
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.knowledgeId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加知识点";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const knowledgeId = row.knowledgeId || ids.value[0];
  getKnowledge(knowledgeId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改知识点";
  }).catch(error => {
    console.error('获取知识点详情失败:', error);
    proxy.$modal.msgError('获取知识点详情失败');
  });
}

/** 提交表单 */
function submitForm() {
  proxy.$refs["kgform"].validate(valid => {
    if (valid) {
      // 确保表单中有课程ID
      if (!form.value.courseId) {
        form.value.courseId = queryParams.value.courseId;
      }

      if (form.value.knowledgeId !== undefined) {
        updateKnowledge(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
          getKnowledgeTree();
        }).catch(error => {
          console.error('更新知识点失败:', error);
          proxy.$modal.msgError('更新失败');
        });
      } else {
        addKnowledge(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
          getKnowledgeTree();
        }).catch(error => {
          console.error('新增知识点失败:', error);
          proxy.$modal.msgError('新增失败');
        });
      }
    }
  });
}

/** 查看知识点详情 */
function handleViewDetail(row) {
  getKnowledge(row.knowledgeId).then(response => {
    currentKnowledge.value = response.data;
    detailOpen.value = true;
  }).catch(error => {
    console.error('获取知识点详情失败:', error);
    proxy.$modal.msgError('获取详情失败');
  });
}

/** 查看单个知识点图谱 */
function handleViewKnowledgeGraph(row) {
  getKnowledgeGraphByCourseId(queryParams.value.courseId, row.knowledgeId).then(response => {
    graphData.value = response.data;
    graphOpen.value = true;
  }).catch(error => {
    console.error('获取知识图谱失败:', error);
    proxy.$modal.msgError('获取知识图谱失败');
  });
}

/** 查看课程知识图谱 */
function handleViewCourseGraph() {
  getKnowledgeGraphByCourseId(queryParams.value.courseId).then(response => {
    graphData.value = response.data;
    graphOpen.value = true;
  }).catch(error => {
    console.error('获取课程知识图谱失败:', error);
    proxy.$modal.msgError('获取课程知识图谱失败');
  });
}

/** 批量管理关系 */
function handleBatchManage() {
  proxy.$modal.msgInfo('批量管理功能开发中');
}

/** 查看知识树 */
function handleViewTree() {
  treeOpen.value = true;
}

/** 导入知识点 */
function handleImport() {
  importOpen.value = true;
}

/** 处理文件选择 */
function handleFileChange(file) {
  uploadFile.value = file.raw;
}

/** 提交导入 */
function handleImportSubmit() {
  if (!uploadFile.value) {
    proxy.$modal.msgWarning('请选择要导入的文件');
    return;
  }

  const formData = new FormData();
  formData.append('file', uploadFile.value);
  formData.append('courseId', queryParams.value.courseId);

  // 这里调用导入API
  proxy.$modal.msgInfo('导入功能开发中');
  // proxy.$http.post('/knowledge/import', formData).then(response => {
  //   proxy.$modal.msgSuccess('导入成功');
  //   importOpen.value = false;
  //   getList();
  //   getKnowledgeTree();
  // }).catch(error => {
  //   console.error('导入失败:', error);
  //   proxy.$modal.msgError('导入失败');
  // });
}

/** 下载模板 */
function downloadTemplate() {
  proxy.download('/knowledge/template', {}, '知识点导入模板.xlsx');
}

/** 删除按钮操作 */
function handleDelete(row) {
  const knowledgeIds = row.knowledgeId || ids.value;
  if (knowledgeIds.length === 0) {
    proxy.$modal.msgWarning('请选择要删除的数据');
    return;
  }

  proxy.$modal.confirm('是否确认删除选中的知识点？').then(function() {
    return delKnowledge(knowledgeIds);
  }).then(() => {
    getList();
    getKnowledgeTree();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  if (!queryParams.value.courseId) {
    proxy.$modal.msgWarning('请选择课程');
    return;
  }

  proxy.download('knowledge/knowledge/export', {
    ...queryParams.value
  }, `知识点_${props.courseData.courseName}_${new Date().getTime()}.xlsx`);
}

/** 获取简短的关键词显示 */
function getShortKeywords(keywords) {
  if (!keywords) return '-';
  const keywordArray = keywords.split(',');
  if (keywordArray.length <= 2) {
    return keywords;
  }
  return `${keywordArray.slice(0, 2).join(',')}...`;
}
</script>

<style scoped>
.course-info-card {
  margin-bottom: 20px;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.course-left {
  display: flex;
  gap: 20px;
  flex: 1;
}

.course-img {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
}

.course-info h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #303133;
}

.course-desc {
  margin: 0 0 15px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.course-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #909399;
  font-size: 14px;
}

.course-actions {
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.knowledge-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-text {
  font-weight: 500;
}

.code-badge {
  background: #f0f9ff;
  color: #409eff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid #d9ecff;
}

.keywords-display {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.knowledge-detail {
  padding: 10px;
}

.knowledge-content {
  line-height: 1.6;
  color: #606266;
}

.knowledge-content :deep(p) {
  margin: 8px 0;
}

.knowledge-content :deep(ul) {
  padding-left: 20px;
}

.import-container {
  padding: 10px;
}

.template-download {
  margin-top: 20px;
  text-align: center;
}

.template-link {
  color: #409eff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.template-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.knowledge-tree-container {
  max-height: 500px;
  overflow-y: auto;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
}

.tree-node-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.custom-tree-node:hover .tree-node-actions {
  opacity: 1;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 180px;
}

:deep(.el-tree) {
  background: transparent;
}

:deep(.el-tree-node__content) {
  height: 36px;
}
</style>