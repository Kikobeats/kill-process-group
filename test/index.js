'use strict'

const pidtree = require('pidtree')
const pEvery = require('p-every')
const psList = require('ps-list')
const execa = require('execa')
const path = require('path')
const test = require('ava')

const scripts = {
  parent: path.join(__dirname, 'helpers', 'parent.js'),
  child: path.join(__dirname, 'helpers', 'child.js')
}

const killProcessGroup = require('../src')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const getProcess = async _pid =>
  (await psList()).find(({ pid }) => pid === _pid)

const processExist = async pid => !!(await getProcess(pid))

test('kill a process with no childs', async t => {
  const proc = execa.node(scripts.child, {
    stdio: 'inherit'
  })

  await delay(100)
  t.truthy(await processExist(proc.pid))
  await killProcessGroup(proc)
  t.falsy(await processExist(proc.id))
})

test('kill a detached process with no childs', async t => {
  const proc = execa.node(scripts.child, {
    detached: process.platform !== 'win32',
    stdio: 'inherit'
  })

  await delay(100)
  t.truthy(await processExist(proc.pid))
  await killProcessGroup(proc)
  t.falsy(await processExist(proc.id))
})

test('kill a detached process with childs', async t => {
  const proc = execa.node(scripts.parent, {
    detached: process.platform !== 'win32',
    stdio: 'inherit'
  })

  await delay(100)
  const pids = await pidtree(proc.pid)
  t.truthy(await pEvery(pids, processExist))
  await killProcessGroup(proc)
  t.falsy(await pEvery(pids, processExist))
})
