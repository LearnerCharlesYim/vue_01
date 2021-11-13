<template>
  <div>
    <el-breadcrumb separator='/'>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter='20'>
        <el-col :span='8'>
          <el-input placeholder='请输入内容' v-model='queryInfo.username' clearable @clear='getUserList'>
            <el-button slot='append' icon='el-icon-search' @click='getUserList'></el-button>
          </el-input>
        </el-col>
        <el-col :span='4'>
          <el-button type='primary' @click='addDialogVisible=true'>添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data='userList' border stripe>
        <el-table-column type='index'></el-table-column>
        <el-table-column label='姓名' prop='username'></el-table-column>
        <el-table-column label='邮箱' prop='email'></el-table-column>
        <el-table-column label='电话' prop='phone'></el-table-column>
        <el-table-column label='角色' prop='roleName'></el-table-column>
        <el-table-column label='状态'>
          <template slot-scope='scope'>
            <el-switch v-model='scope.row.state' @change='userStateChange(scope.row)'>
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label='操作' width='180px'>
          <template slot-scope='scope'>
            <el-button type='primary' icon='el-icon-edit' size='mini' @click='showEditDialog(scope.row.id)'></el-button>
            <el-button type='danger' icon='el-icon-delete' size='mini'
                       @click='removeUserById(scope.row.id)'></el-button>
            <el-tooltip effect='dark' content='分配角色' placement='top' :enterable='false'>
              <el-button type='warning' icon='el-icon-setting' size='mini' @click='setRole(scope.row)'></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change='handleSizeChange' @current-change='handleCurrentChange'
                     :current-page='queryInfo.pageNum'
                     background
                     :page-sizes='[5, 10, 20, 50]'
                     :page-size='queryInfo.pageSize'
                     layout='total, sizes, prev, pager, next, jumper'
                     :total='total'>
      </el-pagination>
    </el-card>
    <el-dialog
      title='添加用户'
      :visible.sync='addDialogVisible'
      width='50%'
      @close='addDialogClosed'>
      <el-form :model='addForm' :rules='addFormRules' ref='addFormRef' label-width='70px'>
        <el-form-item label='用户名' prop='username'>
          <el-input v-model='addForm.username'></el-input>
        </el-form-item>
        <el-form-item label='密码' prop='password'>
          <el-input v-model='addForm.password'></el-input>
        </el-form-item>
        <el-form-item label='邮箱' prop='email'>
          <el-input v-model='addForm.email'></el-input>
        </el-form-item>
        <el-form-item label='电话' prop='phone'>
          <el-input v-model='addForm.phone'></el-input>
        </el-form-item>
      </el-form>
      <span slot='footer' class='dialog-footer'>
        <el-button @click='addDialogVisible = false'>取 消</el-button>
        <el-button type='primary' @click='submitUser'>确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户   -->
    <el-dialog
      title='修改用户'
      :visible.sync='editDialogVisible'
      width='50%'
      @close='editDialogClosed'>
      <el-form :model='editForm' :rules='editFormRules' ref='editFormRef' label-width='70px'>
        <el-form-item label='用户名'>
          <el-input v-model='editForm.username' disabled></el-input>
        </el-form-item>
        <el-form-item label='邮箱' prop='email'>
          <el-input v-model='editForm.email'></el-input>
        </el-form-item>
        <el-form-item label='电话' prop='phone'>
          <el-input v-model='editForm.phone'></el-input>
        </el-form-item>
      </el-form>
      <span slot='footer' class='dialog-footer'>
        <el-button @click='editDialogVisible = false'>取 消</el-button>
        <el-button type='primary' @click='editUser'>确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框   -->
    <el-dialog
      title='分配角色'
      :visible.sync='setRoleDialogVisible'
      width='50%'
      @close='setRoleDialogClosed'>
      <p>当前的用户：{{ userInfo.username }}</p>
      <p>当前的角色：{{ userInfo.roleName }}</p>
      <p>分配新角色：
        <el-select v-model='selectedRoleId' placeholder='请选择'>
          <el-option
            v-for='role in roleList'
            :key='role.id'
            :label='role.roleName'
            :value='role.id'>
          </el-option>
        </el-select>
      </p>
      <span slot='footer' class='dialog-footer'>
    <el-button @click='setRoleDialogVisible = false'>取 消</el-button>
    <el-button type='primary' @click='submitRole'>确 定</el-button>
  </span>
    </el-dialog>

  </div>
