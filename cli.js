#!/usr/bin/env node
'use strict'

var Transform = require('readable-stream/transform')
var concat = require('concat-stream')
var split = require('split')
var ndjson = require('ndjson')
var fs = require('fs')
var pump = require('pump')
var prompt = require('inquirer').prompt

var createApiStream = require('./lib/api-stream')

var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    o: 'output-file',
    n: 'num-results',
    s: 'soundcloud-client-id'
  }
})

var inputFile = argv._[0]
var outputFile = argv.o
var numResults = argv.n || 5
var SC_CLIENT_ID = argv.scid || process.env.SC_CLIENT_ID

if (!inputFile) {
  console.error('Must provide input file. STDIN is reserved for answering questions')
  process.exit(1)
}

if (!outputFile) {
  console.error('Must provide output file. STDOUT is reserved for answering questions')
  process.exit(1)
}

if (!SC_CLIENT_ID) {
  console.error('Must provide Soundcloud Client ID')
  process.exit(2)
}

var pendingQueries = []
pump(
  fs.createReadStream(inputFile),
  split(),
  Transform({
    objectMode: true,
    transform (query, enc, cb) {
      pendingQueries.push(query.toString('utf8'))
      this.push({q: query.toString('utf8')})
      cb()
    }
  }),
  createApiStream('https://api.soundcloud.com/tracks?client_id=' + SC_CLIENT_ID + '{&q}'),
  concatResponse(pendingQueries),
  listOptions(),
  ndjson.serialize(),
  fs.createWriteStream(outputFile)
)

function concatResponse (queryQueue) {
  return Transform({
    objectMode: true,
    transform (req, enc, cb) {
      var self = this
      req.pipe(concat(function (body) {
        var currentQuery = pendingQueries.shift()
        try {
          var json = JSON.parse(body)
          json.query = currentQuery
          self.push(json)
          cb()
        } catch (ex) {
          cb(ex)
        }
      }))
      .on('error', cb)
    }
  })
}

function listOptions () {
  return Transform({
    objectMode: true,
    highWaterMark: 1,
    transform (results, enc, cb) {
      var self = this

      prompt([{
        type: 'list',
        name: 'q',
        message: results.query,
        choices: results.slice(0, numResults).map(function (value) {
          return {
            name: value.title,
            value
          }
        }).concat({name: 'Skip', value: null})
      }], function (answers) {
        if (answers.q) self.push(answers.q)
        cb()
      })
    }
  })
}
