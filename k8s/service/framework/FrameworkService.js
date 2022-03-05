const logger = require("../../../logger")
const fs = require("fs")
const path = require("path");
const WebConf = require('../../../config/webConf');
const FrameworkService = {};

// FrameworkService.MNTFILEPATH = "/mnt/config"
FrameworkService.MNTFILEPATH = "/tmp/tars-framework"

FrameworkService.getFrameworkConfig = async () => {
    const CommonService = require('../common/CommonService');

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
        column: "frameworkConfig",
        remark: "#framework.remark.frameworkConfig#",
        value: data.expand.frameworkConfig || JSON.stringify({

        })
    })
    res.push({
        column: "nativeDBConfig",
        remark: "#framework.remark.nativeDBConfig#",
        value: data.expand.nativeDBConfig
    })
    res.push({
        column: "nativeFrameworkConfig",
        remark: "#framework.remark.nativeFrameworkConfig#",
        value: data.expand.nativeFrameworkConfig
    })
    return res
}

FrameworkService.saveFrameworkConfig = async (params) => {
    const CommonService = require('../common/CommonService');

    let data = await CommonService.getObject("tframeworkconfigs", CommonService.TFC);
    let tfc = data.body;
    switch (params.column) {
        case "frameworkConfig":
            tfc.expand.frameworkConfig = params.value;
            break;
        case "nativeFrameworkConfig":
            tfc.expand.nativeFrameworkConfig = params.value;
            break;
        case "nativeDBConfig":
            tfc.expand.nativeDBConfig = params.value;
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

    const CommonService = require('../common/CommonService');

    let config = await CommonService.getFrameworkConfig();

    // console.log(config.expand);

    let nativeFrameworkConfig = config.expand.nativeFrameworkConfig;
    let nativeDBConfig = config.expand.nativeDBConfig;

    mkdirSync(FrameworkService.MNTFILEPATH);

    WebConf.enable = false;

    if (fs.existsSync(FrameworkService.MNTFILEPATH) && nativeFrameworkConfig) {
        fs.writeFileSync(`${FrameworkService.MNTFILEPATH}/nativeFrameworkConfig.conf`, nativeFrameworkConfig);

        try {
            let framework = JSON.parse(config.expand.frameworkConfig);
            WebConf.market = framework.market || false;
        } catch (e) {
            WebConf.market = false;
            console.log(e);
        }

        if (nativeDBConfig) {
            try {

                let content = JSON.parse(nativeDBConfig);

                WebConf.enable = content.enable || false;

                if (content.enable) {
                    WebConf.dbConf = content.dbConf;
                    WebConf.client = `${FrameworkService.MNTFILEPATH}/nativeFrameworkConfig.conf`;
                    WebConf.show = content.show || false;
                }

                // console.log(content, WebConf);

            } catch (e) {
                console.log(e);
            }
        }
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