import 'whatwg-fetch';
import Vue from 'vue';

import Ajax from '@/lib/ajax';

Ajax.ServerUrl.set('/pages');
Ajax.ResultHandler.set((result) => {
  if (result && result.ret_code === 200 && result.data != null) {
    return true;
  }
  return false;
});

['getJSON', 'postJSON'].forEach((method) => {
  const originHandler = Ajax[method];
  Ajax[`_${method}`] = originHandler;
  Ajax[method] = (...args) => originHandler.call(null, ...args).then(res => res.data);
});

Object.defineProperty(Vue.prototype, '$ajax', {
  get() {
    return Ajax;
  },
});
