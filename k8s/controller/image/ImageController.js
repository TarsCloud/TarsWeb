const logger = require('../../../logger');

const ImageService = require('../../service/image/ImageService');
const CommonService = require('../../service/common/CommonService');
const ImageController = {};

ImageController.NodeImageSelect = async (ctx) => {

    try {

        let result = await ImageService.nodeImageSelect();
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[NodeImageSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}


ImageController.ImageSelect = async(ctx) => {

    try {

        let result = await ImageService.imageSelect();
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ImageSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

ImageController.ImageCreate = async (ctx) => {
    try {

        let { SupportedType=[], Mark='' } = ctx.paramsObj

        let metadata = {
            SupportedType,
            Mark
        }

        let result = await ImageService.imageCreate(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ImageCreate]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }    
}


ImageController.ImageUpdate = async (ctx) => {
    try {
        let { Name='', SupportedType=[], Mark='' } = ctx.paramsObj

        let metadata = {
            Name,
            SupportedType,
            Mark
        }

        let result = await ImageService.imageUpdate(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ImageUpdate]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }    
}

ImageController.ImageDelete = async (ctx) => {
    try {

        let { Name=''} = ctx.paramsObj

        let metadata = {
            Name,
        }

        let result = await ImageService.imageDelete(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ImageDelete]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

ImageController.ImageReleaseSelect = async (ctx) => {
    let {Name = ''} = ctx.paramsObj
    let metadata = {Name}
    try {

        let result = await ImageService.imageReleaseSelect(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ImageSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}
ImageController.ImageNodeSelect = async (ctx) => {
    let metadata = {Name: CommonService.TARSNODE}
    try {
        let result = await ImageService.imageReleaseSelect(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);
    } catch (e) {
        logger.error('[ImageNodeSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

ImageController.ImageNodeUpdate = async (ctx) => {
    let {Id = '', Image = "", Mark = ""} = ctx.paramsObj
    let metadata = {
        Name: CommonService.TARSNODE,
        Id,Image,Mark
    }
    try {
        let result = await ImageService.ImageNodeUpdate(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);
    } catch (e) {
        logger.error('[ImageNodeSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

ImageController.ImageNodeDelete = async (ctx) => {
    let {Id = '', Image = "", Mark = ""} = ctx.paramsObj
    let metadata = {
        Name: CommonService.TARSNODE,
        Id,Image,Mark
    }
    try {
        let result = await ImageService.ImageNodeDelete(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);
    } catch (e) {
        logger.error('[ImageNodeSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e.message);
    }
}

ImageController.BaseImageSelect = async (ctx) => {

    let { ServerType = ''} = ctx.paramsObj
    let metadata = {
        ServerType,
    }

    try {

        let result = await ImageService.baseImageSelect(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ImageSelect]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}


ImageController.ImageReleaseDelete = async (ctx) => {
    try {

        let { Id='', Name = ''} = ctx.paramsObj
        let metadata = {
            Id,
            Name,
        }

        let result = await ImageService.imageReleaseDelete(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ImageReleaseDelete]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

ImageController.ImageReleaseCreate = async (ctx) => {
    try {

        let { Name='', Image= '', Secret='', Mark='', } = ctx.paramsObj

        let CreatePerson = ctx.uid;
        let CreateTime = new Date();

        let metadata = {
            Name,
            Image, 
            Secret,
            Mark,
            CreatePerson,
            CreateTime
        };

        let result = await ImageService.imageReleaseCreate(metadata);
        ctx.makeResObj(result.ret, result.msg, result.data);

    } catch (e) {
        logger.error('[ImageReleaseCreate]', e.body ? e.body.message : e, ctx)
        ctx.makeResObj(500, e.body ? e.body.message : e);
    }
}

// ImageController.AddImage = async (ctx) => {

//     let {
//         Token = '', ServerId = '', Image = '', Id = '', Secret = '', Mark = ''
//     } = ctx.paramsObj

//     try {
//         let CreatePerson = ctx.uid;

//         let metadata = {
//             ServerId,
//             Image,
//             Secret,
//             Mark,
//             CreatePerson,
//             Id
//         };
//         let result = await ImageService.imageAdd(metadata);
//         ctx.makeResObj(result.ret, result.msg, result.data);

//     } catch (e) {
//         logger.error('[ImageController]', e.body ? e.body.message : e, ctx)
//         ctx.makeResObj(500, e.body ? e.body.message : e);
//     }
// }

module.exports = ImageController;