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
              <td>{{ row.item.g_name }}</td>
              <td>{{ row.item.edges.use_bandwidth.gbw_download_speed }}</td>
              <td>{{ row.item.edges.use_bandwidth.gbw_upload_speed }}</td>
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
              <span class="headline">Group information</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="GroupName"
                      v-model="editValue.g_name"
                      disabled
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      :items="listBW.data"
                      return-object
                      label="Bandwidth profile (Download\Upload)"
                      :item-text="
                        (item) =>
                          `${item.gbw_download_speed}Mbps / ${item.gbw_upload_speed}Mbps`
                      "
                      item-value="id"
                      v-model="editValue.edges.use_bandwidth"
                      dense
                      outlined
                    ></v-select>
                  </v-col>
                  <v-col cols="6">
                    <v-checkbox
                      v-model="editValue.g_is_int_org"
                      label="Internal Organization"
                      required
                    ></v-checkbox>
                  </v-col>
                  <v-col cols="6">
                    <v-checkbox
                      v-model="editValue.g_is_super_admin"
                      label="Is Super Administrator?"
                      required
                    ></v-checkbox>
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
    <v-overlay :value="wait" class="text-center">
      <v-progress-circular
        :size="70"
        :width="7"
        color="white"
        indeterminate
      ></v-progress-circular>
      <div class="text-h5">Wait a minutes</div>
    </v-overlay>
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
    search: "",
    headers: [
      {
        text: "Group Name",
      },
      {
        text: "Download Speed (Mbit/sec)",
      },
      {
        text: "Upload Speed (Mbit/sec)",
      },
      {
        text: "Action",
        sortable: false,
      },
    ],
    sortBy: "groupName",
    sortDesc: true,
    seleteItem: null,
    snackbar: false,
    snackbarTimeout: 2000,
    snackbarColor: "blue",
    dialogDelete: false,
    dialogClear: false,
    snackbarMsg: null,
    editValue: {
      g_name: null,
      g_is_int_org: true,
      g_is_super_admin: false,
      edges: {
        use_bandwidth: {},
      },
    },
    dialog: false,
    listBW: [],
    wait: false,
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
        this.GetGroups();
      },
      deep: true,
    },
    search: {
      handler() {
        this.tableLoading = true;
        this.GetGroupWithSearch();
      },
    },
  },
  methods: {
    GetGroups() {
      const { page, itemsPerPage } = this.pagination;
      this.$root
        .secureApi()
        .get(`/groups/get-pagination/${page}/${itemsPerPage}`)
        .then((res) => {
          this.tableVar.items = res.data.record_list;
          this.tableVar.total_page = res.data.record_count;
          this.tableLoading = false;
        });
    },
    GetGroupWithSearch() {
      const { page, itemsPerPage } = this.pagination;
      this.$root
        .secureApi()
        .post(`/groups/search`, {
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
    GetBWGroups() {
      this.$root
        .secureApi()
        .get("/bw-groups/get")
        .then((res) => {
          this.listBW = res.data;
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
      this.wait = true;
      this.$root
        .secureApi()
        .delete(`/groups/delete/${this.seleteItem.id}`)
        .then(() => {
          this.snackbar = true;
          this.snackbarMsg = "Delete success";
          this.snackbarColor = "success";
          this.wait = false;
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
        .post("/groups/update", this.editValue, {
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
    this.GetBWGroups();
  },
};
</script>

<style>
</style>