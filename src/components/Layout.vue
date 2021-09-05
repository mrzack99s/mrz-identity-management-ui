<template>
  <v-app id="inspire">
    <v-app-bar app color="white" flat>
      <v-container class="py-0 fill-height">
        <v-avatar
          class="mr-10"
          color="light-blue darken-2"
          size="48"
          style="color: #fff"
          >MRZ</v-avatar
        >

        <v-btn v-for="link in links" :key="link.link" :to="link.link" text>
          {{ link.name }}
        </v-btn>

        <v-spacer></v-spacer>

        <v-responsive max-width="120">
          <v-btn depressed color="error" @click="logout"> Sign-out </v-btn>
        </v-responsive>
      </v-container>
    </v-app-bar>

    <v-main class="grey lighten-3">
      <v-container>
        <v-row>
          <v-col cols="2">
            <v-sheet rounded="lg">
              <v-list color="transparent">
                <v-list-item-group
                  :v-model="this.$root.activeMenu"
                  mandatory
                  color="indigo"
                >
                  <v-list-item
                    v-for="menu in this.$root.menu"
                    :key="menu.link"
                    link
                    :to="menu.link"
                  >
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ menu.name }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-sheet>
          </v-col>

          <v-col>
            <router-view />
            <div class="mx-auto text-center text--secondary mt-6">
              &copy; 2020 Chatdanai Phakaket
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    links: [
      {
        name: "Dashboard",
        link: "/dashboard",
      },
      {
        name: "Users",
        link: "/users",
      },
      {
        name: "Groups",
        link: "/groups",
      },
      {
        name: "BW Profile",
        link: "/bw-groups",
      },
      {
        name: "Multi-users upload",
        link: "/multiusers",
      },
    ],
  }),
  methods: {
    clearSession() {
      delete localStorage.logged;
      this.$router.push("/login");
    },
    logout() {
      const localSession = localStorage.logged;
      const session = JSON.parse(localSession);
      this.$root.unsecureApi()
        .post("/authentication/logout",
          {
            username: session.username,
            password: session.password,
          },
          {
            "Content-Type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          }
        )
        .then(() => {
          this.snackbar = true;
          this.snackbarMsg = "Logout success";
          this.snackbarColor = "success";
          this.dialog = false;
          this.clearSession();
        })
        .catch(() => {
          this.snackbar = true;
          this.snackbarMsg = "Logout failed!";
          this.snackbarColor = "error";
          this.dialog = false;
        });
    },
  },
};
</script>