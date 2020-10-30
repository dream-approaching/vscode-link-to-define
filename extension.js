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

  let workspaceFolders = vscode.workspace.workspaceFolders.map((item) => item.uri.path);
  // 由于存在Multi-root工作区，暂时没有特别好的判断方法，先这样粗暴判断
  // 如果发现只有一个根文件夹，读取其子文件夹作为 workspaceFolders
  if (workspaceFolders.length == 1 && workspaceFolders[0] === vscode.workspace.rootPath) {
    const rootPath = workspaceFolders[0];
    const files = fs.readdirSync(rootPath);
    workspaceFolders = files.filter((name) => !/^\./g.test(name)).map((name) => path.resolve(rootPath, name));
    // vscode.workspace.rootPath会不准确，且已过时
    // return vscode.workspace.rootPath + '/' + this._getProjectName(vscode, document);
  }
  // 获取出来的路径是反斜杠的 这里转换一下
  const regex = /\\/gi;
  const currentFilePath = currentFile.replace(regex, '/')
  workspaceFolders.forEach((folder) => {
    if (currentFilePath.replace(regex, '/').indexOf(folder.slice(1)) === 0) {
      projectPath = folder.slice(1);
    }
  });
  if (!projectPath) {
    vscode.window.showErrorMessage('获取工程根路径异常！');
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
  console.log('====== 进入 provideDefinition 方法 ======');
  const { fileName } = document;
  const workDir = path.dirname(fileName);
  const word = document.getText(document.getWordRangeAtPosition(position));
  const line = document.lineAt(position);
  const projectPath = getProjectPath(document);
  console.log('%c zjs projectPath:', 'color: #0e93e0;background: #aaefe5;', projectPath);

  console.log(`fileName: ${fileName}`); // 当前文件完整路径
  console.log(`workDir: ${workDir}`); // 当前文件所在目录
  console.log(`word: ${word}`); // 当前光标所在单词
  console.log(`line: ${line.text}`); // 当前光标所在行
  // 只处理js文件
  if (/\.js$/.test(fileName)) {
    console.log(word, line.text);
    const json = document.getText();
    // ajax('')
    const reg = new RegExp(`ajax\\(\\s*('|")${word.replace(/\//g, '\\/')}('|"),?`, 'gm');
    // yield call(ajax, 'deptRankList',
    const reg2 = new RegExp(`yield call\\(ajax\\, ?('|")${word.replace(/\//g, '\\/')}('|"), ?`, 'gm');
    if (reg.test(json) || reg2.test(json)) {
      const destPath = `${projectPath}/src/config/api.js`;
      console.log('%c zjs destPath:', 'color: #0e93e0;background: #aaefe5;', destPath);

      if (fs.existsSync(destPath)) {
        let lineNum = 0;
        try {
          const res = await getStuff(destPath, { encoding: 'utf-8' });
          const lines = res.toString().split('\n');
          console.log(`${path} ${lines.length}`);
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
exports.activate = function (context) {
  console.log('%c zjs context:', 'color: #0e93e0;background: #aaefe5;', 123);
  // 注册如何实现跳转到定义，第一个参数表示仅对json文件生效
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(['javascript'], {
      provideDefinition,
    })
  );
};

/**
 * 插件被释放时触发
 */
exports.deactivate = function () {
  console.log('您的扩展“vscode-plugin-demo”已被释放！');
};
