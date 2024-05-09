'use strict'

const $ = require('tinyspawn')

const path = require('path')

for (let i = 0; i < 10; i++) {
  $(`node ${path.resolve(__dirname, 'child.js')}`, { stdio: 'inherit' })
}

setInterval(function () {
  // Does nothing, but prevents exit
}, 100)
