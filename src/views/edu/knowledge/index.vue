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
        <el-form-item label="课程" prop="courseId">
          <el-select v-model="queryParams.courseId" placeholder="请选择课程" clearable style="width: 200px">
            <el-option
                v-for="item in courseOptions"
                :key="item.courseId"
                :label="item.courseName"
                :value="item.courseId"
            />
          </el-select>
        </el-form-item>
         <el-form-item label="章节" prop="chapterId">
            <el-select v-model="queryParams.chapterId" placeholder="请先选择课程" :disabled="!queryParams.courseId" clearable style="width: 200px">
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
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['knowledge:knowledge:add']"
            >新增</el-button>
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
            >导出</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="knowledgeList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="知识点名称" align="center" prop="knowledgeName" />
         <el-table-column label="课程" align="center" prop="courseName" />
         <el-table-column label="章节" align="center" prop="chapterName" />
         <el-table-column label="难度" align="center" prop="difficultyLevel">
            <template #default="scope">
              <el-tag :type="scope.row.difficultyLevel === 'easy' ? 'success' :
                         scope.row.difficultyLevel === 'medium' ? 'warning' : 'danger'">
                {{ scope.row.difficultyLevel === 'easy' ? '简单' :
                  scope.row.difficultyLevel === 'medium' ? '中等' : '困难' }}
              </el-tag>
            </template>
         </el-table-column>
         <el-table-column label="关键词" align="center" prop="keywords" width="180"/>
        <el-table-column label="状态" align="center" prop="status">
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
         <el-table-column label="操作" width="180" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['knowledge:knowledge:edit']">修改</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['knowledge:knowledge:remove']">删除</el-button>
               <el-button link type="primary" icon="Connection" @click="handleViewGraph(scope.row)" >查看图谱</el-button>
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
      <el-dialog :title="title" v-model="open" width="500px" append-to-body>
         <el-form ref="kgform" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="知识点名称" prop="knowledgeName">
               <el-input v-model="form.knowledgeName" placeholder="请输入知识点名称" />
            </el-form-item>
            <el-form-item label="知识点编码" prop="knowledgeCode">
               <el-input v-model="form.knowledgeCode" placeholder="请输入知识点编码" />
            </el-form-item>
            <el-form-item label="所属课程" prop="courseId">
             <el-select v-model="form.courseId" placeholder="请选择课程" @change="handleCourseChange">
               <el-option
                   v-for="item in courseOptions"
                   :key="item.courseId"
                   :label="item.courseName"
                   :value="item.courseId"
               />
             </el-select>
            </el-form-item>
            <el-form-item label="所属章节" prop="chapterId">
             <el-select v-model="form.chapterId" placeholder="请先选择课程" :disabled="!form.courseId">
               <el-option
                   v-for="item in chapterOptions"
                   :key="item.chapterId"
                   :label="item.chapterName"
                   :value="item.chapterId"
               />
             </el-select>
            </el-form-item>
            <el-form-item label="父知识点" prop="parentId">
             <ElTreeSelect
                 v-model="form.parentId"
                 :options="knowledgeTreeOptions"
                 :normalizer="normalizer"
                 placeholder="请选择父知识点"
                 style="width: 100%"
             />
            </el-form-item>
            <el-form-item label="难度等级" prop="difficultyLevel">
             <el-select v-model="form.difficultyLevel" placeholder="请选择难度等级">
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
               <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
} from "@/api/knowledge/knowledge.js";
import KnowledgeGraph from "@/components/Knowledge/knowledgeGraph.vue";
import {listChapter} from "@/api/knowledge/chapter.js";
import {treeSelect} from "@/api/knowledge/tree.js";
import {listCourse} from "@/api/knowledge/course.js";

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const knowledgeList = ref([]);
const chapterOptions = ref([]);
const courseOptions = ref([]);
const knowledgeTreeOptions = ref([]);// 知识点树选项
const open = ref(false);
const loading = ref(true);// 遮罩层
const showSearch = ref(true);
const ids = ref([]);// 选中数组
const single = ref(true);// 非单个禁用
const multiple = ref(true);// 非多个禁用
const total = ref(0);
const title = ref("");

