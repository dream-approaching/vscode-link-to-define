// 适用于小程序项目
const path = require('path');
const fs = require('fs');

const appFile = 'app.json';

module.exports = function findRootPath(filePath) {
  const dir = path.dirname(filePath);
  const files = fs.readdirSync(dir);

  if (files.includes(appFile)) {
    return dir;
  }
  return findRootPath(dir);
};
