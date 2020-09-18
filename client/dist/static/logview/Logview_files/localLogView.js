$(function() {
    var lineNumEle = $('select[name="lines"]'),
        fileListEle = $('select[name="file_name"]'),
        searchSignEle = $('select[name="search_sign"]'),
        leftEle = $('.log_left'),
        logWinEle = $('#log_win'),
        userName = $('[name="user_name"]').val(),
        refreshTimeout = null,
        envCode = getUrlParams('env_code', location.href) || '',
        path = $('[name="path"]').val();


    var arr = path.split(':')
    var ip = (arr[0] || '');
    var arr = (arr[1] || '').split('/');

    var app = getThisParams("app");
    var server_name = getThisParams("server_name");
    var node_name = getThisParams("node_name");

    //生成下拉框
    cloudjs(lineNumEle).combobox();
    cloudjs(fileListEle).combobox();
    cloudjs(searchSignEle).combobox();
    cloudjs('.ctip').tips({
        position: 'down'
    });
    //自适应高度
    var percent;

    function setWinStyle() {
        var wH = $(window).height(),
            wW = $('body').width();
        leftEle.height(wH).width(500);
        logWinEle.width(wW - 500);
        logWinEle.height(wH).css({ right: 0, left: 500 });
    }

    setWinStyle();


    var resizeTimeout = null;
    var resizingFlag = false; //正在手动缩放标志
    $(window).resize(function() {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        if (resizingFlag) {
            return;
        }
        resizeTimeout = setTimeout(function() {
            setWinStyle();
            resizeTimeout = null;
        }, 150);
    });

    var oriWidth = 0,
        nowWidth = 0;
    cloudjs('#log_win').resizable({
        handles: 'w',
        start: function(event, ui) {
            resizingFlag = true;
        },
        stop: function(event, ui) {
            resizingFlag = false;
            var width = $('body').width() - ui.size.width;
            leftEle.width(width);
        }
    });

    $('#auto_btn').bind('change', function() {
        if ($(this).prop('checked')) {
            clearTimeout(refreshTimeout);
            refreshTimeout = setTimeout(function() {
                $('#search_btn').trigger('click');
            }, 6000);
        } else {
            clearTimeout(refreshTimeout);
        }
    });

    var loading = false;
    $('.refresh_btn').bind('click', function() {
        if (!loading) {
            initFileList();
        }
    });

    initFileList();

    function initFileList() {
        loading = true;
        $('.refresh_btn').removeClass('icon-refresh').addClass('icon-spinner icon-spin hover4');
        var pathArr = path.split(':');
        var fIp = pathArr[0],
            fPath = pathArr[1];
        $.ajax({
            url: '/pages/server/api/logview_list',
            data: {
                operator: userName,
                application: app,
                server_name: server_name,
                node_name: node_name
            },
            dataType: 'json',
            success: function(data) {
                loading = false;
                //debugger;
                $('.refresh_btn').removeClass('icon-spinner icon-spin hover4').addClass('icon-refresh');
                var dataResult = JSON.parse(data.data);
                if (dataResult.iRet == 0) {
                    //debugger;
                    cloudjs.message({
                        content: '刷新日志文件列表成功',
                        type: 'success',
                        relative: '.log_left'
                    });
                    refreshCombo(dataResult.data);
                } else {
                    cloudjs.message({
                        content: '刷新日志文件列表失败，失败原因：' + data.err_msg,
                        type: 'error',
                        relative: '.log_left'
                    });
                }
            },
            error: function() {
                loading = false;
                $('.refresh_btn').removeClass('icon-spinner icon-spin hover4').addClass('icon-refresh');
                cloudjs.message({
                    content: '刷新日志文件列表失败',
                    type: 'error',
                    relative: '.log_left'
                });
            }
        });
    }

    function refreshCombo(data) {
        //data = data.value;
        data = sortFileList(data);
        // console.log("file list=>", data)
        var json = [],
            html = '';
        for (var i = 0, len = data.length; i < len; i++) {
            json.push({ text: data[i], value: data[i] });
            html += '<li>' + data[i] + '</li>';
        }
        var args = { data: json };
        if (data.length) {
            args.defaultValue = data[0];
        }
        cloudjs(fileListEle).combobox('refresh', args);
        $('.file_list ul').html(html);
        if (html) {
            $('.file_list .empty_notice_p').hide();
        } else {
            $('.file_list .empty_notice_p').show();
        }
        bindListEvent();
    }

    function sortFileList(data) {
        //alert("default:" + app + "." + server_name + ".log");
        // 自定义排序, 先展示 app.server.log, 然后按天日志按日期排序, 最后展示 app.serverx.log

        // 先简单处理, 只要 app.server.log 存在, 就强制在前面添加一个该元素
        var defaultLogName = app + "." + server_name + ".log";
        if (!Array.indexOf) {
            Array.prototype.indexOf = function(obj) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i] == obj) {
                        return i;
                    }
                }
                return -1;
            }
        }
        var index = data.indexOf(defaultLogName);
        if (index >= 0) {
            data.splice(index, 1);
            data.unshift(defaultLogName);
        }
        return data;
    }

    var tempDiv = $('<div></div>')

    function htmlEncode(str) {
        tempDiv.text(str);
        return tempDiv.html();
    }

    bindListEvent();

    function bindListEvent() {
        $('.file_list li').bind('click', function() {
            var v = $(this).text();
            cloudjs(fileListEle).combobox('setValue', v);
        });
    }


    $('#search_btn').bind('click', function(e) {
        var $this = $(this);
        var args = {
            //path: $('[name="path"]').val(),
            view_direction: $('[name="view_direction"]:checked').val(),
            file_name: $(fileListEle).parent().children('.combo_value').val(),
            ignoreCase: $('[name="ignoreCase"]').prop('checked') ? 'Y' : 'N',
            lines: $('[name="lines"]').val(),
            keyword: $('[name="keyword"]').val(),
            search_lines: $('[name="search_lines"]').val(),
            search_sign: $('[name="search_sign"]').val(),
            env_code: envCode
        };
        /*temp 判定file_name是否为null，若是，不提交*/
        if (args.file_name === null) {
            alert('日志文件不能为null');
            return;
        }
        $('#log_win_content').html('<p style="margin:10px">Loading....</p>');
        $this.attr('disabled', 'disabled');
        $this.text('查询中...');
        $.ajax({
            url: '/pages/server/api/logview_data',
            data: {
                operator: userName,
                interface_params: JSON.stringify(args),
                application: app,
                server_name: server_name,
                node_name: node_name,
                log_file: $(fileListEle).parent().children('.combo_value').val()
            },
            dataType: 'json',
            timeout: 60000,
            success: function(data) {
                data = JSON.parse(data.data)
                if (data.iRet == 0) {
                    var cmd = data.cmd || '';
                    cmd = getNowFormatDate() + "===>" + cmd;
                    $('#cmd_row').show().children('.cmd').html(htmlEncode(cmd));
                    var html = '<table class="code_table">';
                    var logOriginData = data.data;

                    var logData = logOriginData.split("\n");
                    var len = logData.length;
                    if (len > 0) {
                        for (var i = 0; i < len; i++) {
                            html += '<tr><td class="line_td" data-line-num="' + (i + 1) + '"></td><td>' + htmlEncode(logData[i]) + '</td></tr>';
                        }
                    } else {
                        html += '<tr><td>执行结果为空</td></tr>';
                    }

                    html + '</table>';
                    $('#log_win_content').html(html);
                } else {
                    $('#log_win_content').html('<p style="margin:10px">查询失败，错误信息：' + data.err_msg + '</p>');
                }
                $this.removeAttr('disabled');
                $this.text('提交查询');
                if ($('#auto_btn').prop('checked')) {
                    clearTimeout(refreshTimeout);
                    refreshTimeout = setTimeout(function() {
                        $('#search_btn').trigger('click');
                    }, 6000);
                }
            },
            error: function() {
                $('#log_win_content').html('<p style="margin:10px">查询失败。</p>');
                $this.removeAttr('disabled');
                $this.text('提交查询');
                if ($('#auto_btn').prop('checked')) {
                    clearTimeout(refreshTimeout);
                    refreshTimeout = setTimeout(function() {
                        $('#search_btn').trigger('click');
                    }, 6000);
                }
            }
        });
    });

    /*从url上获取参数 */
    function getUrlParams(key, url) {
        if (!url || !key) return null;
        //var href=url||decodeURI(window.location.href);
        var href = url;
        var index = href.indexOf('?');
        if (index === -1) return null;
        var search = href.substring(index);
        var start = search.indexOf('&' + key + '=');
        if (start == -1) start = search.indexOf('?' + key + '=');
        var value = '';
        if (start != -1) {
            start += (key.length + 2);
            var end = search.indexOf('&', start);
            value = search.substring(start, end == -1 ? search.length : end);
        } else {
            return null;
        }
        //去掉#的干扰
        var cutPos = value.indexOf('#');
        if (cutPos !== -1) value = value.substring(0, cutPos);
        return value;
    }

    function getThisParams(key) {
        var url = window.location.href;
        return getUrlParams(key, url);
    }

    function getNowFormatDate() {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
            " " + getTwoWidthStr(date.getHours()) + seperator2 + getTwoWidthStr(date.getMinutes()) +
            seperator2 + getTwoWidthStr(date.getSeconds());
        return currentdate;
    }

    function getTwoWidthStr(str) {
        while ((str + "").length < 2) {
            str = "0" + str;
        }
        return str;
    }

});