</template>
<script>
export default {
  name: 'Users',
  data () {
    const checkEmail = (rule, value, callback) => {
      const mailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (!value) {
        return callback(new Error('邮箱不能为空'))
      }
      setTimeout(() => {
        if (mailReg.test(value)) {
          callback()
        } else {
          callback(new Error('请输入正确的邮箱格式'))
        }
      }, 100)
    }

    const checkPhone = (rule, value, callback) => {
      const phoneReg = /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/
      if (!value) {
        return callback(new Error('电话号码不能为空'))
      }
      setTimeout(() => {
        // Number.isInteger是es6验证数字是否为整数的方法,实际输入的数字总是识别成字符串
        // 所以在前面加了一个+实现隐式转换

        if (!Number.isInteger(+value)) {
          callback(new Error('请输入数字值'))
        } else {
          if (phoneReg.test(value)) {
            callback()
          } else {
            callback(new Error('电话号码格式不正确'))
          }
        }
      }, 100)
    }

    return {
      queryInfo: {
        username: '',
        pageNum: 1,
        pageSize: 5
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        phone: ''
      },
      addFormRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '用户名长度6-12个字符',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 16,
            message: '密码长度6-16个字符',
            trigger: 'blur'
          }
        ],
        email: [
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        phone: [
          {
            validator: checkPhone,
            trigger: 'blur'
          }
        ]
      },
      editForm: {},
      editFormRules: {
        email: [
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        phone: [
          {
            validator: checkPhone,
            trigger: 'blur'
          }
        ]
      },
      setRoleDialogVisible: false,
      userInfo: {},
      roleList: [],
      selectedRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('/users/list', { params: this.queryInfo })
      if (res.state !== 200) return this.$message.error(res.message)
      this.userList = res.data.users
      this.total = res.data.totalNum
    },
    handleSizeChange (newSize) {
      this.queryInfo.pageSize = newSize
      // 每页显示数据改变后 防止页面变化重置pageNum=1
      this.queryInfo.pageNum = 1
      this.getUserList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pageNum = newPage
      this.getUserList()
    },
    async userStateChange (userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.state}`)
      if (res.state !== 200) {
        userInfo.state = !userInfo.state
        return this.$message.error(res.message)
      }
      this.$message.success('更新用户状态成功')
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    submitUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('/users/add', this.addForm)
        if (res.state !== 201) {
          this.$message.error(res.state.message)
        }
        this.$message.success('添加用户成功')
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`/users/${id}`)
      if (res.state !== 200) return this.$message.error(res.state)
      this.editDialogVisible = true
      this.$nextTick(() => {
        this.editForm = Object.assign({}, res.data)
      })
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    editUser () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`/users/${this.editForm.id}`,
          {
            email: this.editForm.email,
            phone: this.editForm.phone
          })
        if (res.state !== 200) return this.$message.error(res.message)
        this.editDialogVisible = false
        await this.getUserList()
        this.$message.success('更新用户信息成功')
      })
    },
    async removeUserById (id) {
      await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`/users/${id}`)
        if (res.state !== 200) {
          return this.$message.error(res.message)
        }
        this.$message.success('删除用户成功')
        this.getUserList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    async setRole (userInfo) {
      const { data: res } = await this.$http.get('/role/list')
      if (res.state !== 200) return this.$message.error(res.message)
      this.roleList = res.data
      this.userInfo = userInfo
      this.setRoleDialogVisible = true
    },
    async submitRole () {
      if (!this.selectedRoleId) return this.$message.error('请选择要分配的角色')
      const { data: res } = await this.$http.put(`/users/${this.userInfo.id}/role`, { roleId: this.selectedRoleId })
      if (res.state !== 200) return this.$message.error(res.message)
      this.$message.success('更新角色成功')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    setRoleDialogClosed () {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style scoped lang='less'>

</style>
