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
          :footer-props="{
            'items-per-page-options': [10, 20, 50, 100, -1],
          }"
          :items-per-page="10"
        >
          <template v-slot:item="row">
            <tr>
              <td>{{ row.item.id }}</td>
              <td>{{ row.item.gbw_download_speed }}</td>
              <td>{{ row.item.gbw_upload_speed }}</td>
              <td>
                <v-btn
                  class="mr-1"
                  dark
                  x-small
                  color="warning"
                  @click="Edit(row.item)"
                >
                  Edit
                </v-btn>
                <v-btn dark x-small color="error" @click="Delete(row.item)">
                  Delete
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="headline"
              >Are you sure to delete this group?</v-card-title
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
        <v-dialog v-model="dialog" persistent max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">Bandwidth Profile information</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="Profile ID"
                      v-model="editValue.id"
                      disabled
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      label="Download Speed (Mbit/sec)"
                      type="text"
                      v-model.number="editValue.gbw_download_speed"
                      @keyup.enter="ChangeValue()"
                      :rules="speedRules"
                      required
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      label="Upload Speed (Mbit/sec)"
                      type="text"
                      :rules="speedRules"
                      @keyup.enter="ChangeValue()"
                      v-model.number="editValue.gbw_upload_speed"
                      required
                    ></v-text-field>
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
              <v-btn color="blue darken-1" text @click="ChangeValue">
                Save
              </v-btn>
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
        name: "List of profile",
        link: "/bw-groups/list",
      },
      {
        name: "Add profile",
        link: "/bw-groups/add",
      },
    ],
    search: "",
    headers: [
      {
        text: "Profile ID",
      },
      {
        text: "Download Speed (Mbit/sec)",
      },
      { text: "Upload Speed (Mbit/sec)", },
      {
        text: "Action",
        sortable: false,
      },
    ],
    tableData: {
      id: 0,
      username: "temp",
      ipAddress: "10.0.0.0",
    },
    sortBy: "groupName",
    sortDesc: true,
    seleteItem: null,
    snackbar: false,
    speedRules: [
      (v) => !!v || "Upload/Download speed is required",
      (v) => (v && v <= 1000) || "Name must be less than 1000 Mbit/sec",
    ],
    snackbarTimeout: 2000,
    snackbarColor: "blue",
    dialogDelete: false,
    dialogClear: false,
    snackbarMsg: null,
    editValue: {
      id: null,
      gbw_download_speed: null,
      gbw_upload_speed: null,
    },
    dialog: false,
    tableLoading: true,
    pagination: {},
    tableVar: {
      total_page: 0,
      items: [],
    },
  }),
  watch: {
    pagination: {
      handler() {
        this.tableLoading = true;
        this.GetBWGroups();
      },
      deep: true,
    },
  },
  methods: {
    GetBWGroups() {
      const { page, itemsPerPage } = this.pagination;
      this.$root
        .secureApi()
        .get(`/bw-groups/get-pagination/${page}/${itemsPerPage}`)
        .then((res) => {
          this.tableVar.items = res.data.record_list;
          this.tableVar.total_page = res.data.record_count;
          this.tableLoading = false;
        });
    },
    Delete(item) {
      this.dialogDelete = true;
      this.seleteItem = item;
    },
    Edit(item) {
      this.editValue = item;
      this.dialog = true;
    },
    DeleteConfirm() {
      this.$root
        .secureApi()
        .delete(`/bw-groups/delete/${this.seleteItem.id}`)
        .then(() => {
          this.snackbar = true;
          this.snackbarMsg = "Delete success";
          this.snackbarColor = "success";
          this.GetGroups();
        })
        .catch((err) => {
          this.snackbar = true;
          this.snackbarMsg = err.response.data.error;
          this.snackbarColor = "error";
        });
      this.CloseDelete();
    },
    CloseDelete() {
      this.dialogDelete = false;
    },
    ChangeValue() {
      this.$root
        .secureApi()
        .post("/bw-groups/update", this.editValue, {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
        })
        .then(() => {
          this.snackbar = true;
          this.snackbarMsg = "Edit success";
          this.snackbarColor = "success";
          this.dialog = false;
          this.GetGroups();
        })
        .catch((err) => {
          this.snackbar = true;
          this.snackbarMsg = err.response.data.error;
          this.snackbarColor = "error";
        });
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