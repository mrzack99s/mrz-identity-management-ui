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
          <h3 class="">User information form</h3>
          <v-divider></v-divider>
          <v-form class="mt-5" ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model="value.u_first_name"
              :counter="50"
              :rules="fnRules"
              label="First Name"
              required
              maxlength="50"
              @keyup.enter="Create()"
            ></v-text-field>

            <v-text-field
              v-model="value.u_last_name"
              :counter="50"
              :rules="lnRules"
              label="Last Name"
              maxlength="50"
              required
              @keyup.enter="Create()"
            ></v-text-field>

            <v-text-field
              v-model="value.u_pid"
              :counter="13"
              :rules="pidRules"
              maxlength="13"
              label="Personal ID or Passport ID"
              class="mt-1"
              required
              @keyup.enter="Create()"
            ></v-text-field>

            <v-text-field
              v-model="value.u_orgid"
              :counter="20"
              :rules="orgidRules"
              maxlength="20"
              label="Organization ID"
              class="mt-1"
              required
              @keyup.enter="Create()"
            ></v-text-field>

            <v-select
              :items="listGroup.data"
              label="Group name"
              return-object
              item-value="id"
              item-text="g_name"
              v-model="value.edges.in_group"
              class="mt-4"
              :rules="groupRules"
              dense
              require
            ></v-select>

            <v-checkbox
              v-model="value.u_is_active"
              label="Enable account"
              required
            ></v-checkbox>

            <v-checkbox
              v-model="set_expired"
              label="Set Expired"
              required
            ></v-checkbox>

            <v-row justify="center" v-if="set_expired">
              <v-date-picker v-model="value.u_expired_at"></v-date-picker>
            </v-row>

            <v-btn class="mt-3" color="warning" @click="Create">
              Create a user
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
        name: "List users",
        link: "/users/list",
      },
      {
        name: "Add user",
        link: "/users/add",
      },
    ],
    value: {
      u_pid: null,
      u_orgid: null,
      u_first_name: null,
      u_last_name: null,
      u_is_active: false,
      u_expired_at: null,
      edges: {
        in_group: {},
      },
    },
    set_expired: true,
    listGroup: {
      data: [],
    },
    snackbar: false,
    snackbarTimeout: 2000,
    snackbarColor: "blue",
    snackbarMsg: null,
    fnRules: [
      (v) => !!v || "First name is required",
      (v) =>
        (v && v.length <= 55) || "First name must be less than 50 characters",
    ],
    lnRules: [
      (v) => !!v || "Last name is required",
      (v) =>
        (v && v.length <= 55) || "Last name must be less than 50 characters",
    ],
    pidRules: [(v) => !!v || "Personal ID or Passport ID is required"],
    orgidRules: [(v) => !!v || "Organization ID is required"],
    groupRules: [(v) => !!v || "Group is required"],
  }),
  methods: {
    GetGroups() {
      this.$root
        .secureApi()
        .get("/groups/get")
        .then((res) => {
          this.listGroup = res.data;
          this.value.edges.in_group = this.listGroup.data[0];
        });
    },
    Create() {
      if (this.$refs.form.validate()) {
        if (!this.set_expired) {
          this.value.u_expired_at = null;
        }else{
          const newDate = new Date(this.value.u_expired_at)
          this.value.u_expired_at = newDate.toISOString().split('.')[0]+"Z";
        }

        this.$root
          .secureApi()
          .post("/users/create", this.value, {
            "Content-Type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          })
          .then(() => {
            this.snackbar = true;
            this.snackbarMsg = "Add user success";
            this.snackbarColor = "success";
            this.value.u_expired_at = null
            this.dialog = false;

            setTimeout(()=>{
              this.$router.push("/users")
            }, 1000)

          })
          .catch((err) => {
            this.snackbar = true;
            this.snackbarMsg = err.response.data.error;
            this.snackbarColor = "error";
          });
      } else {
        this.snackbar = true;
        this.snackbarMsg = "Please enter a user information";
        this.snackbarColor = "warning";
      }
    },
  },
  mounted() {
    this.$root.activeMenu = this.menu[0].link;
    this.$root.menu = this.menu;
    this.GetGroups();
  },
};
</script>

<style>
</style>