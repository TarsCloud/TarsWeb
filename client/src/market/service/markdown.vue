<template>
  <div class="markdown-body hljs" v-html="html"></div>
</template>

<script>
import AjaxUtil from "@/lib/ajax";
import { marked } from "marked";
import hljs from "highlight.js";
import "@/assets/css/github-markdown-light.css";

marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: "hljs language-",
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false,
});

let Ajax = new AjaxUtil();

export default {
  name: "Markdown",
  data() {
    return { html: "" };
  },
  props: ["serviceVersion", "file"],
  methods: {
    markdownToHtml(markdown) {
      this.html = marked.parse(markdown);
    },
    fetchReadme(file) {
      Ajax.getPlain(file)
        .then((data) => {
          if (data.ok) {
            data.text().then((content) => {
              this.markdownToHtml(content);
            });
          }
        })
        .catch((err) => {
          this.$message({
            message: err,
            type: "error",
          });
        });
    },
  },
  created() {
    window.fetchReadme = this;
  },
  mounted() {
    let that = this;

    // Override function
    const renderer = {
      link(href, title, text) {
        let out = "";

        if (href.startsWith("#")) {
          //锚点
          out =
            "<a href=\"javascript:document.getElementById('" +
            href.substring(1) +
            "').scrollIntoView();\"";
        } else if (href.startsWith("http://") || href.startsWith("https://")) {
          out = '<a target="_black" href="' + href + '"';
        } else {
          href = that.file.substr(0, that.file.lastIndexOf("/")) + "/" + href;

          out =
            "<a javascript=':;' href='#' onclick=\"doFetchReadme('" +
            href +
            "')\"";
        }

        if (title) {
          out += ' title="' + title + '"';
        }
        out += ">" + text + "</a>";
        return out;
      },

      image(href, title, text) {
        if (href.indexOf("/") != 0) {
          href = that.serviceVersion.prefix + href;
        }

        let out =
          '<div class="images" v-viewer><img src="' +
          href +
          '" alt="' +
          text +
          '"';

        out += "> </div>";

        return out;
      },
    };

    marked.use({ renderer });

    that.fetchReadme(this.file);
  },
};

window.doFetchReadme = (file) => {
  window.fetchReadme.fetchReadme(file);
};
</script>

<style>
ol,
ul,
li {
  list-style: disc outside none;
}
</style>
