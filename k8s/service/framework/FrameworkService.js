const logger = require("../../../logger")
const fs = require("fs")
const path = require("path");
const CommonService = require('../common/CommonService');
const FrameworkService = {};

FrameworkService.MNTFILEPATH = "/mnt/config"
// FrameworkService.MNTFILEPATH = "/tmp/config"

FrameworkService.getFrameworkConfig = async () => {
    let data = await CommonService.getFrameworkConfig();
    let res = [];
    res.push({
        column: "imageBuild.maxBuildTime",
        remark: "#framework.remark.maxBuildTime#",
        value: data.imageBuild.maxBuildTime
    })
    res.push({
        column: "imageRegistry.registry",
        remark: "#framework.remark.imageRegistry#",
        value: data.imageRegistry.registry
    })
    res.push({
        column: "nodeImage.image",
        remark: "#framework.remark.nodeImage#",
        value: data.nodeImage.image
    })
    res.push({
        column: "recordLimit.tconfigHistory",
        remark: "#framework.remark.tconfigHistory#",
        value: data.recordLimit.tconfigHistory
    })
    res.push({
        column: "recordLimit.texitedPod",
        remark: "#framework.remark.texitedPod#",
        value: data.recordLimit.texitedPod
    })
    res.push({
        column: "recordLimit.timageRelease",
        remark: "#framework.remark.timageRelease#",
        value: data.recordLimit.timageRelease
    })
    res.push({
        column: "nativeDBConfig",
        remark: "#framework.remark.nativeDBConfig#",
        value: data.expand.nativeDBConfig
    })
    res.push({
        column: "nativeFrameworkConfig",
        remark: "#framework.remark.nativeFramewokConfig#",
        value: data.expand.nativeFramewokConfig
    })
    return res
}

FrameworkService.saveFrameworkConfig = async (params) => {
    let data = await CommonService.getObject("tframeworkconfigs", CommonService.TFC);
    let tfc = data.body;
    switch (params.column) {
        case "nativeFrameworkConfig":
            tfc.expand.nativeTafConfig = params.value;
            break;
        case "nativeDBConfig":
            tfc.expand.nativeDBConfig = params.value;
            break;
        case "imageBuild.maxBuildTime":
            tfc.imageBuild.maxBuildTime = Number(params.value);
            break;
        case "imageRegistry.registry":
            tfc.imageRegistry.registry = params.value;
            break;
        case "nodeImage.image":
            tfc.nodeImage.image = params.value;
            break;
        case "recordLimit.tconfigHistory":
            tfc.recordLimit.tconfigHistory = Number(params.value);
            break;
        case "recordLimit.texitedPod":
            tfc.recordLimit.texitedPod = Number(params.value);
            break;
        case "recordLimit.timageRelease":
            tfc.recordLimit.timageRelease = Number(params.value);
            break;
    }
    let res = await CommonService.replaceObject("tframeworkconfigs", CommonService.TFC, tfc);

}


FrameworkService.createFrameworkConfig = async () => {
    // console.log(333)
    // let config = await new Promise(((resolve, reject) => {
    //     let ret = CommonService.getObject("tframeworkconfigs", CommonService.TFC);
    //     resolve(ret)
    // }))
    let config = await CommonService.getFrameworkConfig();
    console.log(" get tfc success", config)
    let nativeFrameworkConfig = config.expand.nativeFrameworkConfig;
    let nativeDBConfig = config.expand.nativeDBConfig;
    if (fs.existsSync(FrameworkService.MNTFILEPATH)) {
        mkdirSync(FrameworkService.MNTFILEPATH);
        fs.writeFileSync(`${FrameworkService.MNTFILEPATH}/nativeFramework.conf`, nativeFrameworkConfig);
        fs.writeFileSync(`${FrameworkService.MNTFILEPATH}/nativeDB.json`, nativeDBConfig);
    }
}

function mkdirSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

module.exports = FrameworkService;