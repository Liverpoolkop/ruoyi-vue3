<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="Title" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="Please enter Title"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">Search</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">Reset</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:homework:add']"
        >Add</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:homework:edit']"
        >Modify</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:homework:remove']"
        >Delete</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <div v-loading="loading" class="homework-list">
      <div v-for="item in homeworkList" :key="item.id" class="homework-card">
        <div class="card-left">
          <el-checkbox v-model="ids" :label="item.id" @change="handleCheckboxChange"></el-checkbox>
        </div>
        <div class="card-content">
          <div class="card-header">
             <el-tag v-if="new Date() > new Date(item.deadline)" type="danger" effect="dark" class="status-tag">已截止</el-tag>
             <el-tag v-else type="success" effect="dark" class="status-tag">进行中</el-tag>
             <span class="homework-title">{{ item.title }}</span>
          </div>
          <div class="card-info">
             <span class="info-item user-info">{{ item.createBy }}</span>
             <!-- Mocked counts as they are not in the API yet -->
             <span class="info-item">未做题 -人 已做题 -人</span>
             
             <span class="info-item">发布时间 {{ parseTime(item.startTime) }}</span>
             <span class="info-item">截止时间 {{ parseTime(item.deadline) }}</span>
             <!-- <span class="info-item">补交时间 {{ parseTime(item.deadline) }}</span> -->
          </div>
        </div>
        <div class="card-actions">
           <el-dropdown trigger="click">
              <span class="el-dropdown-link">
                  <i class="el-icon-more el-icon--right"></i>
                  更多
                  <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item icon="el-icon-edit" @click.native="handleUpdate(item)" v-hasPermi="['system:homework:edit']">Modify</el-dropdown-item>
                  <el-dropdown-item icon="el-icon-delete" @click.native="handleDelete(item)" v-hasPermi="['system:homework:remove']">Delete</el-dropdown-item>
                  <el-dropdown-item icon="el-icon-s-check" @click.native="handleSubmissions(item)" v-hasPermi="['system:homework:query']">Submissions</el-dropdown-item>
                  <el-dropdown-item icon="el-icon-upload" @click.native="handleSubmit(item)" v-hasPermi="['system:submission:add']">Submit</el-dropdown-item>
              </el-dropdown-menu>
           </el-dropdown>
        </div>
      </div>
      <el-empty v-if="!loading && homeworkList.length === 0" description="No Data"></el-empty>
    </div>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- Add or Modify Homework Dialog -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Title" prop="title">
          <el-input v-model="form.title" placeholder="Please enter Title" />
        </el-form-item>
        <el-form-item label="Content" prop="content">
          <editor v-model="form.content" :min-height="192"/>
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Please enter Remark" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">OK</el-button>
        <el-button @click="cancel">Cancel</el-button>
      </div>
    </el-dialog>

    <!-- Student Submit Dialog -->
    <el-dialog title="Submit Homework" :visible.sync="submitOpen" width="600px" append-to-body>
      <el-form ref="submitForm" :model="submitForm" :rules="submitRules" label-width="80px">
        <el-form-item label="Content" prop="content">
           <editor v-model="submitForm.content" :min-height="192"/>
        </el-form-item>
        <el-form-item label="File" prop="fileUrl">
           <file-upload v-model="submitForm.fileUrl"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitSubmission">Submit</el-button>
        <el-button @click="submitOpen = false">Cancel</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listHomework, getHomework, delHomework, addHomework, updateHomework } from "@/api/edu/homework";
import { addSubmission } from "@/api/edu/submission";
import Editor from '@/components/Editor';
import FileUpload from '@/components/FileUpload';

export default {
  name: "Homework",
  components: { Editor, FileUpload },
  data() {
    return {
      // Loading
      loading: true,
      // Selection
      ids: [],
      single: true,
      multiple: true,
      // Search
      showSearch: true,
      // Total
      total: 0,
      // Data
      homeworkList: [],
      // Title
      title: "",
      // Dialog
      open: false,
      // Submit Dialog
      submitOpen: false,
      // Query
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: null,
      },
      // Form
      form: {},
      // Submit Form
      submitForm: {},
      // Rules
      rules: {
        title: [
          { required: true, message: "Title cannot be empty", trigger: "blur" }
        ],
        content: [
          { required: true, message: "Content cannot be empty", trigger: "blur" }
        ]
      },
      submitRules: {
        content: [
          { required: true, message: "Content cannot be empty", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      listHomework(this.queryParams).then(response => {
        this.homeworkList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    cancel() {
      this.open = false;
      this.reset();
    },
    reset() {
      this.form = {
        id: null,
        title: null,
        content: null,
        remark: null
      };
      this.resetForm("form");
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleCheckboxChange() {
      this.single = this.ids.length !== 1;
      this.multiple = !this.ids.length;
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "Add Homework";
    },
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getHomework(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "Modify Homework";
      });
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateHomework(this.form).then(response => {
              this.$modal.msgSuccess("Modification Successful");
              this.open = false;
              this.getList();
            });
          } else {
            addHomework(this.form).then(response => {
              this.$modal.msgSuccess("Add Successful");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('Are you sure to delete Homework "' + ids + '"?').then(function() {
        return delHomework(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("Deletion Successful");
      }).catch(() => {});
    },
    // View Submissions (Teacher)
    handleSubmissions(row) {
      this.$router.push("/edu/homework/submission/" + row.id);
    },
    // Submit (Student)
    handleSubmit(row) {
        this.submitForm = {
            homeworkId: row.id,
            content: '',
            fileUrl: ''
        };
        this.submitOpen = true;
    },
    submitSubmission() {
         this.$refs["submitForm"].validate(valid => {
            if(valid) {
                addSubmission(this.submitForm).then(response => {
                    this.$modal.msgSuccess("Submission Successful");
                    this.submitOpen = false;
                });
            }
         });
    }
  }
};
</script>

<style scoped lang="scss">
.homework-list {
  background: #fff;
  padding: 10px;
}
.homework-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s;
  &:hover {
    background-color: #fafafa;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  }
}
.card-left {
  margin-right: 20px;
}
.card-content {
  flex: 1;
}
.card-header {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}
.status-tag {
  margin-right: 10px;
  border-radius: 12px;
  padding: 0 15px;
  height: 24px;
  line-height: 24px;
}
.homework-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.card-info {
  font-size: 13px;
  color: #999;
  display: flex;
  flex-wrap: wrap;
}
.info-item {
  margin-right: 20px;
}
.user-info {
  color: #666;
  font-weight: 500;
}
.card-actions {
  margin-left: 20px;
}
.el-dropdown-link {
  cursor: pointer;
  color: #909399;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  i {
     font-size: 16px;
     margin-bottom: 4px;
  }
}
</style>
