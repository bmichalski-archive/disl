const makeKarmaConf = require('./karma/make-karma-conf')

module.exports = makeKarmaConf({
  file: 'built/di-dev.js'
})