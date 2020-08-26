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
 * 权限配置
 */
module.exports = {

	/**
	 * 是否启用自定义权限模块
	 */
	enableAuth: true,
	
	/**
	 * isAdminUrl             是否是Adminurl
	 * TARS平台会提供的参数
	 * @param   {Array}    uid         权限对象列表，格式如 {"uid": "uid"}
	 */
	/**
	 * 接口需要返回的参数
	 * @param   {Number}    ret_code            返回码，200表示成功
	 * @param   {String}    err_msg             错误信息
	 */
	isAdminUrl: '/pages/server/api/auth/isAdmin',

	/**
	 * addAuthUrl             新增权限url
	 * TARS平台会提供的参数
	 * @param   {Array}    auth         权限对象列表，格式如 {"flag": "app-server", "role": "operator", "uid": "username"}
	 */
	/**
	 * 接口需要返回的参数
	 * @param   {Number}    ret_code            返回码，200表示成功
	 * @param   {String}    err_msg             错误信息
	 */
	addAuthUrl: '/pages/server/api/auth/addAuth',

	/**
	 * deleteAuthUrl             删除权限url，用于服务下线时候删除权限
	 * TARS平台会提供的参数
	 * @param   {String}    flag                权限单位，在tars中为“应用-服务”
	 */
	/**
	 * 接口需要返回的参数
	 * @param   {Number}    ret_code            返回码，200表示成功
	 * @param   {String}    err_msg             错误信息
	 */
	deleteAuthUrl: '/pages/server/api/auth/deleteAuth',

	/**
	 * updateAuthUrl             更新权限url
	 * TARS平台会提供的参数
	 * @param   {String}    flag                权限单位，在tars中为“应用-服务”
	 * @param   {String}    role                角色，在tars中为operator或developer
	 * @param   {String}    uid                 用户名
	 */
	/**
	 * 接口需要返回的参数
	 * @param   {Number}    ret_code            返回码，200表示成功
	 * @param   {String}    err_msg             错误信息
	 */
	updateAuthUrl: '/pages/server/api/auth/updateAuth',

	/**
	 * getAuthListByUidUrl             通过用户名获取权限列表url
	 * TARS平台会提供的参数
	 * @param   {String}    uid                 用户名
	 */
	/**
	 * 接口需要返回的参数
	 * @param   {Array}     data                服务列表，内容如下
	 *        @param   {String}    flag                权限单位，在tars中为“应用-服务”
	 *        @param   {String}    role                角色，在tars中为operator或developer
	 *        @param   {String}    uid                 用户名
	 * @param   {Number}    ret_code            返回码，200表示成功
	 * @param   {String}    err_msg             错误信息
	 */
	getAuthListByUidUrl: '/pages/server/api/auth/getAuthListByUid',

	/**
	 * getAuthListByFlagUrl             通过应用名+服务名获取用户列表url
	 * TARS平台会提供的参数
	 * @param   {String}    flag                 应用+服务名
	 */
	/**
	 * 接口需要返回的参数
	 * @param   {Array}     data                服务列表，内容如下
	 *        @param   {String}    flag                权限单位，在tars中为“应用-服务”
	 *        @param   {String}    role                角色，在tars中为operator或developer
	 *        @param   {String}    uid                 用户名
	 * @param   {Number}    ret_code            返回码，200表示成功
	 * @param   {String}    err_msg             错误信息
	 */
	getAuthListByFlagUrl: '/pages/server/api/auth/getAuthListByFlag',

	/**
	 * getAuthUrl             判断用户是否有相应角色的操作权限
	 * TARS平台会提供的参数
	 * @param   {String}    flag                权限单位，在tars中为“应用-服务”
	 * @param   {String}    role                角色，在tars中为operator或developer
	 * @param   {String}    uid                 用户名
	 */
	/**
	 * 接口需要返回的参数
	 * @param   {Object}     data                服务列表，内容如下
	 *        @param   {Boolean}    result              是否有操作权限
	 * @param   {Number}    ret_code            返回码，200表示成功
	 * @param   {String}    err_msg             错误信息
	 */
	getAuthUrl: '/pages/server/api/auth/getAuth'
};