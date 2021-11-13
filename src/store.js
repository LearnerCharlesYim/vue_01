import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: {
      id: '',
      username: '',
      roleName: '',
      email: ''
    }
  },
  mutations: {
    setUser: (state, user) => {
      state.user = Object.assign({}, user)
    }
  },
  getters: {
    getId: state => {
      return state.user.id
    },
    getUsername: state => {
      return state.user.username
    },
    getRoleName: state => {
      return state.user.roleName
    },
    getEmail: state => {
      return state.user.email
    },
    getUser: state => {
      return state.user
    }
  }
})

export default store
