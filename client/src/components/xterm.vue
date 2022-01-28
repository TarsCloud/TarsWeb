<template>
  <div id="xterm" class="xterm-container"></div>
</template>

<script>
import "xterm/css/xterm.css";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
// import { AttachAddon } from "xterm-addon-attach";
import { WebLinksAddon } from "xterm-addon-web-links";

export default {
  data() {
    return {
      pingOk: true,
      resize: false,
      term: "",
      socket: "",
      app: "",
      server: "",
      pod: "",
      history: "",
      nodeip: "",
    };
  },
  mounted() {
    // let { app, server, pod, history, nodeip } = this;
    this.app = this.getQueryVariable("ServerApp");
    this.server = this.getQueryVariable("ServerName");
    this.pod = this.getQueryVariable("PodName");
    this.history = this.getQueryVariable("History");
    this.nodeip = this.getQueryVariable("NodeIP");

    document.title = this.app + "-" + this.server + "-" + this.nodeip;

    let query = window.location.search.substring(1);

    if (window.location.protocol == "http:") {
      this.init("ws://" + window.location.host + "/shell?" + query);
    } else if (window.location.protocol == "https:") {
      this.init("wss://" + window.location.host + "/shell?" + query);
    } else {
      console.log("unknown protocol", window.location);
    }
  },
  methods: {
    //节流,避免拖动时候频繁向后端请求更新
    debounce(fn, wait) {
      let timeout = null;
      return function() {
        if (timeout !== null) clearTimeout(timeout);
        timeout = setTimeout(fn, wait);
      };
    },
    //页面重新resize的时候,需要重新告诉后端cols和rows
    resizeScreen() {
      const fitAddon = new FitAddon();
      this.term.loadAddon(fitAddon);
      fitAddon.fit();
      this.send(
        JSON.stringify({
          operation: "resize",
          width: Math.floor(this.term.cols),
          height: Math.floor(this.term.rows),
        })
      );
    },
    ping() {
      if (this.pingOk) {
        this.pingOk = false;
        this.send(
          JSON.stringify({
            operation: "ping",
          })
        );

        setTimeout(() => {
          console.log("ping");
          this.ping();
        }, 5000);
      } else {
        location.reload();
      }
    },
    getQueryVariable(variable) {
      let query = window.location.search.substring(1);
      let vars = query.split("&");
      for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");
        if (pair[0] == variable) {
          return pair[1];
        }
      }
      return false;
    },
    initXterm() {
      this.term = new Terminal({
        rendererType: "canvas", //渲染类型
        convertEol: true, //启用时，光标将设置为下一行的开头
        scrollback: 2000, //终端中的回滚量
        disableStdin: false, //是否应禁用输入
        cursorStyle: "block", //光标样式
        cursorBlink: true, //光标闪烁
      });

      //在绑定的组件上初始化窗口
      this.term.open(document.getElementById("xterm"));

      //全屏
      this.resizeScreen();

      //加载weblink组件
      this.term.loadAddon(new WebLinksAddon());

      //监听resize,当窗口拖动的时候,监听事件,实时改变xterm窗口
      window.addEventListener(
        "resize",
        this.debounce(this.resizeScreen, 1000),
        false
      );

      //聚焦
      this.term.focus();

      // 支持输入与粘贴方法
      let _this = this;
      this.term.onData(function(key) {
        //这里key值是你输入的值，数据格式一定要找后端要！！！！
        let order = { operation: "stdin", data: key };
        _this.socket.onsend(JSON.stringify(order));

        if (!_this.resize) {
          _this.resize = true;
          _this.resizeScreen();
        }
      });
    },
    init(url) {
      // 实例化socket
      this.socket = new WebSocket(url, "echo-protocol");
      // 监听socket连接
      this.socket.onopen = this.open;
      // 监听socket错误信息
      this.socket.onerror = this.error;
      // 监听socket消息
      this.socket.onmessage = this.getMessage;
      // 发送socket消息
      this.socket.onsend = this.send;

      setTimeout(() => {
        this.ping();
      }, 5000);
    },
    open: function() {
      this.initXterm();
      this.term.writeln(
        `connecting to pod \x1B[1;3;31m ${this.pod} \x1B[0m ... \r\n`
      );
    },
    error: function() {
      console.log("[error] Connection error");
      setTimeout(() => {
        location.reload();
      }, 1000);
    },
    close: function() {
      this.socket.close();
      console.log("[close] Connection closed cleanly");
      term.writeln("");
      window.removeEventListener("resize", this.resizeScreen);
    },
    getMessage: function(msg) {
      // console.log(msg);

      const data = msg.data && JSON.parse(msg.data);
      if (data.operation === "stdout") {
        this.term.write(data.data);
      } else if (data.operation === "pong") {
        this.pingOk = true;
      }
    },
    send: function(order) {
      this.socket.send(order);
    },
  },
};
</script>

<style>
body {
  margin: 0;
  overflow: hidden;
  padding: 0;
}

.xterm-container {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}
</style>
