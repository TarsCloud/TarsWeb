const logger = require('../../../logger')
const PatchService = require('../../service/patch/PatchService');
const fs = require('fs');
const PatchController = {};
const request = require('request');
const CommonService = require('../../service/common/CommonService');
const WebConf = require('../../../config/webConf');
const util = require('../../../tools/util');
const ImageService = require('../../service/image/ImageService');

const upload = (formData = {}, wait) => {
    return new Promise((resolve) => {
        let result = {
            ret: -1,
            msg: 'error'
        }

        if(Object.keys(formData).length === 0){
            result.msg = '[rpc_upload]: argument invalid'
            return resolve(result)
        }
       
        try {

            let name = `${formData.ServerApp}-${formData.ServerName}`.toLowerCase();

            const options = {
                url: `${WebConf.k8s.uploadDomain}/${name}/building?wait=${wait}`,
                method: 'POST',
                formData: formData,
                timeout: 120*1000,
            }
            
            logger.info(`upload to image request:${options.url}`);

            request(options, (error, response, body) => {
                logger.info(`upload to image response error: `, error, response, body);

                if (!error && (response.statusCode == 201 || response.statusCode == 200)) {

                    logger.info(`rsp: ${body}`);

                    const rsp = JSON.parse(body);

                    result.ret = 0
                    result.msg = rsp.message;
                    result.result = rsp.result;

                    resolve(result)
                } else {
                    if (error && error.hasOwnProperty("message")) {
                        result.msg = error.message
                    } else {
                        result.msg = response.body.toString()
                    }
                    logger.warn('[rpc_upload]', body)

                    resolve(result)
                }
            })
        } catch (e) {
            result.msg = e.message
            resolve(result)
            logger.error('[rpc_update]', e)            
        }
    })
}

/**
 * 发布包上传
 */
