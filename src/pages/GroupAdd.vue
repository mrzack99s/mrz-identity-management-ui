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
          <h3 class="">Group information form</h3>
          <v-divider></v-divider>
          <v-form class="mt-5" ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model="value.g_name"
              :counter="255"
              :rules="nameRules"
              label="Name"
              @keyup.enter="Create()"
              required
            ></v-text-field>

            <v-select
              :items="listBW.data"
              return-object
              label="Bandwidth profile (Download\Upload)"
              :item-text="
                (item) =>
                  `${item.gbw_download_speed}Mbps / ${item.gbw_upload_speed}Mbps`
              "
              item-value="id"
              v-model="value.edges.use_bandwidth"
              class="mt-3"
              dense
              outlined
            ></v-select>

            <v-checkbox
              v-model="value.g_is_int_org"
              label="Internal Organization"
              required
            ></v-checkbox>

            <v-checkbox
              v-model="value.g_is_super_admin"
              label="Is Super Administrator?"
              required
            ></v-checkbox>

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
        name: "List groups",
        link: "/groups/list",
      },
      {
        name: "Add group",
        link: "/groups/add",
      },
    ],
    value: {
      g_name: null,
      g_is_int_org: true,
      g_is_super_admin: false,
      edges: {
        use_bandwidth: {},
      },
    },
    snackbar: false,
    snackbarTimeout: 2000,
    snackbarColor: "blue",
    snackbarMsg: null,
    nameRules: [
      (v) => !!v || "GroupName is required",
      (v) => (v && v.length <= 255) || "Name must be less than 255 characters",
    ],
    listBW: [],
  }),
  methods: {
    GetBWGroups() {
      this.$root
        .secureApi()
        .get("/bw-groups/get")
        .then((res) => {
          this.listBW = res.data;
          this.value.edges.use_bandwidth = this.listBW.data[0];
        });
    },
    Create() {
      if (this.$refs.form.validate()) {
        this.$root
          .secureApi()
          .post("/groups/create", this.value, {
            "Content-Type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          })
          .then(() => {
            this.snackbar = true;
            this.snackbarMsg = "Add group success";
            this.snackbarColor = "success";
            this.dialog = false;

            setTimeout(() => {
              this.$router.push("/groups");
            }, 1000);
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
    this.GetBWGroups();
  },
};
</script>

<style>
</style>