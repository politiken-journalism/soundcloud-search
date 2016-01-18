'use strict'

var hyperquest = require('hyperquest')
var uriTemplate = require('uritemplate')
var Transform = require('readable-stream/transform')

module.exports = function createApiStream (url) {
  var uri = uriTemplate.parse(url)

  return new Transform({
    objectMode: true,
    transform: function (paramObj, enc, cb) {
      this.push(hyperquest(uri.expand(paramObj)))
      cb()
    }
  })
}
