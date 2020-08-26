const {
    tSetting
} = require('./db').db_user_system;

module.exports = {
    async update(uid, id, info) {
        return await tSetting.update({ info }, { where: { uid, id } })
    },
    async getList() {
        return await tSetting.findAll()
    },
    async get(id) {
        return await tSetting.findOne({ where: { id } })
    },
    async getKey(title) {
        return await tSetting.findOne({ where: { title: title, valid: 1 } })
    },
    async setValid(id, valid) {
        return await tSetting.update({ valid }, { where: { id } })
    }
}