PatchController.uploadPatchPackage = async(ctx) => {
    const that = module.exports

    let {
        Token = '', ServerId = '', ServerType = '', BaseImage = '', Secret = '', CreateMark
   ='' } = ctx.paramsObj

    let file = ctx.req.files[0]

    try {
        if(!file){
            return ctx.makeResObj(500, 'no files')
        }

        let baseUploadPath = WebConf.pkgUploadPath.path
        let uploadTgzName = `${baseUploadPath}/${file.originalname}`
        fs.mkdirSync(WebConf.pkgUploadPath.path, {
            recursive: true
        });
        fs.renameSync(`${baseUploadPath}/${file.filename}`, uploadTgzName)

        let fileBuffer = fs.createReadStream(uploadTgzName)

        // 查询服务信息
        let ServerApp = ServerId.substring(0, ServerId.indexOf('.')) || '',
            ServerName = ServerId.substring(ServerId.indexOf('.') + 1, ServerId.length) || ''

        if (!ServerApp || !ServerName) {
            return ctx.makeResObj(500, 'ServerId有误')
        }

        await ImageService.serverImageGetAndCreate(ServerApp, ServerName);

        let uploadData = await upload({
            ServerApp: ServerApp.toLowerCase(),
            ServerName: ServerName.toLowerCase(),
            ServerType,
            BaseImage,
            Secret,
            Mark: CreateMark,
            CreatePerson: ctx.uid,
            ServerFile: fileBuffer,
        }, false)

        logger.info('[uploadPatchPackage] upload to tars-image: ', uploadData);

        if(uploadData && uploadData.ret === 0){

            ctx.makeResObj(200, uploadData.msg);

        }else{
            ctx.makeResObj(500, uploadData.msg)
        }
    } catch (e) {
        logger.error('[uploadPatchPackage]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}
   

/**
 * 上传并发布
 */
PatchController.uploadAndPatch = async(ctx) => {
    const that = module.exports

    let { Token = '', application = '', module_name = '', server_type = 'cpp', base_image='', secret='', comment=''} = ctx.paramsObj
    let file = ctx.req.files[0]

    try {
        if(!file){
            return ctx.makeResObj(500, 'no files')
        }
        let baseUploadPath = WebConf.pkgUploadPath.path
        let uploadTgzName = `${baseUploadPath}/${file.originalname}`
        fs.mkdirSync(WebConf.pkgUploadPath.path, {
            recursive: true
        });
        fs.renameSync(`${baseUploadPath}/${file.filename}`, uploadTgzName)

        logger.info(`upload file to web succ:`, uploadTgzName);

        let fileBuffer = fs.createReadStream(uploadTgzName)

        await ImageService.serverImageGetAndCreate(application, module_name);

        let uploadData = await upload({
            ServerApp: application.toLowerCase(),
            ServerName: module_name.toLowerCase(),
            ServerType: server_type,
            BaseImage: base_image,
            Secret: secret,
            Mark: comment,
            CreatePerson: ctx.uid,
            ServerFile: fileBuffer,
        }, true)

        logger.info('[uploadPatchPackage] upload to tars-image: ', uploadData);
        
        if(uploadData.ret === 0 ){

            logger.info(`check build docker process`);

            const metadata = {
                ServerId: application + '.' + module_name,
                Id: uploadData.result.id,
                EnableMark: comment
            }

            let rst = await PatchService.servicePoolUpdate(metadata);

            ctx.makeResObj(rst.ret, rst.msg);
        }else{
            ctx.makeResObj(500, uploadData.msg)
        }
    } catch (e) {
        logger.error('[uploadPatchPackage]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

/**
 * 发布包上传状态
 * @param  {String}  Token                登录签名
 * @param  {Number}  BuildId              编译ID
 */
PatchController.uploadPatchStatus = async(ctx) => {
    const that = module.exports

    let { Token = '', ServerId = '', BuildId = 0 } = ctx.paramsObj

    try {

    	let result = await CommonService.getObject("timages", CommonService.getTServerName(ServerId));

        let buildStatusData = result.body.Build.Running;

        if(buildStatusData && buildStatusData.ret === 0 && buildStatusData.data){
            ctx.makeResObj(200, buildStatusData.msg, buildStatusData.data)
        }else{
            ctx.makeResObj(500, buildStatusData.msg)
        }
    } catch (e) {
        logger.error('[uploadPatchStatus]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

/**
 * 服务版本列表
 * @param  {String}  Token                登录签名
 * @param  {String}  ServerId             服务名
 */
PatchController.ServicePoolSelect = async(ctx) => {
	const that = module.exports

	let { Token = '', ServerId = ''} = ctx.paramsObj

	try {
		let result = await PatchService.servicePoolSelect(ServerId);
		ctx.makeResObj(result.ret, result.msg, result.data);

	} catch (e) {
        logger.error('[ServicePoolSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
	}
}

PatchController.BuildSelect = async (ctx) => {

    let {
        Token = '', ServerId = ''
    } = ctx.paramsObj

    try {
        let result = await PatchService.buildSelect(ServerId);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServicePoolSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

PatchController.DeleteBuild = async (ctx) => {

    let {
        Token = '', ImageName = ''
    } = ctx.paramsObj

    try {
        let result = await PatchService.deleteBuild(ImageName);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServicePoolSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

/**
 * 服务版本更新
 * @param  {String}  Token                登录签名
 * @param  {Number}  ServiceId            版本ID
 * @param  {Number}  EnableMark           备注
 */
PatchController.ServicePoolUpdate = async(ctx) => {
	const that = module.exports
	let { Token = '', ServerId, Id = '', Replicas = 1, EnableMark = '' } = ctx.paramsObj

	Replicas = Math.floor(Replicas) || 1
	
	try {
		const metadata = {
			ServerId,
			Id,
			Replicas,
			EnableMark,
		}

		let result = await PatchService.servicePoolUpdate(metadata);
		ctx.makeResObj(result.ret, result.msg, result.data);

	} catch (e) {
        logger.error('[ServicePoolUpdate]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
	}
}
    
/**
 * 服务启用列表

 */
PatchController.ServiceEnabledSelect = async(ctx) => {

    let { Token = '', ServerId = '' } = ctx.paramsObj

    try {
        let result = await PatchService.serviceEnabledSelect(ServerId);
		ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ServiceEnabledSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}


module.exports = PatchController;