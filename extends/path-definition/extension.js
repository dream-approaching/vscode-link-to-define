const vscode = require('vscode');
const fs = require('fs');
const { getAbsolutePath } = require('../../utils/utils');

/**
 * 查找文件定义的provider，匹配到了就return一个location，否则不做处理
 * 最终效果是，当按住Ctrl键时，如果return了一个location，字符串就会变成一个可以点击的链接，否则无任何效果
 * @param {*} document
 * @param {*} position
 * @param {*} token
 */
async function provideDefinition(document, position) {
  console.log('进入 path provideDefinition');
  // 如果是import的组件，则不处理
  const lineText = document.lineAt(position).text;
  if (lineText.indexOf('import') > -1 && lineText.indexOf('from' > -1)) return;

  const range = document.getWordRangeAtPosition(position, /[\w|\-|\.|\#|\s|\/]+\b/);
  if (!range) return;
  const word = document.getText(range);
  console.log('%c zjs word:', 'color: #0e93e0;background: #aaefe5;', word);
  const absolutePath = getAbsolutePath(document, word);
  console.log('%c zjs absolutePath:', 'color: #0e93e0;background: #aaefe5;', absolutePath);

  console.log('fs.existsSync(absolutePath)', fs.existsSync(absolutePath));
  if (fs.existsSync(absolutePath)) {
    try {
      return new vscode.Location(vscode.Uri.file(absolutePath), new vscode.Position(0, 0));
    } catch (error) {
      vscode.window.showErrorMessage(JSON.stringify(error));
    }
  }
}

/**
 * 插件被激活时触发，所有代码总入口
 * @param {*} context 插件上下文
 */
function activate(context) {
  // 注册如何实现跳转到定义，第一个参数表示仅对json文件生效
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      { pattern: '**/*.{ts,js,jsx,tsx,json,wxml}' },
      {
        provideDefinition,
      }
    )
  );
}

module.exports = {
  activate,
};
