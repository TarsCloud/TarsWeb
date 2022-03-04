<!--磁盘挂载管理-->
<template>
  <let-modal
    v-model="showPodLog"
    :title="podName + '(Stdout)'"
    width="80%"
    height="60%"
    :footShow="false"
    @close="closePodLog"
  >
    <div v-if="showPodLog" class="pre log-body">
      <div v-for="l in podLog" :key="l.id" class="log-msg">
        <span class="log-date">{{ l.time }}</span>
        <span :class="wrap ? 'wrap-lines' : ''" style="color:27aa5e">{{
          l.message
        }}</span>
      </div>
    </div>
    <let-checkbox v-model="wrap" @change="changeWrap">{{
      $t("operate.wrap")
    }}</let-checkbox>
    &nbsp;&nbsp;
    <let-checkbox v-model="previous" @change="changePrevious">{{
      $t("operate.previous")
    }}</let-checkbox>

    <span style="float:right">
      <let-button size="mini" theme="primary" @click="clearScreen">{{
        $t("operate.clear")
      }}</let-button>
      &nbsp;&nbsp;
      <let-button size="mini" @click="showPodLog = false">{{
        $t("operate.close")
      }}</let-button>
    </span>
  </let-modal>
</template>

<script>
import moment from "moment";

export default {
  props: [],
  name: "log",
  data() {
    return {
      showPodLog: false,
      podLog: [],

      podName: "",
      wrap: false,
      previous: false,

      socket: null,
    };
  },
  methods: {
    changeWrap() {},

    changePrevious() {
      this.podLog = [];

      this.readPodLog(this.podName);
    },
    clearScreen() {
      this.podLog = [];
    },
    closePodLog() {
      this.podLog = [];
    },
    show(PodName) {
      // console.log(row);
      this.podName = PodName;
      let url = "";
      if (window.location.protocol == "http:") {
        url = `ws://${window.location.host}/web/log?podName=${PodName}&previous=${this.previous}`;
      } else if (window.location.protocol == "https:") {
        url = `wss://${window.location.host}/web/log?podName=${PodName}&previous=${this.previous}`;
      } else {
        console.log("unknown protocol", window.location);
        return;
      }

      let that = this;

      if (this.socket) {
        this.socket.close();
      }
      this.socket = new WebSocket(url, "log-protocol");
      this.socket.onopen = () => {
        that.showPodLog = true;
        that.podLog = [];
      };

      this.socket.onerror = () => {
        console.log("[error] Connection error");
        that.socket = null;
      };

      this.socket.close = () => {
        console.log("[close] Connection closed cleanly");
        that.socket = null;
      };
      // 监听socket消息
      this.socket.onmessage = (msg) => {
        let pos = msg.data.indexOf(" ");

        that.podLog.push({
          id: that.podLog.length,
          time: moment(msg.data.substring(0, pos)).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          message: msg.data.substring(pos),
        });
      };

      // 发送socket消息
      this.socket.onsend = (data) => {
        that.socket.send(data);
      };
    },
  },
};
</script>

<style scoped></style>
