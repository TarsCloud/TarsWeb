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

const { all } = require('q');
const CommonService = require('../common/CommonService');
const DeployService = require('../deploy/DeployService');

const ApprovalService = {};

ApprovalService.serverApprovalCreate = async (metadata) => {

    let tDeploy = await CommonService.getObject("tdeploys", metadata.DeployId);
    if (!tDeploy) {
        return { ret: 500, msg: 'no deploy server exists' };
	}
	
	tDeploy = tDeploy.body;

	if(tDeploy.approve != null) {
        return { ret: 500, msg: 'Can Not Do Duplicated Deploy' };
	}

    let tDeployCopy = JSON.parse(JSON.stringify(tDeploy));

	tDeployCopy.approve = {
		person: "admin",
		time:   new Date(),
		reason: metadata.ApprovalMark,
		result: metadata.ApprovalResult,
	}

	if(metadata.ApprovalResult) {
		let serverK8S = CommonService.ConvertOperatorK8SToAdminK8S(tDeployCopy.apply.k8s)
		let serverServant = CommonService.ConvertOperatorServantToAdminK8S(tDeployCopy.apply.tars.servants)
		let serverOption = CommonService.ConvertOperatorOptionToAdminK8S(tDeployCopy.apply)

        let result = await DeployService.createServer(tDeployCopy.apply.app, tDeployCopy.apply.server, serverServant, serverK8S, serverOption);
        if (result.ret != 200) {
            return result;
        }

	}

    let data = await CommonService.replaceObject("tdeploys", tDeployCopy.metadata.name, tDeployCopy);
    
    return { ret: 200, msg: 'succ', data: data.body };
}

ApprovalService.serverApprovalSelect = async (Continue) => {

	let labelSelector = `${CommonService.APPROVE} in (Approved,Reject)`;

	let allItems = await CommonService.listObject("tdeploys", labelSelector, 5, Continue);

    Continue = allItems.body.metadata.continue;

    allItems = allItems.body.items;

	// // filter
    // let filterItems = allItems;

	// // if(!isAll) {
    //     filterItems = [];

    //     allItems.forEach(elem => {

	// 		if (ServerApp.length > 0 && elem.apply.app.indexOf(ServerApp) == -1)
	// 			return;

	// 		if (ServerName.length > 0 && elem.apply.server.indexOf(ServerName) == -1)
	// 			return;
			
    //         filterItems.push(elem);  
    //     })
	// // }

	// allItems = filterItems;

    allItems.sort((e1, e2) => {

        if (e1.approve.time < e2.approve.time) {
            return 1;
        } else if (e1.approve.time == e2.approve.time) {
            return 0;
        } else {
            return -1;
        }
	});
    

	// // limiter
	// if(limiter != null) {
    //     let { start, stop } = CommonService.pageList(filterItems.length, limiter);

    //     filterItems = filterItems.slice(start, stop);
	// }

	// Count填充
    let result = {};
    result.Continue = Continue;
    // result.Count = {};
    // result.Count["AllCount"] = allItems.length;
    // result.Count["FilterCount"] = filterItems.length;

	// Data填充
    result.Data = []; 
    allItems.forEach(item => {

        // console.log(item);

        let elem = {};
        elem["DeployId"] = item.metadata.name
        elem["RequestTime"] = item.metadata.creationTimestamp
        elem["ServerApp"] = item.apply.app
        elem["ServerName"] = item.apply.server

        elem["ServerK8S"] = CommonService.ConvertOperatorK8SToAdminK8S(item.apply.k8s)
        elem["ServerServant"] = CommonService.ConvertOperatorServantToAdminK8S(item.apply.tars.servants)
        elem["ServerOption"] = CommonService.ConvertOperatorOptionToAdminK8S(item.apply)

        elem["RequestPerson"] = item.apply.person;
        elem["ServerMark"] = item.apply.mark;

        elem["ApprovalTime"] = item.approve.time;
        elem["ApprovalPerson"] = item.approve.person
        elem["ApprovalResult"] = item.approve.result
        elem["ApprovalMark"] = item.approve.reason

        result.Data.push(elem);
    });

    return { ret: 200, msg: 'succ', data: result };

}
module.exports = ApprovalService;