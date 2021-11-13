<template>
  <div>
    <el-breadcrumb separator='/'>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title='添加商品信息' type='info' show-icon center :closable='false'></el-alert>
      <el-steps :space='200' :active='activeIndex-0' finish-status='success' align-center>
        <el-step title='基本信息'></el-step>
        <el-step title='商品参数'></el-step>
        <el-step title='商品属性'></el-step>
        <el-step title='商品图片'></el-step>
        <el-step title='商品内容'></el-step>
        <el-step title='完成'></el-step>
      </el-steps>
      <el-form :model='addForm' :rules='addFormRules' ref='addFormRef' label-width='100px' label-position='top'>
        <el-tabs :tab-position='"left"' @tab-click='tabClicked' :before-leave='beforeTabLeave' v-model='activeIndex'>
          <el-tab-pane label='基本信息' name='0'>
            <el-form-item label='商品名称' prop='name'>
              <el-input v-model='addForm.name'></el-input>
            </el-form-item>
            <el-form-item label='商品价格' prop='price'>
              <el-input type='number' v-model='addForm.price'></el-input>
            </el-form-item>
            <el-form-item label='商品重量' prop='weight'>
              <el-input type='number' v-model='addForm.weight'></el-input>
            </el-form-item>
            <el-form-item label='商品数量' prop='num'>
              <el-input type='number' v-model='addForm.num'></el-input>
            </el-form-item>
            <el-form-item label='商品分类' prop='categoryIds'>
              <el-cascader
                clearable
                @change='handleChanged'
                v-model='addForm.categoryIds'
                :options='cateList'
                :props='cateProps'>
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label='商品参数' name='1'>
            <el-form-item v-for='item in dynamicData' :key='item.id' :label='item.name'>
              <el-checkbox-group v-model='item.tag'>
                <el-checkbox border v-for='(cd,index) in item.tag' :key='index' :label='cd'></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label='商品属性' name='2'>
            <el-form-item v-for='item in staticData' :key='item.id' :label='item.name'>
              <el-select v-model='item.result' clearable placeholder='请选择'>
                <el-option
                  v-for='(attr,index) in item.tag'
                  :key='index'
                  :label='attr'
                  :value='attr'>
                </el-option>
              </el-select>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label='商品图片' name='3'>
            <el-upload
              :action='uploadUrl'
              :on-preview='handlePreview'
              :on-remove='handleRemove'
              :headers='headersObj'
              :on-success='handleSuccess'
              list-type='picture'>
              <el-button size='small' type='primary'>点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label='商品内容' name='4'>
            <quill-editor
              ref='myTextEditor'
              v-model='addForm.introduction'>
            </quill-editor>
            <el-button class='btnAdd' type='primary' @click='addGoods'>添加商品</el-button>
            <el-button class='btnAdd' type='primary' @click='$router.push("/goods")'>取&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;消</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog
      title='图片预览'
      :visible.sync='previewDialogVisible'
      width='50%'>
      <img class='previewImg' :src='previewPath' alt=''>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  created () {
    this.getCateList()
  },
  data () {
    return {
      activeIndex: 0,
      addForm: {
        name: '',
        price: 0,
        weight: 0,
        num: 0,
        categoryIds: [],
        pics: [],
        introduction: '',
        attrs: []
      },
      cateList: [],
      addFormRules: {
        name: [
          {
            required: true,
            message: '请输入商品名称',
            trigger: 'blur'
          }
        ],
        price: [
          {
            required: true,
            message: '请输入商品价格',
            trigger: 'blur'
          }
        ],
        weight: [
          {
            required: true,
            message: '请输入商品重量',
            trigger: 'blur'
          }
        ],
        num: [
          {
            required: true,
            message: '请输入商品数量',
            trigger: 'blur'
          }
        ],
        categoryIds: [
          {
            required: true,
            message: '请选择商品分类',
            trigger: 'blur'
          }
        ]
      },
      cateProps: {
        label: 'name',
        value: 'id',
        children: 'children',
        expandTrigger: 'hover'
      },
      dynamicData: [],
      staticData: [],
      headersObj: {
        Authorization: sessionStorage.getItem('token')
      },
      uploadUrl: 'http://localhost:90/goods/upload',
      previewPath: '',
      previewDialogVisible: false
    }
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('/categories/listAll')
      if (res.state !== 200) return this.$message(res.message)
      this.cateList = Object.assign([], res.data)
    },
    handleChanged () {
      if (this.addForm.categoryIds.length !== 3) {
        this.addForm.categoryIds = []
      }
    },
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.categoryIds.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
      return true
    },
    async tabClicked () {
      if (this.activeIndex === '1') {
        // 如果数据已经渲染就返回 不渲染防止已选中项清除
        if (this.dynamicData.length !== 0) return
        const { data: res } = await this.$http.get(`/categories/${this.cid}/attributes`, { params: { sel: 'dynamic' } })
        if (res.state !== 200) return this.$message.error(res.message)
        res.data.forEach(item => {
          item.tag = item.tag.length === 0 ? [] : item.tag.split(',')
        })
        this.dynamicData = Object.assign([], res.data)
      } else if (this.activeIndex === '2') {
        if (this.staticData.length !== 0) return
        const { data: res } = await this.$http.get(`/categories/${this.cid}/attributes`, { params: { sel: 'static' } })
        if (res.state !== 200) return this.$message.error(res.message)
        res.data.forEach(item => {
          item.tag = item.tag.length === 0 ? [] : item.tag.split(',')
          item.result = ''
        })
        this.staticData = Object.assign([], res.data)
      }
    },
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    handleRemove (file) {
      const filePath = file.response.data.path
      const index = this.addForm.pics.findIndex(x => x.pic === filePath)
      this.addForm.pics.splice(index, 1)
    },
    handleSuccess (response) {
      const picInfo = { pic: response.data.path }
      this.addForm.pics.push(picInfo)
    },
    addGoods () {
      this.$refs.addFormRef.validate(valid => {
        if (!valid) return this.$message.error('请填写必要表单项')
        this.dynamicData.forEach(item => {
          const newInfo = {
            attrId: item.id,
            attrValue: item.tag.join(',')
          }
          this.addForm.attrs.push(newInfo)
        })
        this.staticData.forEach(item => {
          const newInfo = {
            attrId: item.id,
            attrValue: item.result
          }
          this.addForm.attrs.push(newInfo)
        })
        const form = _.cloneDeep(this.addForm)
        form.categoryIds = form.categoryIds.join(',')
        console.log(form)
      })
    }
  },
  computed: {
    cid () {
      if (this.addForm.categoryIds.length === 3) {
        return this.addForm.categoryIds[2]
      }
      return null
    }
  }
}
</script>

<style scoped lang='less'>
.el-checkbox {
  margin: 0 5px 0 0;
}

.previewImg {
  width: 100%;
}

.btnAdd {
  margin-top: 25px;
}
</style>
