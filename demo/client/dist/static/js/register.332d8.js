webpackJsonp([2],{"3NoR":function(e,t,n){"use strict";var r=n("Dd8w"),o=n.n(r),i=n("pFYg"),a=n.n(i),u=n("7+uW"),s=n("QpGM"),l=n.n(s),c=(n("XSxf"),n("K/Lq")),f=n.n(c),d=(n("s2Rr"),{name:"Icon",props:{name:{type:String,required:!0}}}),h={render:function(){var e=this.$createElement,t=this._self._c||e;return t("svg",{staticClass:"icon"},[t("use",{attrs:{"xlink:href":"#"+this.name}})])},staticRenderFns:[]};var p=n("VU/8")(d,h,!1,function(e){n("tir4")},null,null).exports,g={name:"TarsFormItem",props:{label:String}},v={render:function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("let-form-item",{staticClass:"tars-form-item"},[n("label",{staticClass:"let-form-item__label let-label__position_top clickable",on:{click:function(t){e.$emit("onLabelClick")}}},[e._v(e._s(e.label))]),e._v(" "),e._t("default")],2)},staticRenderFns:[]};var m=n("VU/8")(g,v,!1,function(e){n("YSD2")},null,null).exports,w=n("Z/F5"),F=n.n(w),D=n("aqzs"),_=n.n(D);u.default.use(l.a,{locale:{en:_.a,cn:F.a}[f.a.get("locale")||"cn"]||F.a}),u.default.component(p.name,p),u.default.component(m.name,m);var y=u.default.prototype.$Loading;function b(e){this.el=e,this.loading=null}b.prototype.show=function(e,t){"object"===(void 0===e?"undefined":a()(e))&&(t=e,e=null),this.loading&&this.hide();var n=this.el,r=y(o()({fullScreen:!n,target:n&&e?n.querySelector(e):n,boxClass:"loading-inner",background:"rgba(0,0,0,0)",color:"#fff",size:24},t));return r.show(),this.loading=r,this},b.prototype.hide=function(){return this.loading&&(this.loading.hide(),this.loading=null),this},b.show=function(){var e;return b._loading||(b._loading=new b),(e=b._loading).show.apply(e,arguments)},b.hide=function(){return b._loading||(b._loading=new b),b._loading.hide()},y.show=b.show,y.hide=b.hide,Object.defineProperty(u.default.prototype,"$loading",{get:function(){return this._loading||(this._loading=new b(this.$el)),this._loading}}),Object.defineProperty(u.default.prototype,"$tip",{get:function(){return this.$Notice}})},"86n0":function(e,t,n){"use strict";var r=n("mvHQ"),o=n.n(r),i=n("//Fk"),a=n.n(i),u=n("Zrlr"),s=n.n(u),l=n("wxAW"),c=n.n(l),f=n("fZjL"),d=n.n(f),h=n("woOf"),p=n.n(h),g=n("pFYg"),v=n.n(g),m=function(e){return"string"==typeof e},w=Array.isArray,F=function(e){return"object"===(void 0===e?"undefined":v()(e))&&null!==e},D=function(e){return"function"==typeof e},_=p.a;function y(e){return String(e).replace(/(?:[\0- "-&\+-\}\x7F-\xA8\xAA-\xAD\xAF-\u2121\u2123-\u23E8\u23F0-\u23F2\u23F4-\u23F7\u23FB-\u24C1\u24C3-\u25B5\u25B7-\u25FF\u27C0-\u2933\u2936-\u2B04\u2B08-\u2B1A\u2B1D-\u2B4F\u2B51-\u2B54\u2B56-\u302F\u3031-\u303C\u303E-\u3296\u3298\u329A-\uD7FF\uE000-\uFFFF]|[\uD800-\uD83B\uD83F-\uDBFF][\uDC00-\uDFFF]|\uD83C[\uDC00-\uDC03\uDC05-\uDCCE\uDCD0-\uDD6F\uDD72-\uDD7D\uDD80-\uDD8D\uDD8F\uDD90\uDE52-\uDEFF]|\uD83D[\uDE50-\uDE7F\uDF00-\uDFFF]|\uD83E[\uDC00-\uDCFF\uDE00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g,encodeURIComponent).replace(/ /g,"+").replace(/[!'()~*]/g,function(e){return"%"+e.charCodeAt().toString(16).slice(-2).toUpperCase()})}function b(e){if(!e)return"";var t=[];return d()(e).forEach(function(n){var r=e[n];null!==r&&void 0!==r||(r=""),t.push(y(n)+"="+y(r))}),t.join("&").replace(/%20/g,"+")}function C(e){return b(d()(e).reduce(function(t,n){return function e(t,n,r){return w(r)||F(r)?(d()(r).forEach(function(o){e(t,n+"["+o+"]",r[o])}),t):(t[n]=r,t)}(t,n,e[n])},{}))}var k=function(){function e(t){s()(this,e),this.defaults=t}return c()(e,[{key:"get",value:function(e){return _({},this.defaults,e)}},{key:"set",value:function(e,t){var n=this;if(e){if(m(e)){var r=e.split(".");r.reduce(function(e,n,o){return o===r.length-1&&(e[n]=t),e[n]},this.defaults)}F(e)&&d()(e).forEach(function(t){n.set(t,e[t])}),w(e)&&e.forEach(function(e){return n.set(e,t)})}}},{key:"remove",value:function(e){var t=this;if(e){if(m(e)){var n=e.split(".");n.reduce(function(e,t,r){return r===n.length-1&&delete e[t],e[t]},this.defaults)}w(e)&&e.forEach(function(e){return t.remove(e)})}}}]),e}(),$=function(){function e(t){s()(this,e),this.handler=t}return c()(e,[{key:"set",value:function(e){D(e)&&(this.handler=e)}},{key:"exec",value:function(){D(this.handler)&&this.handler.apply(null,arguments)}}]),e}(),E=new(function(){function e(t){s()(this,e),this.base=t||""}return c()(e,[{key:"set",value:function(e){m(e)&&(this.base=e)}},{key:"get",value:function(e){return this.base+(e||"")}}]),e}()),x=new k({credentials:"same-origin",timeout:1e4}),S=new k({"X-Requested-With":"XMLHttpRequest"}),P=new k({}),O=new $,R=new $(function(){return!0});function j(e,t){var n=b(P.get(t));return n&&(n=-1===e.indexOf("?")?"?"+n:"&"+n),e+n}function T(e){var t=e.status;if(t>=200&&t<300||304===t)return e;throw O.exec(t,e),new Error(e.statusText)}function N(e){return e.json().then(null,function(t){return O.exec(500,e),a.a.reject(t)})}function q(e){return R.handler(e)?e:a.a.reject(e)}function A(e){return a.a.reject(e)}t.a={ServerUrl:E,Options:x,Headers:S,Body:P,StatusHandler:O,ResultHandler:R,get:function(e,t){var n=x.get({headers:S.get()});return fetch(E.get(j(e,t)),n).then(T).then(N).catch(A)},getJSON:function(e,t){var n=x.get({headers:S.get()});return fetch(E.get(j(e,t)),n).then(T).then(N).then(q).catch(A)},post:function(e,t){var n=x.get({method:"POST",headers:S.get({"Content-Type":"application/x-www-form-urlencoded"}),body:C(P.get(t))});return fetch(E.get(e),n).then(T).then(N).then(q).catch(A)},postForm:function(e,t){var n=x.get({method:"POST",headers:S.get(),body:t}),r=P.get({});return d()(r).forEach(function(e){t.append(e,r[e])}),fetch(E.get(e),n).then(T).then(N).then(q).catch(A)},postJSON:function(e,t){var n=x.get({method:"POST",headers:S.get({Accept:"application/json","Content-Type":"application/json"}),body:o()(P.get(t))});return fetch(E.get(e),n).then(T).then(N).then(q).catch(A)},put:function(e,t){var n=x.get({method:"PUT",headers:S.get({"Content-Type":"application/x-www-form-urlencoded"}),body:C(P.get(t))});return fetch(E.get(e),n).then(T).then(N).then(q).catch(A)},remove:function(e,t){var n=x.get({method:"DELETE",headers:S.get()});return fetch(E.get(j(e,t)),n).then(T).then(N).then(q).catch(A)},download:function(e,t){window.open(E.get(j(e,t)))}}},Cp0g:function(e,t,n){"use strict";n.d(t,"a",function(){return c}),n.d(t,"c",function(){return f}),t.b=function(){return new o.a(function(e,t){l.a.getJSON("/api/get_locale").then(function(t){var n=s.a.get("locale");if("[object Object]"==Object.prototype.toString.call(t)){for(var r in t)c.setLocaleMessage(r,t[r]),f.push({localeCode:r,localeName:t[r].localeName,localeMessages:t});n=t[n]?n:"cn",f=t}c.locale=n,e()}).catch(function(e){t(e)})})};var r=n("//Fk"),o=n.n(r),i=n("7+uW"),a=n("TXmL"),u=n("K/Lq"),s=n.n(u),l=n("86n0");i.default.use(a.a),i.default.use(s.a);var c=new a.a({}),f=[]},"EN/e":function(e,t){},F4AJ:function(e,t){},RgEz:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n("7+uW"),o=(n("3NoR"),n("sVYP"),{name:"login_page",data:function(){return{uid:"",password:"",repeatPassword:""}},computed:{redirectUrl:function(){var e="redirect_url=",t=location.search.indexOf(e);return t>-1?decodeURIComponent(location.search.substring(t+e.length)):"/"}},components:{localeSelect:n("ZZJ4").a},methods:{register:function(){var e=this;if(this.$refs.form.validate())if(this.checkRepeatPwdValid()){var t=this.$Loading.show();this.$ajax.postJSON("/api/register",{uid:this.uid,password:this.password,repeat_password:this.repeatPassword}).then(function(n){t.hide(),e.$tip.success(""+e.$t("login.registerSucc")),setTimeout(function(){e.toLoginPage()},2e3)}).catch(function(n){t.hide(),e.$tip.error(e.$t("login.registerFailed")+": "+(n.err_msg||n.message))})}else this.$tip.error(""+this.$t("login.passwordDiff"))},checkRepeatPwdValid:function(){return this.repeatPassword===this.password},toLoginPage:function(){location.href="/login.html?redirect_url="+encodeURIComponent(this.redirectUrl)}}}),i={render:function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"login_page"},[n("h1",{staticClass:"top-title"},[e._v("\n    "+e._s(e.$t("login.registerTitle"))+"\n    "),n("div",{staticClass:"locale-wrap"},[n("locale-select")],1)]),e._v(" "),n("let-form",{ref:"form",attrs:{inline:"","label-position":"top",itemWidth:"440px"},nativeOn:{submit:function(t){return t.preventDefault(),e.register(t)}}},[n("let-form-item",{attrs:{label:e.$t("login.userName"),required:""}},[n("let-input",{attrs:{size:"small",required:"","required-tip":e.$t("login.userNameTips"),pattern:"^[a-zA-Z0-9_]+$","pattern-tip":e.$t("login.userNameRegTips")},on:{keydown:function(t){return"button"in t||!e._k(t.keyCode,"enter",13,t.key,"Enter")?e.register(t):null}},model:{value:e.uid,callback:function(t){e.uid=t},expression:"uid"}})],1),e._v(" "),n("let-form-item",{attrs:{label:e.$t("login.password"),required:""}},[n("let-input",{attrs:{type:"password",size:"small",required:"","required-tip":e.$t("login.passwordTips")},on:{keydown:function(t){return"button"in t||!e._k(t.keyCode,"enter",13,t.key,"Enter")?e.register(t):null}},model:{value:e.password,callback:function(t){e.password=t},expression:"password"}})],1),e._v(" "),n("let-form-item",{attrs:{label:e.$t("login.repeatPassword"),required:""}},[n("let-input",{attrs:{type:"password",size:"small",required:"","required-tip":e.$t("login.repeatPasswordTips")},on:{keydown:function(t){return"button"in t||!e._k(t.keyCode,"enter",13,t.key,"Enter")?e.register(t):null}},model:{value:e.repeatPassword,callback:function(t){e.repeatPassword=t},expression:"repeatPassword"}})],1),e._v(" "),n("let-button",{attrs:{type:"submit",theme:"primary"}},[e._v(e._s(e.$t("login.register")))]),e._v(" "),n("let-button",{staticStyle:{float:"right","margin-right":"12px"},attrs:{type:"button"},on:{click:function(t){return t.preventDefault(),e.toLoginPage(t)}}},[e._v(e._s(e.$t("login.toLoginPage")))])],1)],1)},staticRenderFns:[]};var a=n("VU/8")(o,i,!1,function(e){n("EN/e")},null,null).exports,u=n("Cp0g");r.default.config.productionTip=!1,u.b.call(this).then(function(){new r.default({el:"#register-app",i18n:u.a,components:{register:a},template:"<register/>"})})},XSxf:function(e,t){},YSD2:function(e,t){},ZZJ4:function(e,t,n){"use strict";var r=n("Cp0g"),o={data:function(){return{locale:this.$cookie.get("locale")||"cn",localeMessages:r.c}},methods:{changeLocale:function(){this.$cookie.set("locale",this.locale,{expires:"1Y"}),location.reload()}}},i={render:function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("let-select",{ref:"localSelect",attrs:{clearable:!1,size:"small"},on:{change:e.changeLocale},model:{value:e.locale,callback:function(t){e.locale=t},expression:"locale"}},[e._l(e.localeMessages,function(t){return[n("let-option",{attrs:{value:t.localeCode}},[e._v(e._s(t.localeName))])]})],2)],1)},staticRenderFns:[]};var a=n("VU/8")(o,i,!1,function(e){n("F4AJ")},null,null);t.a=a.exports},s2Rr:function(e,t){},sVYP:function(e,t,n){"use strict";var r=n("rplX"),o=(n.n(r),n("7+uW")),i=n("86n0");i.a.ResultHandler.set(function(e){return!(!e||200!==e.ret_code||null==e.data)}),["getJSON","postJSON"].forEach(function(e){var t=i.a[e];i.a["_"+e]=t,i.a[e]=function(){for(var e=arguments.length,n=Array(e),r=0;r<e;r++)n[r]=arguments[r];return t.call.apply(t,[null].concat(n)).then(function(e){return e.data})}}),Object.defineProperty(o.default.prototype,"$ajax",{get:function(){return i.a}})},tir4:function(e,t){}},["RgEz"]);