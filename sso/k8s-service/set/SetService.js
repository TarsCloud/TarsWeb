const UserService = require('../user/UserService');
const update = require('./update');

update.update();

//数据类型{valid, title, info, about_cn, about_en, update_time }
module.exports = {

    async getConf(title) {
        let account = await UserService.getTAccount('admin');

        if (!account) {
            account = (await UserService.newTAccount('admin')).body;
        }

        if (account.spec.extra) {
            let value = account.spec.extra.find(i => {

                let v = JSON.parse(i);
            
                return v.title == title;
            });

            return JSON.parse(value);
        } else {
            return {};
        }
    },
    async ldapConf() {

        const conf = await this.getConf('LDAP');

        if (conf.valid) {
            let ldap = JSON.parse(conf.info);
            ldap.enableLDAP = true;
            return ldap;
        }

        return { enableLDAP: false }
    },
    async adminConf() {

        const conf = await this.getConf('ADMIN');
        return conf.valid;
    },
    async outterConf() {
        const conf = await this.getConf('OUTTER');
        return conf.valid;        
    },
    async getList() {

        let data = [];

        let account = await UserService.getTAccount('admin');

        if (!account) {
            return data;
        }

        // account = account.body;

        if (account.spec.extra) {

            account.spec.extra.forEach(item => {
                data.push(JSON.parse(item));
            })
        }

        return data
    },
    async get(id) {
        return await this.getConf(id); 
    },
    async getKey(title) {
        if (title == 'LDAP') {
            return await this.getConf(0)
        } else if (title == 'ADMIN') {
            return await this.getConf(1)
        } else if (title == 'OUTTER') {
            return await this.getConf(2)
        }

        return null;
    },
    async update(uid, title, info) {

        let account = await UserService.getTAccount('admin');

        if (account) {

            // account = account.body;

            for (let i = 0; i < account.spec.extra.length; i++) {
                let value = JSON.parse(account.spec.extra[i]);

                if (value.title == title) {
                    value.info = info;
                    account.spec.extra[i] = JSON.stringify(value);
                    break;
                }
            }
            
            await UserService.replaceTAccount('admin', account);
        }
    },
    async setValid(title, valid) {
        let account = await UserService.getTAccount('admin');

        if (account) {

            // account = account.body;

            for (let i = 0; i < account.spec.extra.length; i++) {
                let value = JSON.parse(account.spec.extra[i]);

                if (value.title == title) {
                    value.valid = valid;
                    account.spec.extra[i] = JSON.stringify(value);
                    break;
                }
            }
            
            await UserService.replaceTAccount('admin', account);
        }
    }
}