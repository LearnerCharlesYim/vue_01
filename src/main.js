import Vue from 'vue'
import App from './App.vue'
import router from './router'
import {
  Button,
  Form,
  FormItem,
  Input,
  Message,
  Container,
  Header,
  Aside,
  Main,
  Menu,
  Submenu,
  MenuItemGroup,
  MenuItem,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Row,
  Col,
  Table,
  TableColumn,
  Switch,
  Tooltip,
  Pagination,
  Dialog,
  MessageBox
} from 'element-ui'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
import qs from 'qs'

axios.defaults.baseURL = 'http://localhost:90/'
axios.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = token
  }
  config.data = qs.stringify(config.data)
  return config
})

Vue.component(Button.name, Button)
Vue.component(Form.name, Form)
Vue.component(FormItem.name, FormItem)
Vue.component(Input.name, Input)
Vue.component(Container.name, Container)
Vue.component(Header.name, Header)
Vue.component(Main.name, Main)
Vue.component(Aside.name, Aside)
Vue.component(Menu.name, Menu)
Vue.component(Submenu.name, Submenu)
Vue.component(MenuItemGroup.name, MenuItemGroup)
Vue.component(MenuItem.name, MenuItem)
Vue.component(Breadcrumb.name, Breadcrumb)
Vue.component(BreadcrumbItem.name, BreadcrumbItem)
Vue.component(Card.name, Card)
Vue.component(Row.name, Row)
Vue.component(Col.name, Col)
Vue.component(Table.name, Table)
Vue.component(TableColumn.name, TableColumn)
Vue.component(Switch.name, Switch)
Vue.component(Tooltip.name, Tooltip)
Vue.component(Pagination.name, Pagination)
Vue.component(Dialog.name, Dialog)

Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
