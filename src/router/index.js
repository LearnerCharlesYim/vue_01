import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/views/Login'
import Home from '@/views/Home'
import Welcome from '@/components/Welcome'
import Users from '@/components/Users'
import Rights from '@/components/Rights'
import Roles from '@/components/Roles'
import Categories from '@/components/Categories'
import Params from '@/components/Params'
import Goods from '@/components/Goods'
import Orders from '@/components/Orders'
import Reports from '@/components/Reports'

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
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/role',
        component: Roles
      },
      {
        path: '/categories',
        component: Categories
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: Goods
      },
      {
        path: '/orders',
        component: Orders
      },
      {
        path: '/reports',
        component: Reports
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
