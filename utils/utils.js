/* eslint-disable compat/compat */
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const wxFile = require('../constants/wxFile');

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

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(
    vscode.Uri.file(path.join(currentFile))
  );
  const workspaceFolderPath = workspaceFolder.uri.fsPath;

  projectPath = workspaceFolderPath;
  if (!projectPath) {
    console.log('获取工程根路径异常！');
    return '';
  }
  return projectPath;
}

function isMinipro(document) {
  const rootPath = getProjectPath(document);
  const files = fs.readdirSync(rootPath);

  return files.includes(wxFile.appFile);
}

function isMiniProConfig(fileName) {
  return (
    fileName === wxFile.appFile || fileName === wxFile.extFile || fileName === wxFile.configFile
  );
}

function getAbsolutePath(document, selectPath, format = 'js') {
  console.log('%c zjs selectPath:', 'color: #0e93e0;background: #aaefe5;', selectPath);
  const rootPath = getProjectPath(document);
  const filePath = document.fileName;
  const baseDir = path.dirname(filePath);
  const fileName = path.basename(filePath);
  console.log('%c zjs baseDir:', 'color: #0e93e0;background: #aaefe5;', baseDir);
  console.log('%c zjs fileName:', 'color: #0e93e0;background: #aaefe5;', fileName);
  // 主要是针对图片做处理，图片传进来是自带格式的
  const isFileNameHasFormat = selectPath.split('.').length > 1;
  const selectPathWithFormat = `${selectPath}${isFileNameHasFormat ? '' : `.${format}`}`;

  let absolutePath;

  // 常规方法，通过路径开头判断是否是相对路径
  const getCommonAbsolutePath = (handlePath) => {
    // 为绝对路径时
    if (handlePath.startsWith('/')) {
      return path.join(rootPath, handlePath);
    }
    // 为相对路径时
    return path.resolve(baseDir, handlePath);
  };

  // 如果是小程序项目的json配置文件
  if (isMinipro && isMiniProConfig(fileName)) {
    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const isSelectPathInArr = (arr) => arr.findIndex((item) => item === selectPath) > -1;
    // 判断是否在pages里
    if (isSelectPathInArr(fileContent.pages)) {
      return path.join(rootPath, selectPathWithFormat);
    }
    // 判断是否在subpackages里
    if (fileContent.subpackages) {
      // 把subpackages转成key value形式
      const subpackagesObj = {};
      fileContent.subpackages.forEach((item) => (subpackagesObj[item.root] = item.pages));
      console.log('subpackagesObj', subpackagesObj);
      Object.keys(subpackagesObj).forEach((item) => {
        if (isSelectPathInArr(subpackagesObj[item])) {
          absolutePath = path.join(rootPath, item, selectPathWithFormat);
        }
      });
    }
    // 判断是否在usingComponents里
    console.log('%c zjs fileContent:', 'color: #0e93e0;background: #aaefe5;', fileContent);
    if (
      fileContent.usingComponents &&
      isSelectPathInArr(Object.values(fileContent.usingComponents))
    ) {
      return getCommonAbsolutePath(selectPathWithFormat);
    }
  } else {
    absolutePath = getCommonAbsolutePath(selectPathWithFormat);
  }

  return absolutePath;
}

module.exports = {
  getAbsolutePath,
  getProjectPath,
  isMinipro,
};
