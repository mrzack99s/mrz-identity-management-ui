<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
import axios from "axios";
export default {
  methods: {
    checkLogin() {
      if (localStorage.logged != null) {
        const localSession = localStorage.logged;
        const session = JSON.parse(localSession);
        axios
          .post(
            this.$root.unsecureApiURL + "/authentication/check",
            {
              username: session.username,
              password: session.api_secret,
            },
            {
              "Content-Type": "application/json;charset=UTF-8",
              "Access-Control-Allow-Origin": "*",
            }
          )
          .then((response) => {
            if (!response.data.authorized) {
              delete localStorage.logged;
              localStorage.previousPath = this.$route.path;
              this.$router.push("/login");
            }
          })
          .catch(() => {
            delete localStorage.logged;
            localStorage.previousPath = this.$route.path;
            this.$router.push("/login");
          });
      } else {
        delete localStorage.logged;
        this.$router.push("/login");
      }
    },
  },
  mounted() {
    this.checkLogin();
  },
};
</script>
