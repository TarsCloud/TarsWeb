export const formatJson = function (json, options) {

    var reg = null,
        formatted = '',
        pad = 0,
        PADDING = '    ';
    options = options || {};
    options.newlineAfterColonIfBeforeBraceOrBracket = (options.newlineAfterColonIfBeforeBraceOrBracket === true) ? true : false;
    options.spaceAfterColon = (options.spaceAfterColon === false) ? false : true;
    if (typeof json !== 'string') {
        json = JSON.stringify(json);
    } else {
        json = JSON.parse(json);
        json = JSON.stringify(json);
    }
    reg = /([\{\}])/g;
    json = json.replace(reg, '\r\n$1\r\n');
    reg = /([\[\]])/g;
    json = json.replace(reg, '\r\n$1\r\n');
    reg = /(\,)/g;
    json = json.replace(reg, '$1\r\n');
    reg = /(\r\n\r\n)/g;
    json = json.replace(reg, '\r\n');
    reg = /\r\n\,/g;
    json = json.replace(reg, ',');
    if (!options.newlineAfterColonIfBeforeBraceOrBracket) {
        reg = /\:\r\n\{/g;
        json = json.replace(reg, ':{');
        reg = /\:\r\n\[/g;
        json = json.replace(reg, ':[');
    }
    if (options.spaceAfterColon) {
        reg = /\:/g;
        json = json.replace(reg, ':');
    }
    (json.split('\r\n')).forEach(function (node, index) {
            var i = 0,
                indent = 0,
                padding = '';

            if (node.match(/\{$/) || node.match(/\[$/)) {
                indent = 1;
            } else if (node.match(/\}/) || node.match(/\]/)) {
                if (pad !== 0) {
                    pad -= 1;
                }
            } else {
                indent = 0;
            }

            for (i = 0; i < pad; i++) {
                padding += PADDING;
            }

            formatted += padding + node + '\r\n';
            pad += indent;
        }
    );
    return formatted;
};
let length1 = 0
export const getdetail = function (val, servers, clientTime, serverTime, timesArr, btime) {
    let arr = []
    let ctime = 0
    val.children.forEach((item, i) => {

        servers.push(val.data.name + "调用" + item.children[0].data.name)
        clientTime.push(item.data.value)
        serverTime.push(item.children[0].data.value)


        if (i >= 1) {
            btime = ctime
            timesArr.push(btime)
        } else {
            timesArr.push(btime)
        }
        ctime = timesArr[timesArr.length - 1] + item.data.value
        if (item.children[0].children) {
            getdetail(item.children[0], servers, clientTime, serverTime, timesArr, btime + (item.data.value - item.children[0].data.value) / 2)
        } else {
            return 0
        }
    })

};
export const unique = function (arr) {
    return [...new Set(arr)];
}

export const transTree = function (obj, sourceArr, targetArr, servers, clientTime, serverTime, btimeArr, retArr, csDataArr, srDataArr, ssDataArr, crDataArr) {
    debugger

    let btime = 0
    obj.forEach(item => {
        item.btime = btime
        if (sourceArr.length >= 1 && item.source == targetArr[targetArr.length - 1]) {
            item.btime = btimeArr[btimeArr.length - 1] + (clientTime[clientTime.length - 1] - serverTime[serverTime.length - 1]) / 2
        } else if (targetArr.length >= 1) {
            sourceArr.forEach((items, i) => {
                if (items == item.source) {
                    item.btime = btimeArr[i] + clientTime[i]
                }
            })
        }
        btimeArr.push(item.btime)
        sourceArr.push(item.source)
        targetArr.push(item.target)
        if (item.source.length > item.target.length) {
            servers.push(item.source + "\n" + "调用" + item.target)
        } else {
            servers.push(item.source + "调用" + "\n" + item.target)
        }

        clientTime.push(item.client_time)
        serverTime.push(item.server_time)
        if (!!retArr) {
            retArr.push(item.ret);
        }
        if (!!csDataArr) {
            csDataArr.push(item.csData);
        }
        if (!!srDataArr) {
            srDataArr.push(item.srData);
        }
        if (!!ssDataArr) {
            ssDataArr.push(item.ssData);
        }
        if (!!crDataArr) {
            crDataArr.push(item.crData);
        }

    })

}
export const transTree1 = function (obj, sourceArr, targetArr, servers, clientTime, serverTime, btimeArr) {


    obj.forEach(item => {
        item.btime = item.startTimeStamp
        btimeArr.push(item.btime)
        sourceArr.push(item.source)
        targetArr.push(item.target)
        if (item.source.length > item.target.length) {
            servers.push(item.source + "\n" + "调用" + item.target)
        } else {
            servers.push(item.source + "调用" + "\n" + item.target)
        }

        clientTime.push(item.client_time)
        serverTime.push(item.server_time)

    })

}
export const getAll = function (obj, objs, k, length, d) {

    if (length > 1) {

        for (let i = 0; i < length; i++) {
            let flag = true
            objs.forEach((item, indexs) => {

                //console.log("1");
                if (obj[i].target == item.source) {
                    if (flag) {
                        obj.push(obj[i])
                        obj.push(item)
                    } else {
                        obj.push(item)
                    }
                    //console.log("2");
                    // //console.log("obji",obj[i]);
                    // //console.log("item",item);
                    flag = false
                    getAll(obj, objs, obj.length - 1, 1, d)

                }
                if (indexs == objs.length - 1 && flag == true) {
                    //console.log("3");
                    obj.push(obj[i])
                }

                if (i == length - 1 && indexs == objs.length - 1) {
                    obj.splice(0, length)
                }

            })

        }
    } else {
        objs.forEach(item => {

            if (obj[k].target == item.source) {
                if (obj[k].target == d) {
                    return
                }
                obj.push(item)
                //console.log("4");
                //console.log("obj[k].target",obj[k]);
                //console.log("item.source",item);
                getAll(obj, objs, obj.length - 1, 1, d)

            } else {
                return
            }
        })
    }

};
// sessionStorage
export const session = function (key, value) {
    if (value === 0) {
        let lsVal = sessionStorage.getItem(key);
        if (lsVal && lsVal.indexOf('autostringify-') === 0) {
            return JSON.parse(lsVal.split('autostringify-')[1]);
        }
        return lsVal;
    }
    if (typeof (value) === 'object' || Array.isArray(value)) {
        value = `autostringify-${JSON.stringify(value)}`;
    }
    return sessionStorage.setItem(key, value);
};

// 生成随机数
export const getUUID = function (len) {
    len = len || 6;
    len = parseInt(len, 10);
    len = isNaN(len) ? 6 : len;
    let seed = '0123456789abcdefghijklmnopqrstubwxyzABCEDFGHIJKLMNOPQRSTUVWXYZ';
    let seedLen = seed.length - 1;
    let uuid = '';
    while (len--) {
        uuid += seed[Math.round(Math.random() * seedLen)];
    }
    return uuid;
};
// 深拷贝
export const deepcopy = function (source) {
    if (!source) {
        return source;
    }
    let sourceCopy = source instanceof Array ? [] : {};
    for (let item in source) {
        sourceCopy[item] = typeof source[item] === 'object' ? deepcopy(source[item]) : source[item];
    }
    return sourceCopy;
};
// 菜单数据组织
export const buildMenu = function (array, ckey) {
    let menuData = [];
    let indexKeys = Array.isArray(array) ? array.map((e) => {
        return e.id;
    }) : [];
    ckey = ckey || 'parent_id';
    array.forEach(function (e) {
        // 一级菜单
        if (!e[ckey] || (e[ckey] === e.id)) {
            delete e[ckey];
            menuData.push(deepcopy(e)); // 深拷贝
        } else if (Array.isArray(indexKeys)) {
            // 检测ckey有效性
            let parentIndex = indexKeys.findIndex(function (id) {
                return id == e[ckey];
            });
            if (parentIndex === -1) {
                menuData.push(e);
            }
        }
    });
    let findChildren = function (parentArr) {
        if (Array.isArray(parentArr) && parentArr.length) {
            parentArr.forEach(function (parentNode) {
                array.forEach(function (node) {
                    if (parentNode.id === node[ckey]) {
                        if (parentNode.children) {
                            parentNode.children.push(node);
                        } else {
                            parentNode.children = [node];
                        }
                    }
                });
                if (parentNode.children) {
                    findChildren(parentNode.children);
                }
            });
        }
    };
    findChildren(menuData);
    return menuData;
};
// 日期格式化
export const dateFormat = function (source, ignore_minute) {
    let myDate;
    let separate = '-';
    let minute = '';
    if (source === 0) {
        source = new Date();
    }
    if (source) {
        if (source.split) {
            source = source.replace(/\-/g, '/');
        } else if (isNaN(parseInt(source))) {
            source = source.toString().replace(/\-/g, '/');
        } else {
            source = new Date(source);
        }

        if (new Date(source) && (new Date(source)).getDate) {
            myDate = new Date(source);
            if (!ignore_minute) {
                minute = `${(myDate.getHours() < 10 ? ' 0' : ' ') + myDate.getHours()}:${myDate.getMinutes() < 10 ? '0' : ''}${myDate.getMinutes()}`;
            }
            return myDate.getFullYear() + separate + (myDate.getMonth() + 1) + separate + (myDate.getDate() < 10 ? '0' : '') + myDate.getDate() + minute;
        }
        return source.slice(0, 16);
    }
    return source;
};
// ajax错误处理

export const getCookie = function (name) {
    let arr;
    let
        reg = new RegExp(`(^| )${name}=([^;]*)(;|$)`);

    if (arr = document.cookie.match(reg)) {
        return unescape(arr[2]);
    } else {
        return null;
    }
};
// 设置cookie
export const setCookie = function (cname, cvalue, exdays) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = `expires=${d.toUTCString()}`;

    document.cookie = `${cname}=${cvalue}; ${expires}; path=/`;
};
// 清除cookie
export const deleteCookie = function (name) {
    setCookie(name, '', -1);
};
// 清除指定域名的cookie
export const deleteCookieWithDomain = function (name, domain) {
    let d = new Date();
    d.setTime(d.getTime() + (-1 * 24 * 60 * 60 * 1000));
    let expires = `expires=${d.toUTCString()}`;

    document.cookie = `${name}=` + '' + `; ${expires}; path=/` + `;domain=${domain}`;
};
