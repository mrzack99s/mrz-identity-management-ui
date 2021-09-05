<template>
  <div>
    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" right top>
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
    <v-sheet rounded="lg">
      <div class="pa-md-6">
        <h3>Upload excel file for create multiple users</h3>
        <!-- <v-file-input
          class="mt-5"
          v-model="chosenFile"
          @change="convertXlsxToJson"
          show-size
          label="File excel"
        ></v-file-input> -->
        <v-file-input
          v-model="chosenFile"
          color="deep-purple accent-4"
          counter
          label="File excel"
          placeholder="Select excel file (.xlsx)"
          prepend-icon="mdi-paperclip"
          @change="convertXlsxToJson"
          class="mt-5 pa-10"
          accept=".xlsx"
          outlined
          :show-size="1000"
        >
          <template v-slot:selection="{ index, text }">
            <v-chip
              v-if="index < 2"
              color="deep-purple accent-4"
              dark
              label
              small
            >
              {{ text }}
            </v-chip>

            <span
              v-else-if="index === 2"
              class="text-overline grey--text text--darken-3 mx-2"
            >
              +{{ files.length - 2 }} File(s)
            </span>
          </template>
        </v-file-input>

        <div class="mx-auto text-center mt-3">
          <v-btn color="primary" @click="CreateUsers"> Create users </v-btn>
        </div>
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
import XLSX from "xlsx";
export default {
  data: () => ({
    menu: [
      {
        name: "Upload by excel file",
        link: "/multiusers/excel",
      },
    ],
    chosenFile: null,
    dataFromExcel: null,
    snackbar: false,
    snackbarTimeout: 2000,
    snackbarColor: "blue",
    snackbarMsg: null,
    wait: false,
  }),
  methods: {
    convertXlsxToJson() {
      var reader = new FileReader();

      reader.readAsArrayBuffer(this.chosenFile);
      reader.onload = () => {
        var data = new Uint8Array(reader.result);
        var workbook = XLSX.read(data, { type: "array" });
        let sheetName = workbook.SheetNames[0];
        let worksheet = workbook.Sheets[sheetName];
        let dataJson = XLSX.utils.sheet_to_json(worksheet);
        this.dataFromExcel = dataJson;
      };
    },
    CreateUsers() {
      this.wait = true;
      this.$root
        .secureApi()
        .post("/users/multi-create", this.dataFromExcel, {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
        })
        .then(() => {
          this.snackbar = true;
          this.snackbarMsg = "Create users success";
          this.snackbarColor = "success";
          this.wait = false;
        })
        .catch((err) => {
          console.log(err.response.data.error);
          this.snackbar = true;
          this.snackbarMsg = "Have a case cannot upsert, please check console log";
          this.snackbarColor = "warning";
          this.wait = false;
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