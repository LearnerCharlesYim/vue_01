<template>
  <el-container class='home-container'>
    <el-header>
      <div>
        <img src='../assets/heima.png' alt=''>
        <span><router-link to='/home'>电商后台管理系统</router-link></span>
      </div>
      <el-button type='info' @click='logout'>注销</el-button>
    </el-header>
    <el-container>
      <el-aside :width='isCollapse?"64px":"200px"'>
        <div class='toggle-button' @click='toggleCollapse'>|||</div>
        <el-menu :default-active='activePath' class='el-menu-vertical-demo' background-color='#333744' text-color='#fff'
                 active-text-color='#409eff' :unique-opened='true' :collapse='isCollapse' :collapse-transition='false'
                 :router='true'>
          <el-submenu :index='item.id + ""' v-for='item in menuList' :key='item.id'>
            <template slot='title'>
              <i :class='iconsObj[item.id]'></i>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item :index='"/"+subItem.path' v-for='subItem in item.children' :key='subItem.id'
                          @click='saveNavState("/"+subItem.path)'>
              <template slot='title'>
                <i class='el-icon-menu'></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>

export default {
  name: 'Home',
  data () {
    return {
      menuList: [],
      iconsObj: {
        2: 'iconfont icon-user',
        3: 'iconfont icon-tijikongjian',
        1: 'iconfont icon-shangpin',
        4: 'iconfont icon-danju',
        5: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList () {
      const { data: res } = await this.$http.get('rights/menus')
      if (res.state !== 200) return this.$messagee.error(res.message)
      this.menuList = res.data
    },
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    saveNavState (activePath) {
      sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang='less' scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;

  > div {
    display: flex;
    align-items: center;

    span {
      color: #fff;
      margin-left: 15px;
      a{
        text-decoration: none;
        color: #fff;
      }
    }
  }
}

.el-aside {
  background-color: #333744;

  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
