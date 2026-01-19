<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="Name" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="Please enter Queston Bank Name"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Teacher" prop="teacherId">
        <el-input
          v-model="queryParams.teacherId"
          placeholder="Please enter Teacher ID"
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
          v-hasPermi="['system:bank:add']"
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
          v-hasPermi="['system:bank:edit']"
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
          v-hasPermi="['system:bank:remove']"
        >Delete</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:bank:export']"
        >Export</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="bankList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="Name" align="center" prop="name" />
      <el-table-column label="Description" align="center" prop="description" />
      <el-table-column label="Teacher Name" align="center" prop="teacherName" />
      <el-table-column label="Teacher ID" align="center" prop="teacherId" />
      <el-table-column label="Remark" align="center" prop="remark" />
      <el-table-column label="Operation" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:bank:edit']"
          >Modify</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:bank:remove']"
          >Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- Add or Modify Question Bank Dialog -->

  </div>
</template>

<script>
import { listBank, getBank, delBank, addBank, updateBank, exportBank } from "@/api/edu/questionBank";

export default {
  name: "Bank",
  data() {
    return {
      // Loading
      loading: true,
      // Selection array
      ids: [],
      // Single selection
      single: true,
      // Multiple selection
      multiple: true,
      // Show search
      showSearch: true,
      // Total count
      total: 0,
      // Bank table data
      bankList: [],
      // Title
      title: "",
      // Dialog open
      open: false,
      // Query params
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        teacherId: null,
      },
      // Form params
      form: {},
      optionsList: [],
      tagsArray: [],
      answerArray: [],
      // Validation rules
      rules: {
        type: [
          { required: true, message: "题目类型不能为空", trigger: "change" }
        ],
        content: [
          { required: true, message: "题目内容不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    handleTypeChange() {
        this.form.answer = ''
        this.answerArray = []
    },
    /** List Query */
    getList() {
      this.loading = true;
      listBank(this.queryParams).then(response => {
        this.bankList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // Cancel
    cancel() {
      this.open = false;
      this.reset();
    },
    // Reset Form
    reset() {
      this.form = {
        id: null,
        name: null,
        description: null,
        teacherId: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null,
        type: null,
        content: null,
        options: null,
        answer: null,
        analysis: null,
        tags: null,
      };
      this.optionsList = [];
      this.tagsArray = [];
      this.answerArray = [];
      this.resetForm("form");
    },
    /** Search Button */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** Reset Button */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // Selection Change
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** Add Button */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "Add Question Bank";
    },
    /** Update Button */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getBank(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "Modify Question Bank";
      });
    },
    /** Submit Form */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateBank(this.form).then(response => {
              this.$modal.msgSuccess("Modification Successful");
              this.open = false;
              this.getList();
            });
          } else {
            addBank(this.form).then(response => {
              this.$modal.msgSuccess("Add Successful");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** Delete Button */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('Are you sure to delete Question Bank Number "' + ids + '"?').then(function() {
        return delBank(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("Deletion Successful");
      }).catch(() => {});
    },
    /** Export Button */
    handleExport() {
      const queryParams = this.queryParams;
      this.$modal.confirm('Are you sure to export all Question Bank data?').then(() => {
        this.exportLoading = true;
        return exportBank(queryParams);
      }).then(response => {
        this.$download.name(response.msg);
        this.exportLoading = false;
      }).catch(() => {});
    }
  }
};
</script>

<style scoped lang="scss">
.question-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 30px;
  }
}

.question-form-container {
  .form-section {
    margin-bottom: 25px;
    
    .section-header {
      font-size: 14px;
      font-weight: bold;
      color: #303133;
      margin-bottom: 15px;
      padding-left: 8px;
      border-left: 3px solid #409EFF;
      line-height: 1;
    }
  }

  .options-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    
    .option-item-row {
      display: flex;
      align-items: center;
      gap: 10px;
      
      .option-key {
        width: 30px;
        height: 30px;
        background: #f4f4f5;
        color: #909399;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-weight: bold;
        flex-shrink: 0;
      }
      
      .option-input {
        flex: 1;
      }
    }
  }
}
</style>
