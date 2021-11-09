import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/views/Login'
import Home from '@/views/Home'
import Welcome from '@/components/Welcome'
import Users from '@/components/Users'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    redirect: '/welcome',
    component: Home,
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      }
    ]
  }
]

const router = new VueRouter({
  routes
})
router.beforeEach((to, from, next) => {
  const tokenStr = sessionStorage.getItem('token')
  if (to.path === '/login') {
    return tokenStr === null ? next() : next('/')
  }
  if (!tokenStr) return next('/login')
  next()
})

export default router
