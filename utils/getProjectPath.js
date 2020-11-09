const vscode = require('vscode');
const path = require('path');

module.exports = function getProjectPath(document) {
  if (!document) {
    document = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.document
      : null;
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
};
