const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { getAbsolutePath, getProjectPath } = require('../../utils/utils');

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
  const filePath = document.fileName;
  const fileName = path.basename(filePath);
  console.log('%c zjs fileName:', 'color: #0e93e0;background: #aaefe5;', fileName);
  if (
    lineText.indexOf('import') > -1 &&
    lineText.indexOf('from' > -1) &&
    fileName.indexOf('md') === -1 // vscode中md默认不会跳转，需要自己处理
  )
    return;

  const range = document.getWordRangeAtPosition(position, /[\w|\-|\.|\#|\s|\/|\@]+\b/);
  const aliasObj = vscode.workspace.getConfiguration().get('linkToDefine.alias');
  if (!range) return;
  const word = document.getText(range);
  console.log('%c zjs word:', 'color: #0e93e0;background: #aaefe5;', word);

  let absolutePath = '';
  const matchAlias = Object.keys(aliasObj).filter((item) => word.indexOf(item) === 0);
  if (matchAlias.length) {
    const aliasKey = matchAlias[0];
    const [, word1] = word.split(aliasKey);
    const rootStr = '{root}';
    if (aliasObj[aliasKey].indexOf(rootStr) > -1) {
      const aliasPath = aliasObj[aliasKey].replace(rootStr, getProjectPath());
      // 把 / 替换成 \   因为这里的路径跳转要用 \
      absolutePath = `${aliasPath}${word1}`.replace(/\//g, '\\/');
      const stat = fs.statSync(absolutePath);
      if (stat.isDirectory()) {
        absolutePath = `${absolutePath}\\index.js`;
      }
    }
  } else {
    absolutePath = getAbsolutePath(document, word);
  }

  console.log('%c zjs absolutePath:', 'color: #0e93e0;background: #aaefe5;', absolutePath);
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
      { pattern: '**/*.{ts,js,jsx,tsx,json,wxml,md}' },
      {
        provideDefinition,
      }
    )
  );
}

module.exports = {
  activate,
};
