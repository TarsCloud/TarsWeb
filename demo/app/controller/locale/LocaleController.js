const logger = require('../../logger');
const fs = require('fs-extra');
const util = require('../../tools/util');
const path = require('path');

let fileNames = fs.readdirSync(path.join(__dirname, '../../../locale'));
let locale = {};
fileNames.forEach((fileName) => {
    let content = require(path.join(__dirname, '../../../locale/', fileName));
    locale[content.localeCode] = content;
});

const LocaleController = {};
LocaleController.getLocale = async(ctx) => {
    ctx.makeResObj(200, '', locale || {});
};

module.exports = LocaleController;