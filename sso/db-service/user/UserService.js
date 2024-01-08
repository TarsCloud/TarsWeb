let UserDao = require('../../dao/UserDao');
const logger = require('../../../logger');
let sha1 = require('sha1');

const UserService = {}

// UserService.getUserIdList = async() => {
//     return await UserDao.getUserIdList();
// }; 

    // authorization:
    // [
    //     {
    //         role: (admin ,operator ,developer )
    //         flag: string,
    //         updateTime:
    //     }
    // ]
    // let items = [];
    // data.forEach(item => {

    //     items.push({
    //         uid: item.spec.username,
    //         name: item.spec.username,
    //         update_time: item.metadata.creationTimestamp,
    //         authorization: item.spec.authorization,
    //     });
    // })

UserService.getUserAuthList = async() => {
    let data = await UserDao.getUserAuthList();

    let items = [];

    data.forEach(item => {
        if (items.length == 0 || items[items.length - 1].uid != item.uid) {
            items.push({
                uid: item.uid,
                name: item.uid,
                update_time: item.update_time,
                authorization: []
            });

            if (item.role && item.flag) {
                items[items.length - 1].authorization.push({
                    role: item.role,
                    flag: item.flag,                    
                })
            }    
        } else if (item.role && item.flag){
            items[items.length - 1].authorization.push({
                role: item.role,
                flag: item.flag,                 
            })
        }
    })    

    return items;
}; 

//注册操作
UserService.modifyPass = async(uid, password) => {
    await UserDao.modifyPass(uid, sha1(password));
    return {};
};

UserService.addUser = async(userList) => {
    let newUserList = [];
    userList.forEach((user)=> {
        newUserList.push({
            uid: user.uid,
            password: sha1(user.password),
            update_time: new Date()
        });
    });
    return UserDao.insertUser(newUserList);
};

UserService.deleteUser = async(uids) => {
    await UserDao.deleteUser({ 
        uid: uids
        });
};

module.exports = UserService;
