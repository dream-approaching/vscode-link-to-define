const minappCompDefinition = require('./extends/minapp-definition/extension');
const apiDefinition = require('./extends/api-definition/extension');
const pathDefinition = require('./extends/path-definition/extension');

function activate(context) {
  console.log('link-to-define is now active!');

  // 小程序组件跳转
  minappCompDefinition.activate(context);

  // ajax api跳转
  apiDefinition.activate(context);

  // path跳转
  pathDefinition.activate(context);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
