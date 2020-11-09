const vscode = require('vscode');
const wxmlDefinitionProvider = require('../../utils/wxmlDefinitionProvider');
const jsonDefinitionProvider = require('../../utils/jsonDefinitionProvider');

const documentSelector = [{ scheme: 'file', language: 'wxml', pattern: '**/*.wxml' }];
const documentSelectorJson = [{ scheme: 'file', language: 'json', pattern: '**/*.json' }];

function activate(context) {
  // 注册跳转到定义
  context.subscriptions.push(vscode.languages.registerDefinitionProvider(documentSelector, wxmlDefinitionProvider));

  // 注册json跳转到定义
  context.subscriptions.push(vscode.languages.registerDefinitionProvider(documentSelectorJson, jsonDefinitionProvider));
}

module.exports = {
  activate,
};
