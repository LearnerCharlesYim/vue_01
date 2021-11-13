<template>
  <div class='login_container'>
    <div class='login_box'>
      <div class='avatar_box'>
        <img src='../assets/logo.png' alt=''>
      </div>
      <!-- 登录表单区域 -->
      <el-form ref='loginFormRef' :model='loginForm' :rules='loginFormRules' label-width='0px' class='login_form'>
        <!-- 用户名 -->
        <el-form-item prop='username'>
          <el-input v-model='loginForm.username' prefix-icon='iconfont icon-user'></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop='password'>
          <el-input v-model='loginForm.password' prefix-icon='iconfont icon-3702mima' type='password'></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class='btns'>
          <el-button type='primary' @click='login'>登录</el-button>
          <el-button type='info' @click='resetLoginForm'>重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginFormRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '用户名长度3-10字符',
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
            min: 6,
            max: 16,
            message: '密码长度6-16字符',
            trigger: 'blur'
          }
        ]

      }
    }
  },
  methods: {
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.state !== 200) return this.$message.error(res.message)
        this.$message.success('登录成功')
        sessionStorage.setItem('token', res.data.token)
        sessionStorage.setItem('id', res.data.id)
        const user = {
          id: res.data.id,
          username: res.data.username,
          roleName: res.data.roleName,
          email: res.data.email
        }
        this.$store.commit('setUser', user)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style scoped lang='less'>
.login_container {
  background-color: #2b4b63;
  height: 100%;

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box {
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }

    .login_form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;

      .btns {
        display: flex;
        justify-content: right;
      }
    }
  }
}

</style>
