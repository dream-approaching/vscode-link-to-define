const minappCompDefinition = require('./extends/minapp-definition/extension')
const apiDefinition = require('./extends/api-definition/extension')

function activate(context) {
  console.log('link-define is now active!')

  minappCompDefinition.activate(context)
  apiDefinition.activate(context)

}

function deactivate() {
}


module.exports = {
  activate,
  deactivate,
}
