const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

function getStuff(paths, config) {
  return readFile(paths, config);
}

function getProjectPath(document) {
  if (!document) {
    document = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document : null;
  }
  if (!document) {
    vscode.window.showErrorMessage('当前激活的编辑器不是文件或者没有文件被打开！');
    return '';
  }
  const currentFile = (document.uri ? document.uri : document).fsPath;
  let projectPath = null;

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(path.join(currentFile)));
  const workspaceFolderPath = workspaceFolder.uri.fsPath;
  console.log('%c zjs workspaceFolderPath:', 'color: #0e93e0;background: #aaefe5;', workspaceFolderPath);

  projectPath = workspaceFolderPath;
  if (!projectPath) {
    console.log('获取工程根路径异常！');
    return '';
  }
  return projectPath;
}
/**
 * 查找文件定义的provider，匹配到了就return一个location，否则不做处理
 * 最终效果是，当按住Ctrl键时，如果return了一个location，字符串就会变成一个可以点击的链接，否则无任何效果
 * @param {*} document
 * @param {*} position
 * @param {*} token
 */
async function provideDefinition(document, position) {
  console.log('进入 provideDefinition');
  const { fileName } = document;
  const word = document.getText(document.getWordRangeAtPosition(position));
  const projectPath = getProjectPath(document);
  console.log('%c zjs projectPath:', 'color: #0e93e0;background: #aaefe5;', projectPath);

  // 只处理js文件
  if (/\.(js|jsx|ts|tsx)$/.test(fileName)) {
    const json = document.getText();
    // ajax('')
    const reg = new RegExp(`ajax\\(\\s*.*('|")${word.replace(/\//g, '\\/')}('|"),?`, 'gm');
    // yield call(ajax, 'deptRankList',
    const reg2 = new RegExp(`yield call\\(ajax\\, ?('|")${word.replace(/\//g, '\\/')}('|"), ?`, 'gm');
    if (reg.test(json) || reg2.test(json)) {
      // webapp项目
      const destPath1 = `${projectPath}/src/config/api.js`;
      // 小程序项目
      const destPath2 = `${projectPath}/config/api-config.js`;
      let destPath = '';
      if (fs.existsSync(destPath1)) {
        destPath = destPath1;
      } else if (fs.existsSync(destPath2)) {
        destPath = destPath2;
      }
      if (fs.existsSync(destPath)) {
        let lineNum = 0;
        try {
          const res = await getStuff(destPath, { encoding: 'utf-8' });
          const lines = res.toString().split('\n');
          lineNum = lines.findIndex((item) => item.indexOf(word) > -1);
          return new vscode.Location(vscode.Uri.file(destPath), new vscode.Position(lineNum, 0));
        } catch (error) {
          vscode.window.showErrorMessage('%c zjs error:', 'color: #0e93e0;background: #aaefe5;', JSON.stringify(error));
        }
      }
    }
  }
}

/**
 * 插件被激活时触发，所有代码总入口
 * @param {*} context 插件上下文
 */
function activate(context) {
  console.log('%c zjs context:', 'color: #0e93e0;background: #aaefe5;', 123);
  // 注册如何实现跳转到定义，第一个参数表示仅对json文件生效
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      { pattern: '**/*.{ts,js,jsx,tsx}' },
      {
        provideDefinition,
      }
    )
  );
}

module.exports = {
  activate,
};