const graphData=ref({});// 知识图谱数据
const graphOpen= ref(false);// 是否显示知识图谱弹出层

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    knowledgeName: undefined,
    courseId: undefined,
    chapterId: undefined,
    knowledgeId: undefined,
    difficultyLevel: undefined,
    parentId: 0,
    status: undefined
  },
  rules: {
    knowledgeName: [
      { required: true, message: "知识点名称不能为空", trigger: "blur" }
    ],
    courseId: [
      { required: true, message: "所属课程不能为空", trigger: "blur" }
    ],
    chapterId: [
      { required: true, message: "所属章节不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

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
    courseId: undefined,
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
  handleQuery();
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.knowledgeId);
  single.value = selection.length != 1;
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
  const knowledgeId = row.knowledgeId || ids.value;
  getKnowledge(knowledgeId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改知识点";
    handleCourseChange(form.value.courseId);
    getKnowledgeTree();
  });
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs["kgform"].validate(valid => {
    if (valid) {
      if (form.value.knowledgeId !== undefined) {
        updateKnowledge(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addKnowledge(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 状态修改 */
function handleStatusChange(value,row) {
  const text = value === "0" ? "启用" : "停用";
  proxy.$modal.confirm('确认要' + text + '"' + row.knowledgeName + '"吗？').then(function() {
    return updateKnowledge(row);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function() {
    row.status = row.status === "0" ? "1" : "0";
  });
}
/** 查看知识图谱 */
function handleViewGraph(row) {
  getKnowledgeGraphByCourseId(row.courseId).then(response => {
    graphData.value = response.data;
    graphOpen.value = true;
    console.log(graphOpen);
  });
}
/** 查询课程列表 */
function getCourseList() {
  listCourse().then(response => {
    courseOptions.value = response.rows;
  });
}
/** 课程变化时查询章节列表 */
/** 课程变化时处理 */
function handleCourseChange(courseId) {
  console.log('课程变化，courseId:', courseId)

  // 清空章节选择
  form.value.chapterId = undefined

  // 清空章节选项
  chapterOptions.value = []

  // 清空知识点树选项
  knowledgeTreeOptions.value = []

  // 如果有课程ID，获取该课程的章节
  if (courseId) {
    // 获取章节列表
    listChapter({ courseId }).then(response => {
      chapterOptions.value = response.rows
      console.log('获取到章节列表:', chapterOptions.value)
    }).catch(error => {
      console.error('获取章节失败:', error)
    })
  }
}
function getChapterList() {
  let courseId = queryParams.courseId;
  listChapter({ courseId }).then(response => {
    chapterOptions.value = response.rows;
  });
}
/** 查询知识点树结构 */
function getKnowledgeTree() {
  treeSelect({ courseId: form.courseId }).then(response => {
    knowledgeTreeOptions.value = response.data;
  });
}
/** 转换知识点数据结构 */
function normalizer(node) {
  return {
    id: node.knowledgeId,
    label: node.knowledgeName,
    children: node.children
  };
 }
/** 打开搜索对话框 */
function openSearchDialog() {
  searchOpen.value = true;
  searchKeyword.value = "";
  searchResult.value = [];
}
/** 执行搜索 */
function handleSearch() {
  if (!searchKeyword.value.trim()) {
    proxy.$modal.msgWarning("请输入搜索关键词");
    return;
  }
  searchLoading.value = true;
  searchKnowledge(searchKeyword.value).then(response => {
    searchResult.value = response.data;
    searchLoading.value = false;
  });
}

/** 选择知识点 */
function handleSelectKnowledge(row) {
  proxy.$emit('select-knowledge', row);
  searchOpen.value = false;
}

/** 删除按钮操作 */
function handleDelete(row) {
  const knowledgeIds = row.knowledgeId || ids.value;
  proxy.$modal.confirm('是否确认删除知识点编号为"' + knowledgeIds + '"的数据项？').then(function() {
    return delKnowledge(knowledgeIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download('knowledge/knowledge/export', {
    ...queryParams.value
  }, `knowledge_${new Date().getTime()}.xlsx`)
}

getList();
getCourseList()
getChapterList();
</script>
