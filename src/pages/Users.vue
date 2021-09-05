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

    <v-sheet min-height="70vh" rounded="lg">
      <div class="pa-md-4">
        <v-card-title>
          List Users
          <v-spacer></v-spacer>
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
          :options.sync="pagination"
          :items="tableVar.items"
          :server-items-length="tableVar.total_page"
          :loading="tableLoading"
          show-expand
          single-expand
          :footer-props="{
            'items-per-page-options': [10, 20, 50, 100, -1],
          }"
          :items-per-page="10"
        >
          <template v-slot:[`item.u_expired_at`]="{ item }">
            {{ GetDate(item.u_expired_at) }}
          </template>

          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length">
              <div class="text-center">
                <v-btn
                  class="mr-1"
                  dark
                  x-small
                  color="primary"
                  @click="ResetPassword(item)"
                >
                  Reset password
                </v-btn>
                <v-btn
                  class="mr-1"
                  dark
                  x-small
                  color="warning"
                  @click="Edit(item)"
                >
                  Edit
                </v-btn>
                <span v-if="item.u_orgid == whoami">
                  <v-btn disabled x-small>
                    Delete
                  </v-btn>
                </span>
                <span v-else>
                  <v-btn dark x-small color="error" @click="Delete(item)">
                    Delete
                  </v-btn>
                </span>
              </div>
            </td>
          </template>
        </v-data-table>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="headline"
              >Are you sure to delete this user?</v-card-title
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="CloseDelete"
                >Cancel</v-btn
              >
              <v-btn color="blue darken-1" text @click="DeleteConfirm"
                >OK</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="dialogReset" max-width="500px">
          <v-card>
            <v-card-title class="headline"
              >Reset password of this user?</v-card-title
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="dialogReset = false"
                >Cancel</v-btn
              >
              <v-btn color="blue darken-1" text @click="ResetConfirm">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="dialog" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">User information</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      label="PersonalID/PassportID"
                      v-model="editValue.u_pid"
                      disabled
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-select
                      :items="listGroup.data"
                      return-object
                      label="Group name"
                      item-text="g_name"
                      item-value="id"
                      v-model="editValue.edges.in_group"
                      dense
                      outlined
                    ></v-select>
                  </v-col>

                  <v-col cols="6">
                    <v-text-field
                      label="First Name*"
                      type="text"
                      v-model="editValue.u_first_name"
                      required
                      @keyup.enter="Update()"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="6">
                    <v-text-field
                      label="Last Name*"
                      type="text"
                      v-model="editValue.u_last_name"
                      required
                      @keyup.enter="Update()"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12">
                    <v-checkbox
                      v-model="editValue.u_is_active"
                      label="Enable account"
                      required
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="12">
                    <v-checkbox
                      v-model="set_expired"
                      label="Set Expired"
                      required
                    ></v-checkbox>

                    <v-row justify="center" v-if="set_expired">
                      <v-date-picker
                        v-model="editValue.u_expired_at"
                      ></v-date-picker>
                    </v-row>
                  </v-col>
                </v-row>
              </v-container>
              <small>*indicates required field</small>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="dialog = false">
                Close
              </v-btn>
              <v-btn color="blue darken-1" text @click="Update"> Save </v-btn>
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
        name: "List users",
        link: "/users/list",
      },
      {
        name: "Add user",
        link: "/users/add",
      },
    ],
    search: "",
    dialog: false,
    set_expired: true,
    headers: [
      {
        text: "PersonalID/PassportID",
        value: "u_pid",
      },
      {
        text: "Orgaization ID ",
        value: "u_orgid",
      },
      {
        text: "Group Name",
        align: "start",
        sortable: true,
        value: "edges.in_group.g_name",
      },
      {
        text: "Full Name",
        value: "u_first_name",
      },
      {
        text: "Expired Date",
        value: "u_expired_at",
      },
      {
        text: "",
        value: "data-table-expand",
      },
    ],
    tableVar: {
      total_page: 0,
      items: [],
    },
    sortBy: "groupName",
    sortDesc: true,
    seleteItem: null,
    snackbar: false,
    snackbarTimeout: 2000,
    snackbarColor: "blue",
    dialogDelete: false,
    dialogClear: false,
    dialogReset: false,
    snackbarMsg: null,
    u_expired_at: null,
    editValue: {
      u_pid: null,
      u_first_name: null,
      u_expired_at: null,
      edges: {
        in_group: {},
      },
    },
    listGroup: {
      data: [],
    },
    tableLoading: true,
    pagination: {},
  }),
  watch: {
    pagination: {
      handler() {
        this.tableLoading = true;
        this.GetUsers();
      },
      deep: true,
    },
    search: {
      handler() {
        this.tableLoading = true;
        this.GetUserWithSearch();
      },
    },
  },
  computed:{
    whoami(){
      return this.$root.whoami
    }
  },
  methods: {
    GetDate(date_str) {
      if (date_str == "0001-01-01T00:00:00Z") return "No expired";
      else {
        const formatYmd = (date) => date.toISOString().slice(0, 10);
        var newDate = new Date(date_str);
        return formatYmd(newDate);
      }
    },
    GetUsers() {
      const { page, itemsPerPage } = this.pagination;
      this.$root
        .secureApi()
        .get(`/users/get-pagination/${page}/${itemsPerPage}`)
        .then((res) => {
          this.tableVar.items = res.data.record_list;
          this.tableVar.total_page = res.data.record_count;
          this.tableLoading = false;
        });
    },
    GetUserWithSearch() {
      const { page, itemsPerPage } = this.pagination;
      this.$root
        .secureApi()
        .post(`/users/search`, {
          search: this.search,
          page: page,
          p_page: itemsPerPage,
        })
        .then((res) => {
          this.tableVar.items = res.data.record_list;
          this.tableVar.total_page = res.data.record_count;
          this.tableLoading = false;
        });
    },
    GetGroups() {
      this.$root
        .secureApi()
        .get("/groups/get")
        .then((res) => {
          this.listGroup = res.data;
        });
    },
    ResetPassword(item) {
      this.dialogReset = true;
      this.seleteItem = item;
    },
    Delete(item) {
      this.dialogDelete = true;
      this.seleteItem = item;
    },
    Edit(item) {
      this.editValue = item;

      if (this.editValue.u_expired_at != "0001-01-01T00:00:00Z") {
        const formatYmd = (date) => date.toISOString().slice(0, 10);
        this.editValue.u_expired_at = formatYmd(
          new Date(this.editValue.u_expired_at)
        );
      } else {
        this.set_expired = false;
        this.editValue.u_expired_at = null;
      }

      this.dialog = true;
    },
    Update() {
      if (!this.set_expired) {
        delete this.editValue.u_expired_at;
      } else {
        const newDate = new Date(this.editValue.u_expired_at);
        this.editValue.u_expired_at = newDate.toISOString().split(".")[0] + "Z";
      }

      this.$root
        .secureApi()
        .post("/users/update", this.editValue, {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
        })
        .then(() => {
          this.snackbar = true;
          this.snackbarMsg = "Edit success";
          this.snackbarColor = "success";
          this.dialog = false;
          this.GetUsers();
        })
        .catch((err) => {
          this.snackbar = true;
          this.snackbarMsg = err.response.data.error;
          this.snackbarColor = "error";
        });
    },
    DeleteConfirm() {
      this.$root
        .secureApi()
        .delete(`/users/delete/${this.seleteItem.id}`)
        .then(() => {
          this.snackbar = true;
          this.snackbarMsg = "Delete success";
          this.snackbarColor = "success";
          this.GetUsers();
        })
        .catch((err) => {
          this.snackbar = true;
          this.snackbarMsg = err.response.data.error;
          this.snackbarColor = "error";
        });
      this.CloseDelete();
    },
    ResetConfirm() {
      this.$root
        .secureApi()
        .post(`/users/reset-password`, this.seleteItem)
        .then(() => {
          this.snackbar = true;
          this.snackbarMsg = "Reset password success";
          this.snackbarColor = "success";
          this.GetUsers();
        })
        .catch((err) => {
          this.snackbar = true;
          this.snackbarMsg = err.response.data.error;
          this.snackbarColor = "error";
        });
      this.dialogReset = false;
    },
    CloseDelete() {
      this.dialogDelete = false;
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