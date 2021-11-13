<template>
  <div>
    <el-breadcrumb separator='/'>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type='primary' @click='showAddCateDialog'>添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格   -->
      <tree-table
        class='tree-table'
        border
        :show-index='true'
        index-text='#'
        :expand-type='false'
        :selection-type='false'
        :columns='columns'
        :data='categoryList'>
        <template slot='isok' slot-scope='scope'>
          <i class='el-icon-success' v-if='scope.row.state === true' style='color:lightgreen'></i>
          <i class='el-icon-error' v-if='scope.row.state === false' style='color:red'></i>
        </template>
        <template slot='order' slot-scope='scope'>
          <el-tag size='mini' v-if='scope.row.level === 1'>一级</el-tag>
          <el-tag size='mini' v-if='scope.row.level === 2' type='success'>二级</el-tag>
          <el-tag size='mini' v-if='scope.row.level === 3' type='warning'>三级</el-tag>
        </template>
        <template slot='operate'>
          <el-button size='mini' type='primary' icon='el-icon-edit'>编辑</el-button>
          <el-button size='mini' type='danger' icon='el-icon-delete'>删除</el-button>
        </template>
      </tree-table>
      <!-- 分页   -->
      <el-pagination @size-change='handleSizeChange' @current-change='handleCurrentChange'
                     :current-page='queryInfo.pageNum'
                     :page-sizes='[5, 10, 20, 50]'
                     background
                     :page-size='queryInfo.pageSize'
                     layout='total, sizes, prev, pager, next, jumper'
                     :total='total'>
      </el-pagination>
    </el-card>

    <el-dialog
      title='添加分类'
      :visible.sync='addCateDialogVisible'
      width='50%'
      @close='addCateDialogClosed'>
      <el-form ref='addCateFormRef' :rules='addCateRules' label-width='80px' :model='addCateForm'>
        <el-form-item label='分类名称' prop='name'>
          <el-input v-model='addCateForm.name'></el-input>
        </el-form-item>
        <el-form-item label='父级分类'>
          <el-cascader
            change-on-select
            clearable
            @change='parentCateChanged'
            v-model='selectedKeys'
            :options='parentCateList'
            expand-trigger='hover'
            :props='cascaderProps'>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot='footer' class='dialog-footer'>
        <el-button @click='addCateDialogVisible = false'>取 消</el-button>
        <el-button type='primary' @click='addCate'>确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Categories',
  data () {
    return {
      categoryList: [],
      queryInfo: {
        pageNum: 1,
        pageSize: 5
      },
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义模板列
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          // 表示将当前列定义模板列
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          // 表示将当前列定义模板列
          type: 'template',
          template: 'operate'
        }
      ],
      addCateDialogVisible: false,
      addCateForm: {
        name: '',
        parentId: '',
        level: 1
      },
      addCateRules: {
        name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
      parentCateList: [],
      cascaderProps: {
        value: 'id',
        label: 'name',
        children: 'children'
      },
      selectedKeys: []
    }
  },
  created () {
    this.getCategoryList()
  },
  methods: {
    async getCategoryList () {
      const { data: res } = await this.$http.get('/categories/list', { params: this.queryInfo })
      if (res.state !== 200) return this.$message.error(res.message)
      this.categoryList = Object.assign([], res.data.categories)
      this.queryInfo.pageNum = res.data.pageNum
      this.total = res.data.totalNum
    },
    handleSizeChange (newSize) {
      this.queryInfo.pageNum = 1
      this.queryInfo.pageSize = newSize
      this.getCategoryList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pageNum = newPage
      this.getCategoryList()
    },
    showAddCateDialog () {
      this.getParentCateTree()
      this.addCateDialogVisible = true
    },
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.level = 1
      this.addCateForm.parentId = ''
    },
    async getParentCateTree () {
      const { data: res } = await this.$http.get('/categories/tree')
      if (res.state !== 200) return this.$message(res.message)
      this.parentCateList = Object.assign([], res.data)
    },
    parentCateChanged () {
      if (this.selectedKeys.length > 0) {
        // 父级分类id
        this.addCateForm.parentId = this.selectedKeys[this.selectedKeys.length - 1]
        // 当前分类等级
        this.addCateForm.level = this.selectedKeys.length + 1
      } else {
        // 父级分类id
        this.addCateForm.parentId = ''
        // 当前分类等级
        this.addCateForm.level = 1
      }
    },
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('/categories/add', this.addCateForm)
        if (res.state !== 201) return this.$message.error(res.message)
        this.$message.success('添加分类成功')
        await this.getCategoryList()
        this.addCateDialogVisible = false
      })
    }
  }
}
</script>

<style scoped lang='less'>
.tree-table {
  margin-top: 15px;
}

.el-cascader {
  width: 100%
}

</style>
