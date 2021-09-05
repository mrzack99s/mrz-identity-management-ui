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
    <div class="pa-md-6 mx-auto">
      <div class="mx-auto" style="width: 500px">
        <v-sheet class="pa-md-6" rounded="lg">
          <h3 class="">Bandwidth Group information form</h3>
          <v-divider></v-divider>
          <v-form class="mt-5" ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model.number="value.gbw_download_speed"
              class="mt-1"
              :rules="speedRules"
              @keyup.enter="Create()"
              label="Download Speed (Mbit/sec)"
              required
            ></v-text-field>

            <v-text-field
              v-model.number="value.gbw_upload_speed"
              :rules="speedRules"
              class="mt-1"
              @keyup.enter="Create()"
              label="Upload Speed (Mbit/sec)"
              required
            ></v-text-field>

            <v-btn class="mt-3" color="warning" @click="Create">
              Create a group
            </v-btn>
          </v-form>
        </v-sheet>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    menu: [
      {
        name: "List of profile",
        link: "/bw-groups/list",
      },
      {
        name: "Add profile",
        link: "/bw-groups/add",
      },
    ],
    value: {
      gbw_download_speed: null,
      gbw_upload_speed: null,
    },
    snackbar: false,
    snackbarTimeout: 2000,
    snackbarColor: "blue",
    snackbarMsg: null,
    speedRules: [
      (v) => !!v || "Upload/Download speed is required",
      (v) => (v && v <= 1000) || "Name must be less than 1000 Mbit/sec",
    ],
  }),
  methods: {
    Create() {
      if (this.$refs.form.validate()) {
        this.$root
          .secureApi()
          .post("/bw-groups/create", this.value, {
            "Content-Type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          })
          .then(() => {
            this.snackbar = true;
            this.snackbarMsg = "Add bandwidth profile success";
            this.snackbarColor = "success";
            this.dialog = false;
            setTimeout(() => {
              this.$router.push("/bw-groups");
            }, 2000);
          })
          .catch((err) => {
            this.snackbar = true;
            this.snackbarMsg = err.response.data.error;
            this.snackbarColor = "error";
          });
      } else {
        this.snackbar = true;
        this.snackbarMsg = "Please enter a information details";
        this.snackbarColor = "warning";
      }
    },
  },
  mounted() {
    this.$root.activeMenu = this.menu[0].link;
    this.$root.menu = this.menu;
  },
};
</script>

<style>
</style>