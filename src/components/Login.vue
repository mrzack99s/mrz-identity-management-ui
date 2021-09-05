<template>
  <div>
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      rounded="pill"
      top
      right
      :timeout="snackbarTimeout"
    >
      {{ this.snackbarMsg }}
    </v-snackbar>
    <v-app style="background: #546e7a">
      <v-content>
        <v-container fill-height="fill-height" style="max-width: 500px">
          <v-layout align-center="align-center" justify-center="justify-center">
            <v-flex class="login-form text-xs-center">
              <v-card light="light">
                <v-card-text>
                  <div class="headline">
                    <template>Sign in to system</template>
                  </div>
                  <v-form>
                    <v-text-field
                      v-model="username"
                      light="light"
                      prepend-icon="person"
                      label="Name"
                      class="mt-5"
                      @keyup.enter="Signin()"
                    ></v-text-field>
                    <v-text-field
                      v-model="password"
                      light="light"
                      prepend-icon="lock"
                      label="Password"
                      type="password"
                      @keyup.enter="Signin()"
                    ></v-text-field>
                    <div class="text-center">
                      <v-btn color="teal darken-1" dark @click="Signin()"
                        >Sign-in</v-btn
                      >
                    </div>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-content>
    </v-app>
  </div>
</template>

<script>
export default {
  data: () => ({
    username: null,
    password: null,
    snackbar: false,
    snackbarTimeout: 2000,
    snackbarColor: "blue",
    snackbarMsg: null,
  }),
  methods: {
    Signin() {
      this.$root.unsecureApi()
        .post("/authentication",
          {
            username: this.username,
            password: this.password,
          },
          {
            "Content-Type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          }
        )
        .then((response) => {
          this.snackbar = true;
          this.snackbarMsg = "Login success";
          this.snackbarColor = "success";
          this.dialog = false;
          localStorage.logged = JSON.stringify(response.data);
          if (localStorage.previousPath != null) {
            const pPath = localStorage.previousPath;
            delete localStorage.previousPath;
            this.$router.push(pPath);
          } else this.$router.push("/dashboard");
        })
        .catch((err) => {
          this.snackbar = true;
          this.snackbarMsg = err.response.data.error;
          this.snackbarColor = "error";
        });
    },
  },
  mounted() {
    if (localStorage.logged != null) {
      this.$router.push("/dashboard");
    }
  },
};
</script>

<style>
</style>