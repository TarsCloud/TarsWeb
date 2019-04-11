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

const path = require('path');

const bodyParser = require('body-parser');

const resolve = file => path.join(__dirname, file);

module.exports = {
  port: process.env.PORT || 8082,

  plugins: [
    (app) => {
      app.use(bodyParser.urlencoded({extended: true}));
    },
    {
      $name: 'mock',
      mockEnable: false, // 是否使用本地模拟数据
      mockDir: resolve('src/json'), // 模拟数据根目录
    },
    {
      $name: 'proxy',
      proxyPaths: ['/pages/*'],
      proxyServer: 'https://devtars.webnovel.com',
    },
    {
      $name: 'static',
      staticPaths: {
        '/': 'http://localhost:8080',
      },
    },
  ],
};
