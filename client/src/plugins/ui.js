import Vue from 'vue';
import letUI from 'let-ui';
import 'let-ui/lib/lib.min.css';

import '@/assets/css/let-ui.css';
import Icon from '@/components/icon';
import TarsFormItem from '@/components/tars-form-item';

Vue.use(letUI);
Vue.component(Icon.name, Icon);
Vue.component(TarsFormItem.name, TarsFormItem);

/* eslint-disable no-underscore-dangle */
const LetUILoading = Vue.prototype.$Loading;

function Loading(el) {
  this.el = el;
  this.loading = null;
}

Loading.prototype.show = function show(selector, options) {
  if (typeof selector === 'object') {
    options = selector;
    selector = null;
  }
  if (this.loading) {
    this.hide();
  }
  const el = this.el;
  const loading = LetUILoading({
    fullScreen: !el,
    target: el && selector ? el.querySelector(selector) : el,
    boxClass: 'loading-inner',
    background: 'rgba(0,0,0,0)',
    color: '#fff',
    size: 24,
    ...options,
  });
  loading.show();
  this.loading = loading;
  return this;
};

Loading.prototype.hide = function hide() {
  if (this.loading) {
    this.loading.hide();
    this.loading = null;
  }
  return this;
};

Loading.show = function show(...args) {
  if (!Loading._loading) {
    Loading._loading = new Loading();
  }
  return Loading._loading.show(...args);
};

Loading.hide = function hide() {
  if (!Loading._loading) {
    Loading._loading = new Loading();
  }
  return Loading._loading.hide();
};

LetUILoading.show = Loading.show;
LetUILoading.hide = Loading.hide;
Object.defineProperty(Vue.prototype, '$loading', {
  get() {
    if (!this._loading) {
      this._loading = new Loading(this.$el);
    }
    return this._loading;
  },
});

Object.defineProperty(Vue.prototype, '$tip', {
  get() {
    return this.$Notice;
  },
});
