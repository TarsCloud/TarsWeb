<template>
  <div class="yaml-editor">
    <textarea ref="textarea" id="textarea"></textarea>
  </div>
</template>

<script>
// import CodeMirror from "codemirror/lib/codemirror";
import CodeMirror from "codemirror";
import "codemirror/addon/lint/lint.css";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/idea.css";
import "codemirror/mode/yaml/yaml";
import "codemirror/addon/lint/lint";
import "codemirror/addon/lint/yaml-lint";

window.jsyaml = require("js-yaml"); // 引入js-yaml为codemirror提高语法检查核心支持

export default {
  name: "yaml-editor",
  // eslint-disable-next-line vue/require-prop-types
  props: ["value"],
  data() {
    return {
      yamlEditor: false,
      diff: [],
    };
  },
  watch: {
    value(value) {
      const editorValue = this.yamlEditor.getValue();
      if (value !== editorValue) {
        this.yamlEditor.setValue(this.value);
      }
    },
  },
  mounted() {
    this.yamlEditor = CodeMirror.fromTextArea(this.$refs.textarea, {
      lineNumbers: true, // 显示行号
      mode: "text/x-yaml", // 语法
      theme: "idea", // 编辑器主题
      lint: true, // 开启语法检查
      lineWrapping: true,
      autofocus: true,
      extraKeys: { "Ctrl-Space": "autocomplete" },
      foldGutter: true,
      gutters: ["CodeMirror-lint-markers"], // 语法检查器
      smartIndent: true,
    });
    this.yamlEditor.on("change", (cm) => {
      this.$emit("changed", cm.getValue());
      this.$emit("input", cm.getValue());
    });
    this.yamlEditor.setValue(this.value);

    this.$nextTick(() => {
      let that = this;

      //未知, 必须要要这样才能显示 否则非要点击一次才能显示
      setInterval(() => {
        that.yamlEditor.refresh();
      }, 500);
    });
  },
  methods: {
    getValue() {
      return this.yamlEditor.getValue();
    },
    refresh() {
      this.yamlEditor.refresh();
    },
    readonly() {
      this.yamlEditor.setOption("readOnly", true);
    },
  },
};
</script>

<style scoped>
.yaml-editor {
  height: 70%;
}

.yaml-editor >>> .CodeMirror {
  min-height: 615px;
}
</style>
