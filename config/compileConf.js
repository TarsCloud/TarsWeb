/**
 * Created by clauseliu on 2018/6/21.
 */

module.exports = {
    /**
     * 是否启用自定义编译发布模块
     */
    enable : true,


    /**
     * compileUrl     自定义的编译接口
     * TARS平台会提供的参数
     * @param   {String}    application         应用名
     * @param   {String}    server_name         服务名
     * @param   {String}    node                节点IP地址
     * @param   {String}    path                代码SVN/GIT地址
     * @param   {String}    version             代码版本号
     * @param   {String}    comment             备注
     */
    /**
     * 接口需要返回的参数
     * @param   {String}    data         编译任务ID      {data : 1529570349924}
     */
    compileUrl : 'http://localhost:3002/interface?interface_name=do_compile',


    /**
     * compileTaskUrl     获取编译进度的接口
     * TARS平台会提供的参数
     * @param   {String}    taskNo              从编译接口获取的任务ID
     */
    /**
     * 接口需要返回的参数
     * @param   {String}    application         应用名
     * @param   {String}    server_name         服务名
     * @param   {String}    node                节点IP地址
     * @param   {String}    state               状态     0: 'EM_T_NOT_START',1: 'EM_T_RUNNING',2: 'EM_T_SUCCESS',3: 'EM_T_FAILED',4: 'EM_T_CANCEL',5: 'EM_T_PARIAL',
     * @param   {String}    create_time         创建时间
     * @param   {String}    start_time          开始时间
     * @param   {String}    end_time            结束时间
     * @param   {String}    task_id             任务ID
     */
    compileTaskUrl : 'http://localhost:3002/interface?interface_name=compile_task'
};