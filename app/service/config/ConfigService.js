/**
 * Created by clauseliu on 2018/4/18.
 */


const ConfigService = {};

ConfigService.getServerConfigFile = async() => {

    let list = [{
        id              :   0,
        server_name     :   '',
        node_name       :   '',
        set_name        :   '',
        set_area        :   '',
        set_group       :   '',
        filename        :   '',
        config          :   '',
        level           :   1,
        posttime        :   ''
    }];
    return list
};

ConfigService.addConfigFile = async(params) => {

    return {
        id              :   0,
        server_name     :   '',
        node_name       :   '',
        set_name        :   '',
        set_area        :   '',
        set_group       :   '',
        filename        :   '',
        config          :   '',
        level           :   1,
        posttime        :   ''
    }
};

module.exports = ConfigService;