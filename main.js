import Vue from 'vue'
import App from './App'
import store from './store'
import http from './common/http.js'
import api from './common/api.js'
import tool from './common/tool.js'

Vue.prototype.$http = http
Vue.prototype.$api = api
Vue.prototype.$tool = tool
Vue.prototype.$store = store;
Vue.config.productionTip = false
// 兼容v3编译器下不支持finally的做法
if (Promise.finally === undefined) {
    Promise.prototype.finally = function (callback) {
      let P = this.constructor;
      return this.then(
        value  => P.resolve(callback()).then(() => value),
        reason => P.resolve(callback()).then(() => { throw reason })
      );
    };
}
App.mpType = 'app'

const app = new Vue({
	...App,
	store
})
app.$mount()
