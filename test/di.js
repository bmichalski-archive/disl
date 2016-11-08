const env = (undefined === process.env.NODE_ENV) ? 'production' : process.env.NODE_ENV

if ('production' === env) {
  console.log('Exporting di.min')
  module.exports = require('../built/di.min')
} else {
  console.log('Exporting di-dev')
  module.exports = require('../built/di-dev')
}
