let Dao = require('../../dao/SetDao');

module.exports = {
    async ldapConf() {
        data = await Dao.getKey("LDAP");
        if (data) {
            let ldap = JSON.parse(data.info);
            ldap.enableLDAP = true;
            return ldap;
        }

        return { enableLDAP: false }
    },
    async adminConf() {
        let data = await Dao.getKey("ADMIN");
        if (data != null) {
            return true;
        }

        return false;
    },
    async outterConf() {
        return 0;
    },
    async getList() {
        return await Dao.getList()
    },
    async get(id) {
        return await Dao.get(id);
    },
    async getKey(title) {
        return await Dao.getKey(title);
    },
    async update(uid, title, info) {
        try {
            JSON.parse(info);
        } catch (e) {
            throw Error("info format error");
        }

        return await Dao.update(uid, title, info);
    },
    async setValid(title, valid) {
        return await Dao.setValid(title, valid);
    }
}