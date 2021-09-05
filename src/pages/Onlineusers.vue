<template>
  <div>
    <v-snackbar
      v-model="snackbar"
      :timeout="snackbarTimeout"
      right
      top
    >
      {{ this.snackbarMsg }}
      <template v-slot:action="{ attrs }">
        <v-btn
          :color="snackbarColor"
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-sheet min-height="70vh" rounded="lg">
      <div class="pa-md-4">
        <v-card-title>
          Online sessions
          <v-spacer></v-spacer>
          <v-btn
            class="mr-4 mt-5"
            color="deep-orange lighten-4"
            elevation="2"
            small
            @click="ClearSession()"
            >Clear all sessions</v-btn
          >
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>
        <v-data-table
          :headers="headers"
          :items="tableData.data"
          :search="search"
          :footer-props="{
            'items-per-page-options': [10, 20, 50, 100, -1],
          }"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          :items-per-page="10"
        >
          <template v-slot:item="row">
            <tr>
              <td>{{ row.item.id }}</td>
              <td>{{ row.item.u_pid }}</td>
              <td>{{ row.item.ip_address }}</td>
              <td>
                <v-btn dark x-small color="error" @click="Kick(row.item)">
                  Kick
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
        <v-dialog v-model="dialogKick" max-width="500px">
          <v-card>
            <v-card-title class="headline"
              >Are you sure to kick this session?</v-card-title
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="CloseKick"
                >Cancel</v-btn
              >
              <v-btn color="blue darken-1" text @click="KickConfirm">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="dialogClear" max-width="500px">
          <v-card>
            <v-card-title class="headline"
              >Are you sure to clear all this sessions?</v-card-title
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="CloseClear"
                >Cancel</v-btn
              >
              <v-btn color="blue darken-1" text @click="ClearConfirm">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-sheet>
  </div>
</template>

<script>
export default {
  data: () => ({
    menu: [
      {
        name: "Overall status",
        link: "/dashboard/overview",
      },
      {
        name: "Online users",
        link: "/dashboard/online-list",
      },
    ],
    search: "",
    headers: [
      {
        text: "SessionID",
        align: "start",
        sortable: true,
        value: "id",
      },
      { text: "Username", value: "username" },
      { text: "IPAddress", value: "ipAddress" },
      {
        text: "Action",
        sortable: false,
      },
    ],
    tableData: {
      id: 0,
      u_pid: "temp",
      ip_addr: "10.0.0.0",
    },
    sortBy: "id",
    sortDesc: true,
    seleteItem: null,
    snackbar: false,
    snackbarTimeout: 2000,
    snackbarColor: "blue",
    snackbarMsg: null,
    dialogKick: false,
    dialogClear: false,
  }),
  methods: {
    GetOnlineSession() {
      this.$root.secureApi().get("/online-session/get").then((res) => {
        this.tableData = res.data;
      });
    },
    Kick(item) {
      this.dialogKick = true;
      this.seleteItem = item;
    },
    KickConfirm() {
      this.$root.secureApi()
        .post("/online-session/kick",
          {
            IPAddress: this.seleteItem.ip_addr,
          },
          {
            "Content-Type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          }
        )
        .then((res) => {
          if (res.data.status) {
            this.snackbar = true;
            this.snackbarMsg = "Kick success";
            this.snackbarColor = "success";
            this.GetOnlineSession();
          } else {
            this.snackbar = true;
            this.snackbarMsg = "Kick failled";
            this.snackbarColor = "error";
          }
        });
      this.CloseKick();
    },
    CloseKick() {
      this.dialogKick = false;
    },
    ClearSession() {
      this.dialogClear = true;
    },
    ClearConfirm() {
      this.$root.secureApi()
        .post("/online-session/clear")
        .then((res) => {
          if (res.data.status) {
            this.snackbar = true;
            this.snackbarMsg = "Clear all sessions success";
            this.snackbarColor = "success";
            this.GetOnlineSession();
          } else {
            this.snackbar = true;
            this.snackbarMsg = "Clear all sessions failled";
            this.snackbarColor = "error";
          }
        });
      this.CloseClear();
    },
    CloseClear() {
      this.dialogClear = false;
    },
  },
  mounted() {
    this.$root.activeMenu = this.menu[0].link;
    this.$root.menu = this.menu;
    this.GetOnlineSession();
    setInterval(() => {
      this.GetOnlineSession();
    }, 45000);
  },
};
</script>

<style>
</style>