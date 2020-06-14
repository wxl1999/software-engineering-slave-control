import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
import axios from 'axios'

Vue.config.productionTip = false

const eventBus = new Vue();
export default eventBus;

const vue = new Vue({
  render: h => h(App),
});

vue.$mount('#app');

axios.defaults.baseURL = ''
axios.interceptors.request.use(config => {
  if (window.sessionStorage.getItem('token')) {
    config.headers.Authorization = window.sessionStorage.getItem('token')
  }
  else if (window.localStorage.getItem('app_key')) {
    config.headers.Authorization = window.localStorage.getItem('app_key')
  }
  // console.log(config)
  return config
})