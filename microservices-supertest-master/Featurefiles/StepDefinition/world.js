const { setWorldConstructor } = require("cucumber");

function CustomWorld({attach, parameters}) {
  this.attach = attach
  this.isZap = false
  this.parameters = parameters
  this.response = ''
  this.baseUrl = ''


}
setWorldConstructor(CustomWorld);