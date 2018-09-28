/** *
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

/** *
 * 资源文件配置
 */
module.exports = {

    /** *
     * 是否允许管理平台在服务上线和服务扩容时自动到机器上安装Tars node
     */
    enableAutoInstall: false,

    /** *
     * getMachineConf               获取机器配置，管理平台优先从此接口获取，若未配置此接口，则从sshConf.json中获取。
     * TARS平台会提供的参数
     * @param   {String}    ip                 ip
     */
    /** *
     * 接口需要返回的参数
     * @param   {Object}     data                机器配置信息，对象内容如下
     *        @param   {String}    ip                机器ip
     *        @param   {String}    port              ssh端口
     *        @param   {String}    username          用户名
     *        @param   {String}    password          机器密码
     * @param   {Number}    ret_code            返回码，200表示成功
     * @param   {String}    err_msg             错误信息
     */
    getMachineConf: ''
};