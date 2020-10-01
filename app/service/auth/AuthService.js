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

const {
	enableAuth,
	isAdminUrl,
	addAuthUrl,
	deleteAuthUrl,
	updateAuthUrl,
	getAuthListByUidUrl,
	getAuthUrl,
	getAuthListByFlagUrl,
} = require('../../../config/authConf');
const loginConf = require('../../../config/loginConf');
const webConf = require('../../../config/webConf');

const util = require('../../tools/util');
const logger = require('../../logger');
const _ = require('lodash');
const ServerDao = require('../../dao/ServerDao');

const AuthService = {};

AuthService.hasDevAuth = async (application, serverName, uid) => {
	return await AuthService.checkHasAuth(application, serverName, 'operator', uid);
};

AuthService.hasOpeAuth = async (application, serverName, uid) => {
	return await AuthService.checkHasAuth(application, serverName, 'operator;developer', uid);
};

AuthService.hasAdminAuth = async (uid) => {
	return await AuthService.checkHasAuth('', '', 'admin', uid);
};

AuthService.checkHasAuth = async (application, serverName, role, uid) => {
	if (!enableAuth) {
		return true;
	}
	let hasAuth = false;
	// console.log('checkHasAuth:', application, serverName, role, uid);

	if (serverName) {
		hasAuth = await AuthService.httpCallCheckAuth(application + '.' + serverName, role, uid);
	}
	if (!hasAuth) {
		if (application) {
			hasAuth = await AuthService.httpCallCheckAuth(application, role, uid);
		// console.log('checkHasAuth2:', hasAuth);
		}
		if (!hasAuth) {
			hasAuth = await AuthService.httpCallCheckAuth('', 'admin', uid);
		// console.log('checkHasAuth3:', hasAuth);
			if (!hasAuth) {
				return false;
			} else {
				return true;
			}
		} else {
			return true;
		}
	} else {
		return true;
	}
};

AuthService.getUrl = (path) => {
	return "http://localhost:" + webConf.webConf.port + path;
}
AuthService.httpCallCheckAuth = async (flag, roles, uid) => {
	
	var rst = await util.jsonRequest.get(AuthService.getUrl(getAuthUrl), {
		flag: flag,
		role: roles,
		uid: uid
	});
	if (rst && rst.ret_code == 200) {
		return rst.data && rst.data.result || false;
	} else {
		throw (new Error(rst.err_msg));
	}
};

AuthService.getRoles = async (uid) => {
	if (!enableAuth) {
		return [loginConf.defaultLoginUid];
	}
	var rst = await util.jsonRequest.get(AuthService.getUrl(getAuthListByUidUrl), {
		uid: uid
	});
	if (rst && rst.ret_code == 200) {
		let list = rst.data;
		let rolesList = [];
		list.forEach((auth) => {
			rolesList.push(auth.role);
		});

		let unique = (rolesList)=> [...new Set(rolesList)];
		unique(rolesList);
		return rolesList || [];
	} else {
		throw (new Error(rst.err_msg));
	}
};


AuthService.isAdmin = async (uid) => {
	// console.log('uid', uid);
	if (!enableAuth) {
		return true;
	}
	var rst = await util.jsonRequest.get(AuthService.getUrl(isAdminUrl), {
		uid: uid
	});

	if (rst && rst.ret_code == 200) {
		return rst.data.admin;
	} else {
		throw (new Error(rst.err_msg));
	}
};

AuthService.getAuthListByUid = async (uid) => {
	// if (!enableAuth) {
	// 	return [];
	// }
	var rst = await util.jsonRequest.get(AuthService.getUrl(getAuthListByUidUrl), {
		uid: uid
	});
	// console.log(rst);
	if (rst && rst.ret_code == 200) {
		let list = rst.data;
		let authList = [];
		list.forEach((auth) => {
			let flag = auth.flag || "";
			let idx = flag.indexOf('.');
			if (idx > 1) {
				authList.push({application: flag.substring(0, idx), serverName: flag.substring(idx + 1)})
			} else {
				authList.push({application: flag})
			}
		});
		return authList || [];
	} else {
		throw (new Error(rst.err_msg));
	}
};

