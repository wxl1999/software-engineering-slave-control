import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'

Vue.config.productionTip = false


const eventBus = new Vue();
export default eventBus;

const vue = new Vue({
  render: h => h(App),
});

vue.$mount('#app');