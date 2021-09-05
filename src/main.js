import Vue from 'vue'
import App from './App.vue'
import vuetify from "./plugins/vuetify"
import router from './router'
import VueCookies from 'vue-cookies'
import axios from 'axios'
import '@mdi/font/css/materialdesignicons.css'
Vue.use(VueCookies)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  vuetify,
  router,
  data: () => ({
    menu: [
      {
        name: "list",
        active: true,
      },
      {
        name: "list",
        active: false,
      },
    ],
    activeMenu: null,
    apiURL: "http://localhost:8000/api",
    unsecureApiURL: "http://localhost:8000/unsecure/api",
    portalApiURL: "http://localhost:8000/zauth/v2beta",
    whoami: null
  }),
  methods: {
    secureApi() {
      if (localStorage.logged != null) {
        const localSession = localStorage.logged;
        const session = JSON.parse(localSession);
        const api = axios.create({
          baseURL: this.apiURL,
          auth: {
            username: session.username,
            password: session.api_secret
          }
        })
        return api
      }
      return null
    },
    unsecureApi() {
      const api = axios.create({
        baseURL: this.unsecureApiURL
      })
      return api
    },
  },
  mounted() {
    const localSession = localStorage.logged;
    const session = JSON.parse(localSession);
    this.whoami = session.username;
  }
}).$mount('#app')