AuthService.formatUidToArray = (uids) => {
	let uidArr = [];
	if (_.isString(uids)) {
		uids = _.trim(uids, /;|,/);
		if (uids) uidArr = uids.split(/;|,/);
	} else if (_.isArray(uids)) {
		uidArr = uids;
	}
	return uidArr;
};

AuthService.formatAddAuthParams = (flag, operator, uids) => {
	let authList = [];
	uids = AuthService.formatUidToArray(uids);
	_.isArray(uids) && uids.forEach((uid) => {
		if (!uid)return;
		let authItem = {
			flag: flag,
			role: operator,
			uid: uid
		};
		authList.push(authItem);
	});
	return authList;
};

AuthService.addAuth = async (application, serverName, operator, developer) => {
	if (!enableAuth) {
		return true;
	}
	let flag = application + (serverName ? ('.' + serverName) : '');
	let authList = _.concat(AuthService.formatAddAuthParams(flag, 'operator', operator), AuthService.formatAddAuthParams(flag, 'developer', developer))
	let rst = await util.jsonRequest.post(AuthService.getUrl(addAuthUrl), { auth: authList});
	if (rst && rst.ret_code == 200) {
		return true;
	} else {
		throw (new Error(rst.err_msg));
	}
};

AuthService.updateAuth = async (application, serverName, operator, developer) => {
	if (!enableAuth) {
		return true;
	}
	let flag = application + (serverName ? ('.' + serverName) : '');
	operator = AuthService.formatUidToArray(operator);
	developer = AuthService.formatUidToArray(developer);
	let rst = await Promise.all([
		util.jsonRequest.post(AuthService.getUrl(updateAuthUrl), { flag: flag, role: 'operator', uid: operator}),
		util.jsonRequest.post(AuthService.getUrl(updateAuthUrl), { flag: flag, role: 'developer', uid: developer})
	]);
	for (var i = 0; i < rst.length; i++) {
		if (!rst[i] || rst[i].ret_code != 200) {
			throw new Error(rst[i].err_msg);
			return false;
		}
	}
	return true;
};

AuthService.getAuthList = async (application, serverName) => {
	if (!enableAuth) {
		return [];
	}
	let rst = await util.jsonRequest.get(AuthService.getUrl(getAuthListByFlagUrl), { flag: application + '.' + serverName});
	let authList = {
		operator: [],
		developer: []
	};
	if (rst.ret_code == 200) {
		rst.data.forEach((auth) => {
			if (auth.role == 'operator') {
				authList.operator.push(auth.uid);
			} else if (auth.role == 'developer') {
				authList.developer.push(auth.uid);
			}
		});
	} else {
		throw new Error(rst.err_msg);
	}
	return authList;
};

//检测是否有顶层目录的权限，主要用于获取配置列表等
AuthService.checkHasParentAuth = async (params) => {
	// console.log('checkHasParentAuth:', params);

	if (!enableAuth || await AuthService.hasAdminAuth(params.uid)) {
		return true;
	}
	let authList = await AuthService.getAuthListByUid(params.uid);
	let serverCond = [], appCond = [];
	authList.forEach((auth) => {
		let application = auth.application;
		let serverName = auth.serverName;
		if (serverName) {
			serverCond.push(application + '.' + serverName);
		} else {
			appCond.push(application);
		}
	});
	let serverList = await ServerDao.getServerConf4Tree(appCond, serverCond);
	let {application, setName, setArea, setGroup, serverName} = params;
	let hasAuth = false;
	_.each(serverList, (server) => {
		server = server.dataValues;
		if ((!application || application == server.application) &&
			(!setName || setName == server.set_name) &&
			(!setArea || setArea == server.set_area) &&
			(!setGroup || setGroup == server.set_group) &&
			(!serverName || serverName == server.server_name)) {
			hasAuth = true;
			return false;
		}
	});
	return hasAuth;
};

//删除权限
AuthService.deleteAuth = async (application, serverName) => {
	if (!enableAuth) {
		return true;
	}
	let rst = await util.jsonRequest.post(AuthService.getUrl(deleteAuthUrl), {flag: application + '.' + serverName});
	if (rst.ret_code == 200) {
		return true;
	} else {
		throw new Error(rst.err_msg);
		return false;
	}
};

module.exports = AuthService;