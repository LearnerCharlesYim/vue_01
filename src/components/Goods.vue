<template>
  <div>
    <el-breadcrumb separator='/'>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter='20'>
        <el-col :span='8'>
          <el-input placeholder='请输入内容' v-model='query.name' clearable @clear='clearSearchInput'>
            <el-button slot='append' icon='el-icon-search' @click='searchGoods'></el-button>
          </el-input>
        </el-col>
        <el-col :span='4'>
          <el-button type='primary' @click='addGoodsPage'>添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data='goodsList' border stripe>
        <el-table-column type='index'></el-table-column>
        <el-table-column label='商品名称' prop='goodsName'></el-table-column>
        <el-table-column width='110px' label='商品价格(元)' prop='goodsPrice'></el-table-column>
        <el-table-column width='90px' label='商品重量' prop='goodsWeight'></el-table-column>
        <el-table-column width='170px' label='创建时间' prop='createdTime'></el-table-column>
        <el-table-column width='120px' label='操作'>
          <el-button size='mini' type='primary' icon='el-icon-edit'></el-button>
          <el-button size='mini' type='danger' icon='el-icon-delete'></el-button>
        </el-table-column>
      </el-table>
      <el-pagination @size-change='handleSizeChange' @current-change='handleCurrentChange'
                     :current-page='query.pageNum'
                     background
                     :page-sizes='[5, 10, 20, 50]'
                     :page-size='query.pageSize'
                     layout='total, sizes, prev, pager, next, jumper'
                     :total='total'>
      </el-pagination>

    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Goods',
  created () {
    this.getGoodsList()
  },
  data () {
    return {
      query: {
        pageNum: 1,
        pageSize: 5,
        name: ''
      },
      total: 0,
      goodsList: []
    }
  },
  methods: {
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods/list', { params: this.query })
      if (res.state !== 200) return this.$message.error(res.message)
      this.total = res.data.totalNum
      this.goodsList = Object.assign([], res.data.goods)
    },
    handleSizeChange (newSize) {
      this.query.pageSize = newSize
      this.query.pageNum = 1
      this.getGoodsList()
    },
    handleCurrentChange (newPage) {
      this.query.pageNum = newPage
      this.getGoodsList()
    },
    searchGoods () {
      if (this.query.name.trim().length === 0) {
        this.query.name = ''
        return this.$message.warning('请输入商品关键字信息！')
      }
      this.query.pageNum = 1
      this.getGoodsList()
    },
    clearSearchInput () {
      this.query.pageNum = 1
      this.getGoodsList()
    },
    addGoodsPage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style scoped>

</style>
