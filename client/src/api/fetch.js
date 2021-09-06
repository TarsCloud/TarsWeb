const axios = require('axios');

// 添加响应拦截器
axios.interceptors.response.use((response) => {
    if (response.status == 200 && response.data.code == -2) {
        document.location.href = '/login';
    }
    // 对响应数据做点什么
    if (response.status === 400 && response.data.errors.length > 0) {
        let message = '';
        response.data.errors.forEach((error) => {
            message += `${error.message}\n`;
        });
        return Promise.reject(message);
    }
    return response;
}, (error) => {
    console.log(error);
    return Promise.reject(error);
});
const ajaxRootPath = '';
export function post(url, data) {
    return axios.post(ajaxRootPath + url, data).then(ret => ret);
}

export function get(url, data) {
    return axios(ajaxRootPath + url, data).then(ret => ret);
}
export default axios;
