"use strict"

module.exports = function (conf) {
  return function(config) {
    config.set({
      basePath: '',
      frameworks: [ 'mocha', 'chai-as-promised', 'chai', 'sinon' ],
      files: [
        conf.file,
        'test/**/*.spec.js',
        'node_modules/requirejs/require.js',
        'node_modules/angular/angular.js'
      ],
      browsers: [
        'Chrome',
        'Firefox'
      ],
      colors: true
    })
  }
}
