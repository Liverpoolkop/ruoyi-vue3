<template>
  <div>
    <el-button
        type="primary"
        icon="el-icon-connection"
        size="mini"
        @click="openAssociationDialog"
    >
      关联知识点
    </el-button>

    <!-- 已关联知识点展示 -->
    <div v-if="relatedKnowledge.length > 0" class="knowledge-tags">
      <el-tag
          v-for="knowledge in relatedKnowledge"
          :key="knowledge.knowledgeId"
          type="info"
          closable
          @close="removeAssociation(knowledge.knowledgeId)"
      >
        {{ knowledge.knowledgeName }}
      </el-tag>
    </div>

    <!-- 关联知识点对话框 -->
    <el-dialog
        title="关联知识点"
        :visible.sync="associationDialogVisible"
        width="80%"
        append-to-body
    >
      <div class="association-container">
        <div class="left-panel">
          <el-input
              v-model="searchKeyword"
              placeholder="搜索知识点"
              clearable
              @keyup.enter="searchKnowledge"
              style="margin-bottom: 10px;"
          >
            <el-button slot="append" icon="el-icon-search" @click="searchKnowledge"></el-button>
          </el-input>

          <el-tree
              ref="knowledgeTree"
              :data="knowledgeTreeData"
              :props="treeProps"
              node-key="knowledgeId"
              show-checkbox
              default-expand-all
              :default-checked-keys="defaultCheckedKeys"
              @check-change="handleCheckChange"
          >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span>{{ node.label }}</span>
              <span class="tree-node-tag">
                <el-tag size="mini" :type="getDifficultyTagType(data.difficultyLevel)">
                  {{ getDifficultyText(data.difficultyLevel) }}
                </el-tag>
              </span>
            </span>
          </el-tree>
        </div>

        <div class="right-panel">
          <div class="selected-header">
            <span>已选择的知识点（{{ selectedKnowledge.length }}）</span>
            <el-button type="text" @click="clearAll">清空</el-button>
          </div>
          <div class="selected-list">
            <el-tag
                v-for="item in selectedKnowledge"
                :key="item.knowledgeId"
                closable
                @close="removeSelected(item.knowledgeId)"
            >
              {{ item.knowledgeName }}
            </el-tag>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="associationDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveAssociation">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getKnowledgeTree, associateKnowledge, getRelatedKnowledge } from "@/api/knowledge/knowledge.js";
import { searchKnowledge } from "@/api/knowledge/search";

export default {
  name: 'KnowledgeAssociation',
  props: {
    resourceType: {
      type: String,
      required: true,
      validator: value => ['homework', 'question', 'experiment'].includes(value)
    },
    resourceId: {
      type: Number,
      required: true
    },
    courseId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      // 对话框显示
      associationDialogVisible: false,
      // 搜索关键词
      searchKeyword: '',
      // 知识点树数据
      knowledgeTreeData: [],
      // 已关联的知识点
      relatedKnowledge: [],
      // 选中的知识点
      selectedKnowledge: [],
      // 默认选中的节点
      defaultCheckedKeys: [],
      // 树配置
      treeProps: {
        children: 'children',
        label: 'knowledgeName'
      }
    };
  },
  created() {
    this.loadRelatedKnowledge();
  },
  methods: {
    // 加载已关联的知识点
    loadRelatedKnowledge() {
      getRelatedKnowledge(this.resourceType, this.resourceId).then(response => {
        this.relatedKnowledge = response.data;
        this.defaultCheckedKeys = response.data.map(item => item.knowledgeId);
      });
    },
    // 打开关联对话框
    openAssociationDialog() {
      this.associationDialogVisible = true;
      this.loadKnowledgeTree();
      this.selectedKnowledge = [...this.relatedKnowledge];
    },
    // 加载知识点树
    loadKnowledgeTree() {
      getKnowledgeTree({ courseId: this.courseId }).then(response => {
        this.knowledgeTreeData = response.data;
      });
    },
    // 搜索知识点
    searchKnowledge() {
      if (!this.searchKeyword.trim()) {
        this.loadKnowledgeTree();
        return;
      }

      searchKnowledge(this.searchKeyword).then(response => {
        // 将搜索结果转换为树形结构
        this.knowledgeTreeData = this.buildTreeFromList(response.data);
      });
    },
    // 将列表转换为树形结构
    buildTreeFromList(list) {
      const map = {};
      const roots = [];

      list.forEach(item => {
        map[item.knowledgeId] = { ...item, children: [] };
      });

      list.forEach(item => {
        const node = map[item.knowledgeId];
        if (item.parentId === 0 || !map[item.parentId]) {
          roots.push(node);
        } else {
          map[item.parentId].children.push(node);
        }
      });

      return roots;
    },
    // 获取难度标签类型
    getDifficultyTagType(level) {
      const map = {
        'easy': 'success',
        'medium': 'warning',
        'hard': 'danger'
      };
      return map[level] || 'info';
    },
    // 获取难度文本
    getDifficultyText(level) {
      const map = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
      };
      return map[level] || '未知';
    },
    // 树节点选中变化
    handleCheckChange(node, checked) {
      if (checked) {
        this.addSelected(node);
      } else {
        this.removeSelected(node.knowledgeId);
      }
    },
    // 添加到选中列表
    addSelected(knowledge) {
      if (!this.selectedKnowledge.some(item => item.knowledgeId === knowledge.knowledgeId)) {
        this.selectedKnowledge.push({
          knowledgeId: knowledge.knowledgeId,
          knowledgeName: knowledge.knowledgeName
        });
      }
    },
    // 从选中列表移除
    removeSelected(knowledgeId) {
      const index = this.selectedKnowledge.findIndex(item => item.knowledgeId === knowledgeId);
      if (index > -1) {
        this.selectedKnowledge.splice(index, 1);
      }
      // 同时取消树节点的选中状态
      this.$refs.knowledgeTree.setChecked(knowledgeId, false);
    },
    // 移除关联
    removeAssociation(knowledgeId) {
      const knowledgeIds = this.selectedKnowledge
          .filter(item => item.knowledgeId !== knowledgeId)
          .map(item => item.knowledgeId);

      this.saveAssociationToServer(knowledgeIds);
    },
    // 清空所有选中
    clearAll() {
      this.selectedKnowledge = [];
      this.$refs.knowledgeTree.setCheckedKeys([]);
    },
    // 保存关联
    saveAssociation() {
      const knowledgeIds = this.selectedKnowledge.map(item => item.knowledgeId);
      this.saveAssociationToServer(knowledgeIds);
      this.associationDialogVisible = false;
    },
    // 保存到服务器
    saveAssociationToServer(knowledgeIds) {
      associateKnowledge(this.resourceType, this.resourceId, knowledgeIds).then(response => {
        this.$modal.msgSuccess('关联成功');
        this.loadRelatedKnowledge();
        this.$emit('association-changed', knowledgeIds);
      });
    }
  }
};
</script>

<style scoped>
.association-container {
  display: flex;
  height: 400px;
  border: 1px solid #e6e6e6;
}

.left-panel {
  flex: 3;
  padding: 10px;
  border-right: 1px solid #e6e6e6;
  overflow-y: auto;
}

.right-panel {
  flex: 2;
  padding: 10px;
  overflow-y: auto;
}

.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.knowledge-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.tree-node-tag {
  margin-left: 10px;
}
</style>