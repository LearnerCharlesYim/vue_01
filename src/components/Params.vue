<template>
  <div>
    <el-breadcrumb separator='/'>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert show-icon :closable='false' title='注意：只允许为第三级分类设置相关参数' type='warning'></el-alert>
      <el-row class='cat-opt'>
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            clearable
            @change='handleChanged'
            v-model='selectedKeys'
            :options='categoryList'
            :props='cascaderProps'>
          </el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model='activeName' @tab-click='handleTabClick'>
        <el-tab-pane label='动态参数' name='dynamic'>
          <el-button type='primary' size='mini' :disabled='isBtnDisabled' @click='addDialogVisible=true'>添加参数
          </el-button>
          <el-table :data='dynamicTableData' border stripe>
            <el-table-column type='expand'>
              <template slot-scope='scope'>
                <el-tag closable @close='handleClosed(index,scope.row)' v-for='(item,index) in scope.row.tag'
                        :key='index'>{{ item }}
                </el-tag>
                <el-input
                  class='input-new-tag'
                  v-if='scope.row.inputVisible'
                  v-model='scope.row.inputValue'
                  ref='saveTagInput'
                  size='small'
                  @keyup.enter.native='handleInputConfirm(scope.row)'
                  @blur='handleInputConfirm(scope.row)'>
                </el-input>
                <el-button v-else class='button-new-tag' size='small' @click='showInput(scope.row)'>+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type='index'></el-table-column>
            <el-table-column label='参数名称' prop='name'></el-table-column>
            <el-table-column label='操作'>
              <template slot-scope='scope'>
                <el-button size='mini' type='primary' icon='el-icon-edit' @click='showEditDialog(scope.row)'>编辑
                </el-button>
                <el-button size='mini' type='danger' icon='el-icon-delete' @click='deleteParam(scope.row.id)'>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label='静态属性' name='static'>
          <el-button type='primary' size='mini' :disabled='isBtnDisabled' @click='addDialogVisible=true'>添加属性
          </el-button>
          <el-table :data='staticTableData' border stripe>
            <el-table-column type='expand'>
              <template slot-scope='scope'>
                <el-tag closable @close='handleClosed(index,scope.row)' v-for='(item,index) in scope.row.tag'
                        :key='index'>{{ item }}
                </el-tag>
                <el-input
                  class='input-new-tag'
                  v-if='scope.row.inputVisible'
                  v-model='scope.row.inputValue'
                  ref='saveTagInput'
                  size='small'
                  @keyup.enter.native='handleInputConfirm(scope.row)'
                  @blur='handleInputConfirm(scope.row)'>
                </el-input>
                <el-button v-else class='button-new-tag' size='small' @click='showInput(scope.row)'>+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type='index'></el-table-column>
            <el-table-column label='属性名称' prop='name'></el-table-column>
            <el-table-column label='操作'>
              <template slot-scope='scope'>
                <el-button size='mini' type='primary' icon='el-icon-edit' @click='showEditDialog(scope.row)'>编辑
                </el-button>
                <el-button size='mini' type='danger' icon='el-icon-delete' @click='deleteParam(scope.row.id)'>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog
      @close='addDialogClosed'
      :title='"添加"+titleText'
      :visible.sync='addDialogVisible'
      width='50%'>
      <el-form ref='addFormRef' :rules='addFormRules' :model='addForm'>
        <el-form-item :label='titleText' prop='param'>
          <el-input v-model='addForm.param'></el-input>
        </el-form-item>
      </el-form>
      <span slot='footer' class='dialog-footer'>
        <el-button @click='addDialogVisible = false'>取 消</el-button>
        <el-button type='primary' @click='addParam'>确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title='"编辑"+titleText'
      :visible.sync='editDialogVisible'
      @close='editDialogClosed'
      width='50%'>
      <el-form ref='editFormRef' :rules='editFormRules' :model='editForm'>
        <el-form-item :label='titleText' prop='param'>
          <el-input v-model='editForm.param'></el-input>
        </el-form-item>
      </el-form>
      <span slot='footer' class='dialog-footer'>
        <el-button @click='editDialogVisible = false'>取 消</el-button>
        <el-button type='primary' @click='editParam'>确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data () {
    return {
      // 商品分类列表
      categoryList: [],
      // 级联选择框配置对象
      cascaderProps: {
        value: 'id',
        label: 'name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 级联选择框双向绑定数据
      selectedKeys: [],
      activeName: 'dynamic',
      currentTabName: '',
      dynamicTableData: [],
      staticTableData: [],
      addDialogVisible: false,
      addFormRules: {
        param: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      addForm: {
        param: ''
      },
      editDialogVisible: false,
      editFormRules: {
        param: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      editForm: {
        id: '',
        param: ''
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('/categories/listAll')
      if (res.state !== 200) return this.$message.error(res.message)
      this.categoryList = Object.assign([], res.data)
    },
    handleChanged () {
      this.dynamicTableData = []
      this.staticTableData = []
      this.getParamsDate()
    },

    async getParamsDate () {
      // 选中不是三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        return
      }
      const { data: res } = await this.$http.get(`/categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.state !== 200) return this.$message.error(res.message)
      res.data.forEach(item => {
        item.tag = item.tag ? item.tag.split(',') : []
        // 给每一行tag添加默认inputVisiable 控制tag开关
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'dynamic') {
        // 动态参数数据
        this.dynamicTableData = Object.assign([], res.data)
      } else if (this.activeName === 'static') {
        // 静态参数数据
        this.staticTableData = Object.assign([], res.data)
      }
    },
    handleTabClick () {
      if (this.currentTabName !== this.activeName) {
        // 切换tab首先清空table数据
        this.dynamicTableData = []
        this.staticTableData = []
        this.getParamsDate()
        this.currentTabName = this.activeName
      }
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 提交参数
    addParam () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`/categories/${this.cateId}/attributes`, {
          param: this.addForm.param,
          sel: this.activeName
        })
        if (res.state !== 201) return this.$message.error(res.message)
        this.$message.success('添加参数成功')
        await this.getParamsDate()
        this.addDialogVisible = false
      })
    },
    editParam () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`/categories/${this.cateId}/attributes/${this.editForm.id}`, this.editForm)
        if (res.state !== 200) return this.$message.error(res.message)
        this.$message.success('编辑参数成功')
        await this.getParamsDate()
        this.editDialogVisible = false
      })
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    showEditDialog (param) {
      console.log(param)
      this.editDialogVisible = true
      this.$nextTick(() => {
        this.editForm.id = param.id
        this.editForm.param = param.name
      })
    },
    async deleteParam (id) {
      await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`/categories/${this.cateId}/attributes/${id}`)
        if (res.state !== 200) {
          return this.$message.error(res.message)
        }
        console.log(res)
        this.$message.success('删除参数成功')
        await this.getParamsDate()
      })
    },
    // 文本框失去焦点 enter
    async handleInputConfirm (row) {
      let value = row.inputValue.trim()
      if (value.length === 0) {
        value = ''
        row.inputVisible = false
        return
      }
      row.tag.push(value)
      const { data: res } = await this.$http.put(`/categories/${this.cateId}/attributes/${row.id}`, { tag: row.tag.join(',') })
      if (res.state !== 200) {
        row.pop()
        return this.$message.error(res.message)
      }
      // 请求成功
      row.inputValue = ''
      row.inputVisible = false
    },
    showInput (row) {
      row.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // tag删除
    async handleClosed (index, row) {
      // 删除所选项
      const item = row.tag.splice(index, 1)
      const { data: res } = await this.$http.put(`/categories/${this.cateId}/attributes/${row.id}`, { tag: row.tag.length === 0 ? '' : row.tag.join(',') })
      if (res.state !== 200) {
        row.push(item)
        return this.$message.error(res.message)
      }
    }
  },
  computed: {
    isBtnDisabled () {
      return this.selectedKeys.length !== 3
    },
    cateId () {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // 动态计算dialog标题
    titleText () {
      if (this.activeName === 'dynamic') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style scoped lang='less'>
.cat-opt {
  margin: 15px 0;
}

.el-cascader {
  width: 300px;
}

.el-tag {
  margin: 15px;
}

.input-new-tag {
  width: 120px;
}

.button-new-tag {
  margin: 10px;
}
</style>
