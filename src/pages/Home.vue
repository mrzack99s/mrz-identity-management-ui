<template>
  <div>
    <v-container class="pa-md-0">
      <v-row dense>
        <v-col cols="6" class="">
          <v-card color="#fefefe">
            <v-card-title class="headline"> Current Online </v-card-title>
            <v-divider inset></v-divider>

            <v-card-actions>
              <v-icon class="ml-3">people</v-icon>
              <v-btn text v-if="currentOnline > 1">
                {{ this.currentOnline }} users
              </v-btn>
              <v-btn text v-else> {{ this.currentOnline }} user </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="6" class="">
          <v-card
            color="light-blue darken-2
"
            dark
          >
            <v-card-title class="headline">
              Time: {{ this.currentTime }}
            </v-card-title>
            <v-divider inset></v-divider>

            <v-card-actions>
              <v-btn text>User Management </v-btn>
              <v-icon>new_releases</v-icon>
              <v-btn text>version 3.1.0</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="6" class="mt-5">
          <v-card color="#fefefe">
            <v-card-title class="headline"> Group in system </v-card-title>
            <v-divider inset></v-divider>

            <v-card-actions>
              <v-icon class="ml-3">group_work</v-icon>
              <v-btn text v-if="groupCount > 1">
                {{ this.groupCount }} groups
              </v-btn>
              <v-btn text v-else> {{ this.groupCount }} group </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="6" class="mt-5">
          <v-card color="#fefefe">
            <v-card-title class="headline"> Users in system </v-card-title>
            <v-divider inset></v-divider>

            <v-card-actions>
              <v-icon class="ml-3">people</v-icon>
              <v-btn text v-if="usersCount > 1">
                {{ this.usersCount }} users
              </v-btn>
              <v-btn text v-else> {{ this.usersCount }} user </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  data: () => ({
    menu:[
      {
        name: "Overall status",
        link: "/dashboard/overview"
      },
      {
        name: "Online users",
        link: "/dashboard/online-list",
      },
    ],
    currentTime: "16:00",
    currentOnline: 888,
    groupCount: 1,
    usersCount: 1,
  }),
  methods: {
    GetCurrentDatetime() {
      const d = new Date();
      const year = d.getFullYear();
      const date = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
      const month = d.getMonth() < 10 ? "0" + d.getMonth() : d.getMonth();
      const h = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
      const m = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
      this.currentTime = `${date}/${month}/${year} ${h}:${m}`;
    },
    GetCurrentOnline() {
      this.$root.secureApi()
        .get("/online-session/count")
        .then((res) => {
          this.currentOnline = res.data;
        });
    },
    GetGroupCount() {
      this.$root.secureApi().get("/groups/count").then((res) => {
        this.groupCount = res.data;
      });
    },
    GetUserCount() {
      this.$root.secureApi().get("/users/count").then((res) => {
        this.usersCount = res.data;
      });
    },
  },
  mounted() {
    this.$root.activeMenu = this.menu[0].link;
    this.$root.menu = this.menu;
    this.GetCurrentDatetime();
    this.GetCurrentOnline();
    this.GetGroupCount();
    this.GetUserCount();

    setInterval(() => {
      this.GetCurrentDatetime();
    }, 10000);

    setInterval(() => {
      this.GetCurrentOnline();
      this.GetGroupCount();
      this.GetUserCount();
    }, 45000);
  },
};
</script>
<style scoped>
button.v-btn {
  pointer-events: none;
}
</style>