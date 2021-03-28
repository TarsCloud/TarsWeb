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

const captcha = require('svg-captcha')

const PageController = {}
const package = require("../../../package.json")
const AdminService = require('../../service/admin/AdminService');
PageController.index = async (ctx) => {
	await ctx.redirect('/index.html');
};

PageController.version = async (ctx) => {
    const version = {
        webVersion: package.version,
        frameworkVersion: await AdminService.getVersion()
    }
	ctx.body = version
};

PageController.captcha = async (ctx) => {
	const cap = captcha.createMathExpr({
        size: 4, // 验证码长度
        ignoreChars: '0o1i', // 验证码字符中排除 0o1i
        noise: 2, // 干扰线条的数量
        color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
        background: '#cc9966', // 验证码图片背景颜色
        mathMin: 1,
        mathMax: 9,
    })
    ctx.session.captcha = cap.text.toLocaleLowerCase()
	ctx.set('Content-Type', 'image/svg+xml')
    ctx.body = cap.data
}

module.exports = PageController;
