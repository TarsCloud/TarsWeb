const axios =  require('./fetch');

export function getoption(data) {
    return axios.get('/home/getoption',{params:data}).then(ret => ret.data);
}

export function trees(data) {
    return axios.get('/home/tree',{params:data}).then(ret => ret.data);
}

export function tars_call_serve(data) {
    return axios.get('/home/tars_call_serve',{params:data}).then(ret => ret.data);
}

export function tars_call_serve1(data) {
    return axios.get('/home/tars_call_serve1',{params:data}).then(ret => ret.data);
}

export function tars_call_serve2(data) {
    return axios.get('/server/api/getAverage',{params:data}).then(ret => ret.data);
}

export function getlabel(data) {
    return axios.get('/server/api/getlabel',{params:data}).then(ret => ret.data);
}

export function client_time(data) {
    return axios.get('/home/client_time',{params:data}).then(ret => ret.data);
}

export function server_time(data) {
    return axios.get('/home/server_time',{params:data}).then(ret => ret.data);
}

export function detail(data) {
    return axios.get('/server/api/detail',{params:data}).then(ret => ret.data);
}
export function func(data) {
    return axios.get('/server/api/func',{params:data}).then(ret => ret.data);
}

export function detail1(data) {
    return axios.get('/server/api/detail1',{params:data}).then(ret => ret.data);
}
