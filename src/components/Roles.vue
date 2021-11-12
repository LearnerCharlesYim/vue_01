<template>
  <div>
    <el-breadcrumb separator='/'>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type='primary' @click='addRole'>添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data='roleList' border stripe>
        <el-table-column type='expand'>
          <template slot-scope='scope'>
            <el-row :class='["bdbottom",i1===0?"bdtop":"","vcenter"]' v-for='(item1,i1) in scope.row.permissions'
                    :key='item1.id'>
              <!--   一级权限       -->
              <el-col :span='5'>
                <el-tag closable @close='removeRightById(scope.row,item1.id)'>{{ item1.authName }}</el-tag>
                <i class='el-icon-caret-right'></i>
              </el-col>
              <el-col :span='19'>
                <el-row :class='[i2===0?"":"bdtop","vcenter"]' v-for='(item2,i2) in item1.children' :key='item2.id'>
                  <el-col :span='6'>
                    <el-tag type='success' closable @close='removeRightById(scope.row,item1.id)'>{{ item2.authName }}
                    </el-tag>
                    <i class='el-icon-caret-right'></i>
                  </el-col>
                  <el-col :span='18'>
                    <el-tag type='warning' v-for='item3 in item2.children' :key='item3.id' closable
                            @close='removeRightById(scope.row,item3.id)'>
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type='index'></el-table-column>
        <el-table-column label='角色名称' width='200px' prop='roleName'></el-table-column>
        <el-table-column label='角色描述' prop='roleDesc'></el-table-column>
        <el-table-column label='操作' width='300px'>
          <template slot-scope='scope'>
            <el-button size='mini' type='primary' icon='el-icon-edit' @click='editRoleDialog(scope.row)'>编辑</el-button>
            <el-button size='mini' type='danger' icon='el-icon-delete' @click='deleteRole(scope.row.id)'>删除</el-button>
            <el-button size='mini' type='warning' icon='el-icon-setting' @click='showSetRightDialog(scope.row)'>分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog
      title='分配权限'
      :visible.sync='setRightDialogVisible'
      width='50%'
      @close='setRightDialogClosed'>
      <el-tree
        :data='rightList'
        :props='treeProps'
        show-checkbox
        node-key='id'
        default-expand-all
        :default-checked-keys='defaultKeys'
        ref='treeRef'></el-tree>
      <span slot='footer' class='dialog-footer'>
        <el-button @click='setRightDialogVisible = false'>取 消</el-button>
        <el-button type='primary' @click='distributeRights'>确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑dialog -->
    <el-dialog
      title='编辑角色'
      :visible.sync='editDialogVisible'
      @close='editDialogClosed'
      width='50%'>
      <el-form ref='editFormRef' :rules='editRules' label-width='80px' :model='roleInfo'>
        <el-form-item label='角色名' prop='roleName'>
          <el-input v-model='roleInfo.roleName'></el-input>
        </el-form-item>
        <el-form-item label='角色描述' prop='roleDesc'>
          <el-input v-model='roleInfo.roleDesc'></el-input>
        </el-form-item>
      </el-form>
      <span slot='footer' class='dialog-footer'>
          <el-button @click='editDialogVisible = false'>取 消</el-button>
          <el-button type='primary' @click='editRole'>确 定</el-button>
        </span>
    </el-dialog>

    <!-- 新增role dialog -->
    <el-dialog
      title='添加角色'
      :visible.sync='addDialogVisible'
      @close='addDialogClosed'
      width='50%'>
      <el-form ref='addFormRef' :rules='addRules' label-width='80px' :model='addForm'>
        <el-form-item label='角色名' prop='roleName'>
          <el-input v-model='addForm.roleName'></el-input>
        </el-form-item>
        <el-form-item label='角色描述' prop='roleDesc'>
          <el-input v-model='addForm.roleDesc'></el-input>
        </el-form-item>
      </el-form>
      <span slot='footer' class='dialog-footer'>
          <el-button @click='addDialogVisible = false'>取 消</el-button>
          <el-button type='primary' @click='addFormRole'>确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data () {
    return {
      roleList: [],
      setRightDialogVisible: false,
      rightList: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defaultKeys: [],
      roleId: '',
      editDialogVisible: false,
      roleInfo: {},
      editRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }
        ]
      },
      addDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('/role/list')
      if (res.state !== 200) return this.$message.error(res.message)
      this.roleList = res.data
    },
    async removeRightById (role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消了删除操作')
      const { data: res } = await this.$http.delete(`/role/${role.id}/rights/${rightId}`)
      if (res.state !== 200) return this.$message.error(res.message)
      this.$message.success('删除权限成功')
      role.permissions = res.data
    },
    async showSetRightDialog (role) {
      const { data: res } = await this.$http.get('/rights/tree')
      if (res.state !== 200) return this.$message.error(res.message)
      this.rightList = res.data.permissions
      this.roleId = role.id
      this.getKeys(role.permissions, this.defaultKeys)
      this.setRightDialogVisible = true
    },
    getKeys (permissions, array) {
      permissions.forEach(permission => {
        if (permission.children.length === 0) {
          array.push(permission.id)
        } else {
          this.getKeys(permission.children, array)
        }
      })
    },
    setRightDialogClosed () {
      this.defaultKeys = []
    },
    async distributeRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const rids = keys.join(',')
      const { data: res } = await this.$http.post(`/role/${this.roleId}/rights`, { rids: rids })
      if (res.state !== 200) return this.$message.error(res.message)
      this.$message.success('分配权限成功')
      await this.getRolesList()
      this.setRightDialogVisible = false
    },
    editRoleDialog (role) {
      this.editDialogVisible = true
      // 深拷贝 避免改变roleInfo v-model双向绑定改变roleList
      this.$nextTick(() => {
        this.roleInfo = Object.assign({}, role)
      })
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    async editRole () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`/role/${this.roleInfo.id}`,
          {
            roleName: this.roleInfo.roleName,
            roleDesc: this.roleInfo.roleDesc
          })
        if (res.state !== 200) return this.$message.error(res.message)
        this.$message.success('角色编辑成功')
        await this.getRolesList()
        this.editDialogVisible = false
      })
    },
    async deleteRole (id) {
      await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`/role/${id}`)
        if (res.state !== 200) {
          return this.$message.error(res.message)
        }
        this.$message.success('删除角色成功')
        await this.getRolesList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    addRole () {
      this.addDialogVisible = true
    },
    async addFormRole () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('/role/add', this.addForm)
        if (res.state !== 201) return this.$message.error(res.message)
        this.$message.success('添加角色成功')
        await this.getRolesList()
        this.addDialogVisible = false
      })
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    }
  }
}
</script>

<style scoped lang='less'>
.el-tag {
  margin: 20px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
