'use strict'

const execa = require('execa')
const path = require('path')

for (let i = 0; i < 10; i++) {
  execa.node(path.resolve(__dirname, 'child.js'), { stdio: 'inherit' })
}

setInterval(function () {
  // Does nothing, but prevents exit
}, 100)
