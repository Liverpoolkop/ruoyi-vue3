<style lang="scss" scoped>
.question-management {
    padding: 20px;
    background-color: #f0f2f5;
    min-height: calc(100vh - 84px);
    
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 20px;
      background: #fff;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,21,41,.08);
    
      .search-group {
          display: flex;
          gap: 12px;
          flex: 1;
          max-width: 600px;
          
          .search-input {
              flex: 2;
              ::v-deep .el-input__inner {
                  border-radius: 20px;
                  background-color: #f5f7fa;
                  border: none;
              }
          }
          .type-select {
              flex: 1;
              ::v-deep .el-input__inner {
                  border-radius: 20px;
                  background-color: #f5f7fa;
                  border: none;
              }
          }
          .search-btn {
              border-radius: 20px;
              padding: 0 24px;
              background-color: #409EFF;
              border-color: #409EFF;
              font-weight: 500;
              &:hover {
                background-color: #66b1ff;
                border-color: #66b1ff;
              }
          }
      }
    
      .action-group {
          display: flex;
          gap: 12px;
          
          .add-btn {
              border-radius: 20px;
              background-color: #36cfc9;
              border-color: #36cfc9;
              box-shadow: 0 4px 12px rgba(54, 207, 201, 0.2);
              padding: 0 20px;
              font-weight: 500;
              &:hover { 
                background-color: #5cdbd3;
                border-color: #5cdbd3;
                transform: translateY(-1px); 
                box-shadow: 0 6px 16px rgba(54, 207, 201, 0.3); 
              }
          }
          
          .el-button-group {
              .el-button {
                  background: #f4f4f5;
                  border-color: #f4f4f5;
                  color: #606266;
                  padding: 10px 20px;
                  &:hover {
                    color: #409EFF;
                    background-color: #e9e9eb;
                    border-color: #e9e9eb;
                  }
                  &:first-child { border-top-left-radius: 20px; border-bottom-left-radius: 20px; }
                  &:last-child { border-top-right-radius: 20px; border-bottom-right-radius: 20px; }
              }
          }
      }
    }
    
    .custom-table {
        border-radius: 8px;
        box-shadow: 0 1px 4px rgba(0,21,41,.08);
        
        ::v-deep th {
            background-color: #fafafa !important;
            height: 50px;
        }
    }
}

.question-info-cell {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px 0;
    
    .type-badge {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .content-text {
        font-size: 14px;
        color: #303133;
        line-height: 1.5;
        
        ::v-deep p { margin: 0; }
        ::v-deep img { max-height: 40px; margin: 4px 0; }
    }
}

.answer-text {
    font-family: 'Monaco', 'Menlo', monospace;
    font-weight: 700;
    color: #1890ff;
    background: #e6f7ff;
    padding: 4px 10px;
    border-radius: 4px;
}

.pagination-container {
    background: #fff;
    padding: 16px;
    margin-top: 20px;
    border-radius: 8px;
    text-align: right;
    box-shadow: 0 1px 4px rgba(0,21,41,.08);
}

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

.custom-upload {
    ::v-deep .el-upload-dragger { width: 100%; }
}
</style>
