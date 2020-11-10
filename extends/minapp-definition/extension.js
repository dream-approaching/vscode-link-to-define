const vscode = require('vscode');
const wxmlDefinitionProvider = require('./wxmlDefinitionProvider');

const documentSelector = [{ scheme: 'file', language: 'wxml', pattern: '**/*.wxml' }];

function activate(context) {
  // 注册跳转到定义
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(documentSelector, wxmlDefinitionProvider)
  );
}

module.exports = {
  activate,
};
