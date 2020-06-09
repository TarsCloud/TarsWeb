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

const ApplyDao = require('./dao');
const RouterService = require('../router/service');
const ProxyService = require('../proxy/service');
const ModuleConfigService = require('../moduleConfig/service');

const ApplyService = {};

ApplyService.addApply = async function ({
  idc_area, set_area, admin, name, create_person,
}) {
  const item = await ApplyDao.findOne({ where: { name } });
  if (item && item.status === 2) {
    // 如果是安装成功的， 提醒应用存在
    throw new Error('#apply.hasExist#');
  } else {
    // 如果注册过，但是没有安装成功， 就覆盖掉
    const data = await ApplyDao.createOrUpdate(['name'], {
      idc_area, set_area, admin, name, create_person, status: 1,
    });
    // 创建应用 RouterService
    const routerOption = {
      apply_id: data.id,
      server_name: `${data.name}RouterServer`,
      server_ip: '',
      template_file: '',
      router_db_name: '',
      router_db_ip: '',
      router_db_port: '',
      router_db_user: '',
      router_db_pass: '',
      create_person,
      status: 1,
    };
    await RouterService.createOrUpdate(['apply_id'], routerOption);

    // 创建 idc_area ProxyService
    let proxyOption = {
      apply_id: data.id,
      server_name: `${data.name}ProxyServer`,
      server_ip: '',
      template_file: '',
      idc_area: data.idc_area,
      create_person,
      status: 1,
    };
    await ProxyService.createOrUpdate(['apply_id', 'idc_area'], proxyOption);
    // 创建 set_area ProxyService
    const result = [];
    for (let i = 0; i < set_area.length; i++) {
      proxyOption = {
        apply_id: data.id,
        server_name: `${data.name}ProxyServer`,
        server_ip: '',
        template_file: '',
        idc_area: set_area[i],
        create_person,
        status: 1,
      };
      result.push(ProxyService.createOrUpdate(['apply_id', 'idc_area'], proxyOption));
    }
    await Promise.all(result);
    return data;
  }
};

ApplyService.getApply = function ({ applyId, queryRouter, queryProxy }) {
  return ApplyDao.findOne({ where: { id: +applyId }, queryRouter, queryProxy });
};

ApplyService.findApplyByName = function ({ appName }) {
  return ApplyDao.findOne({ where: { name: appName } });
};

ApplyService.getApplyList = function (options = {}) {
  return ApplyDao.findAll(options);
};

ApplyService.saveRouterProxy = async function ({ Proxy, Router }) {
  const result = [];
  for (let i = 0; i < Proxy.length; i++) {
    result.push(ProxyService.update(Proxy[i]));
  }
  await Promise.all(result);
  await RouterService.update(Router);
  return {};
};

ApplyService.removeApply = async function ({ id }) {
  return ApplyDao.destroy({ where: { id } });
};

ApplyService.hasModule = async function ({ serverType, serverName }) {
  // RouterService
  // ProxyService
  let applyId = null;
  if (serverType === 'router') {
    const routerServer = await RouterService.findByServerName({ serverName });
    if (routerServer) applyId = routerServer.get('apply_id');
  } else if (serverType === 'proxy') {
    const proxyServer = await ProxyService.findByServerName({ serverName });
    if (proxyServer) applyId = proxyServer.get('apply_id');
  }
  if (!applyId) throw new Error('不存在该应用');


  const moduleServer = await ModuleConfigService.findOne({ apply_id: applyId });
  // let moduleServer = await serverConfigService.findByApplyId({applyId});
  return !!moduleServer;
};


module.exports = ApplyService;
