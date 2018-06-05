/**
 * Created by clauseliu on 2018/6/4.
 */

export default {
    en : {
        common : {
            set : {
                setName : 'SET Name',
                setArea : 'SET Area',
                setGroup : 'SET Group'
            },
            opt : {
                edit : 'edit',
                reStart : 'reStart',
                stop : 'stop',
                servant : 'servants',
                more : 'more'
            },
            nodata : 'No Data',
            yes : 'yes',
            no : 'no',
            enable : 'enable',
            disable : 'disable'
        },
        header : {
            tab : {
                tab1 : 'Services',
                tab2 : 'operation'
            },
            select : {
                cn : 'Simplified Chinese',
                en : 'English'
            },
            logout : 'logout'
        },
        index : {
            rightView : {
                title : 'choose a service',
                tips : 'if you want to check the service list or the Real-time service status ,<br>please choose a service on the left menu.',
                tab : {
                    patch : 'Patch',
                    serviceConfig : 'Service Configuration',
                    setConfig : 'SET Configuration',
                    appConfig : 'APP Configuration',
                    statMonitor : 'Status Monitor',
                    propertyMonitor : 'Property Monitor',
                    privileage : 'Privileage',
                }
            },
            leftTree : {
                noService : 'No service',
                retry : 'Click to try again'
            }
        },
        manage : {
            services : {
                serviceList : {
                    title : 'Services',
                    tableTitle : {
                        service : 'Service',
                        node : 'Node',
                        set : 'SET',
                        configStat : 'ConfStat',
                        currStat : 'CurrStat',
                        procId : 'Process ID',
                        version : 'Version',
                        patchTime : 'Patch Time',
                        operator : 'Operator'
                    },
                    tableBody : {
                        disableSet : 'disable',
                    }
                },
                realTime : {
                    title : 'Real Time Service Status',
                    tableTitle : {
                        time : 'Time',
                        serviceID : 'ServiceID',
                        threadID : 'ThreadID',
                        result : 'Result'
                    }
                },
                dlgEditService : {
                    title : 'Edit Servcie',
                    isBackup : 'Is Backup',
                    template : 'Template',
                    type : 'Service Type',
                    asyncThread : 'Async Threads',
                    defaultPath : 'Default Path',
                    exePath : 'Execute Path',
                    startScript : 'Start Script',
                    stopScript : 'Stop Script',
                    monitorScript : 'Monitor Script',
                    privateTemp : 'Private Template',
                    valiTip : {
                        setname : 'Set name can only contain English lowercase letters'
                    }

                }
            }
        }
    },

    cn : {
        common : {
            set : {
                setName : 'SET名',
                setArea : 'SET区域',
                setGroup : 'SET组'
            },
            opt : {
                edit : '编辑',
                reStart : '重启',
                stop : '停止',
                servant : '管理Servant',
                more : '更多命令'
            },
            nodata : '暂无数据',
            yes : '是',
            no : '否',
            enable : '启用',
            disable : '不启用'
            
        },
        header : {
            tab : {
                tab1 : '服务管理',
                tab2 : '运维管理'
            },
            select : {
                cn : '简体中文',
                en : '英文'
            },
            logout : '退出登录'
        },
        index : {
            rightView : {
                title : '选择服务',
                tips : '如需查看服务列表或服务实时状态<br>请先从左边菜单选择一个服务',
                tab : {
                    patch : '发布管理',
                    serviceConfig : '服务配置',
                    setConfig : 'SET配置',
                    appConfig : '应用配置',
                    statMonitor : '服务监控',
                    propertyMonitor : '特性监控',
                    privileage : '权限管理',
                }
            },
            leftTree : {
                noService : '暂无服务',
                retry : '点击重试'
            }
        },
        manage : {
            services : {
                serviceList : {
                    title : '服务列表',
                    tableTitle : {
                        service : '服务',
                        node : '节点',
                        set : 'SET',
                        configStat : '设置状态',
                        currStat : '当前状态',
                        procId : '进程ID',
                        version : '版本',
                        patchTime : '发布时间',
                        operator : '操作'
                    },
                    tableBody : {
                        disableSet : '未启用',
                    }
                },
                realTime : {
                    title : '服务实时状态',
                    tableTitle : {
                        time : '时间',
                        serviceID : '服务ID',
                        threadID : '线程ID',
                        result : '结果'
                    }
                },
                dlgEditService : {
                    title : '编辑服务',
                    isBackup : '是否备机',
                    template : '模板',
                    type : '服务类型',
                    asyncThread : '异步线程数',
                    defaultPath : '缺省路径',
                    exePath : '执行路径',
                    startScript : '启动脚本',
                    stopScript : '停止脚本',
                    monitorScript : '监控脚本',
                    privateTemp : '私有模板',
                    valiTip : {
                        setname : 'Set 名只能包含英文小写字母',
                        setarea : 'Set 区域只能包含英文小写字母',
                        setgroup : 'Set 组只能包含数字或者 * 号'
                    }
                }
            }
        }
    }
}
