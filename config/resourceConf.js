/**
 * Tencent is pleased to support the open source community by making Tars available.
 *
 * Copyright (C) 2016THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the BSD 3-Clause License (the "License"); you may not use this file except 
 * in compliance with the License. You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/BSD-3-Clause
 *
 * Unless required by applicable law or agreed to in writing, software distributed 
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR 
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the 
 * specific language governing permissions and limitations under the License.
 */

/**
 * 资源文件配置
 */
module.exports = {

    /**
     * getMachineConf               获取机器配置
     * TARS平台会提供的参数
     * @param   {String}    uid                 用户名
     */
    /**
     * 接口需要返回的参数
     * @param   {Array}     data                服务列表，列表中对象如下
     *        @param   {String}    ip                机器ip
     *        @param   {String}    port              ssh端口
     *        @param   {String}    username          用户名
     *        @param   {String}    password          机器密码
     * @param   {Number}    ret_code            返回码，200表示成功
     * @param   {String}    err_msg             错误信息
     */
    getMachineConf: 'http://localhost:3000/pages/server/api/test_ssh'
};