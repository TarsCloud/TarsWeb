<template>
  <div>
    <!-- 修改密码 -->
    <el-card class="box-card market_page">
      <h1 class="top_txt">{{ $t("market.login.modifyPass") }}</h1>
      <el-form
        label-width="150px"
        :model="data"
        ref="ruleForm"
        label-position="left"
        :rules="rules"
      >
        <el-form-item
          :label="$t('market.login.inputOldPass')"
          prop="oldPassword"
          required
        >
          <el-input
            :placeholder="$t('market.login.passwordInfo')"
            v-model="data.oldPassword"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('market.login.inputNewPass')"
          prop="newPassword"
          required
        >
          <el-input
            :placeholder="$t('market.login.passwordInfo')"
            v-model="data.newPassword"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('market.login.repeatInputNewPass')"
          prop="checkPass"
          required
        >
          <el-input
            :placeholder="$t('market.login.repeatInputNewPass')"
            v-model="data.checkPass"
            show-password
          ></el-input>
        </el-form-item>
        <el-button
          class="btn_long"
          type="primary"
          size="small"
          round
          @click="modifyPass"
          >{{ $t("market.login.modifyPass") }}</el-button
        >

        <br />
        <br />
        <div class="sub_menu">
          <a size="small" round @click="back">{{ $t("market.login.back") }}</a>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import sha1 from "sha1";
import "@/assets/css/market.css";
export default {
  name: "ModifyPass",
  data() {
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("login.inputPasswordAgain")));
      } else if (value !== this.data.newPassword) {
        callback(new Error(this.$t("login.passwordDiff")));
      } else {
        callback();
      }
    };

    return {
      data: {
        newPassword: "",
        oldPassword: "",
        checkPass: "",
      },
      rules: {
        newPassword: [
          {
            required: true,
            message: this.$t("market.login.inputPassword"),
            trigger: "blur",
          },
          {
            min: 6,
            max: 16,
            message: this.$t("market.login.passwordInfo"),
            trigger: "blur",
          },
        ],
        oldPassword: [
          {
            required: true,
            message: this.$t("market.login.inputPassword"),
            trigger: "blur",
          },
          {
            min: 6,
            max: 16,
            message: this.$t("market.login.passwordInfo"),
            trigger: "blur",
          },
        ],
        checkPass: [
          {
            required: true,
            message: this.$t("market.login.inputPassword"),
            trigger: "blur",
          },
          {
            min: 6,
            max: 16,
            message: this.$t("market.login.passwordInfo"),
            trigger: "blur",
          },
        ],
        checkPass: [{ validator: validatePass2, trigger: "blur" }],
      },
    };
  },
  methods: {
    back() {
      this.$router.go(-1);
    },
    modifyPass() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          this.$market
            .call("cloud-user", "resetPass", {
              ticket: window.localStorage.ticket,
              oldPassword: sha1(this.data.oldPassword),
              newPassword: sha1(this.data.newPassword),
            })
            .then((data) => {
              this.$message({
                message: this.$t("market.login.modifySucc"),
                type: "success",
              });

              this.$router.push("/market/list");
            })
            .catch((err) => {
              this.$message({
                message: err,
                type: "error",
              });
            });
        } else {
          return false;
        }
      });
    },
  },
};
</script>
