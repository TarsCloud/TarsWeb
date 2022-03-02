<template>
  <div style="padding: 20px; width: 75%">
    <div class="markdown-body hljs" v-html="html"></div>
    <div class="fix_nav">
      <div class="tit_index">
        {{ $t("market.index.directory") }}
      </div>
      <ul></ul>
      <div class="cur_bg"></div>
    </div>
  </div>
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

      this.$nextTick(() => {
        // 展示右侧导航
        var list = [],
          idList = [];
        $(".cur_bg").css("top", 0);

        $("main h1,main h2,main h3").each(function(i) {
          $(this).attr("role", i);
          idList.push(i);
          list.push(
            '<li class="' +
              ($(this).get(0).tagName == "H2"
                ? "h2"
                : $(this).get(0).tagName == "H1"
                ? "h1"
                : "h3") +
              '"><a href="javascript:document.getElementById(&apos;' +
              $(this).attr("id") +
              '&apos;).scrollIntoView()">' +
              $(this).text() +
              "</a></li>"
          );
        });
        function showFixNav() {
          $(".fix_nav ul").html(list);
          $(".fix_nav ul li")
            .eq(0)
            .addClass("active");
        }

        showFixNav();

        $("main").scroll(function() {
          if (
            $("main").scrollTop() + $("main").height() >=
            $("main>div").height()
          ) {
            $(".fix_nav ul li")
              .eq(idList.length - 1)
              .addClass("active")
              .siblings()
              .removeClass("active");
            $(".cur_bg").css("top", (idList.length - 1) * 26);
          } else {
            for (let i = 0; i < idList.length; i++) {
              if (
                $('[role ="' + idList[i] + '"]').offset() != null &&
                $('[role ="' + idList[i + 1] + '"]').offset() != null
              ) {
                if (
                  $('[role ="' + idList[i] + '"]').offset().top - 100 < 0 &&
                  $('[role ="' + idList[i + 1] + '"]').offset().top > 0
                ) {
                  $(".fix_nav ul li")
                    .eq(i)
                    .addClass("active")
                    .siblings("li")
                    .removeClass("active");
                  $(".cur_bg").css("top", i * 26);
                }
              }
            }
          }
        });

        $(".fix_nav ul li a").on("click", function() {
          $("this")
            .parent()
            .addClass("active")
            .siblings()
            .removeClass("active");
          $(".cur_bg").css(
            "top",
            $(this)
              .parent()
              .index() * 26
          );
        });

        $(".fix_nav").toggleClass("show");
      });
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
.table_wrap {
  width: calc(100% - 0px);
  overflow-x: auto;
  margin-bottom: 30px;
}
.table_wrap table {
  margin: 0;
}

.fix_nav {
  position: fixed;
  right: 10px;
  top: 120px;
  padding-left: 0px;
  border-left: 2px solid #eeeff1;
  width: 18%;
}
.fix_nav ul {
  position: relative;
  z-index: 2;
  margin-bottom: 0;
  padding-left: 10px;
}
.fix_nav li {
  margin: 0;
  line-height: 1.2;
  list-style: none;
  height: 26px;
  line-height: 26px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.fix_nav li.h2 {
  list-style: square;
  list-style-position: inside;
  padding-left: 0px;
}
.fix_nav li.h3 {
  list-style: circle;
  list-style-position: inside;
  padding-left: 10px;
}

.fix_nav li a {
  text-decoration: none;
}
.fix_nav li.h1 a {
  font-weight: bold;
  color: #333;
}
.fix_nav li.h2 a {
  padding-left: 0px;
  position: relative;
  left: -10px;
}

.fix_nav li.active a {
  color: #4d7fbf;
}
.fix_nav li a {
  color: #666;
  font-size: 12px;
  line-height: 26px;
  height: 26px;
  margin: 0 !important;
}

.cur_bg {
  position: absolute;
  background: #f0f7ff;
  height: 26px;
  width: 100%;
  border-left: 2px solid #4d7fbf;
  left: -2px;
  top: 0;
  transition: all 0.25s ease-out;
}

.tit_index {
  position: absolute;
  top: -24px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #999;
}
.viewer-navbar {
  display: none;
}
</style>
