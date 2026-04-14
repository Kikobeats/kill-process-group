'use strict'

const { setTimeout } = require('timers/promises')
const pidtree = require('pidtree')
const pEvery = require('p-every')
const psList = require('ps-list')
const path = require('path')
const test = require('ava')
const $ = require('tinyspawn')

const scripts = {
  parent: path.join(__dirname, 'helpers', 'parent.js'),
  child: path.join(__dirname, 'helpers', 'child.js')
}

const killProcessGroup = require('../src')

const getProcess = async _pid =>
  (await psList()).find(({ pid }) => pid === _pid)

const processExist = async pid => !!(await getProcess(pid))

const waitFor = async (predicate, { timeout = 5000, interval = 100 } = {}) => {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeout) {
    if (await predicate()) return true
    await setTimeout(interval)
  }
  return predicate()
}

const waitForProcessExit = pid =>
  waitFor(async () => !(await processExist(pid)))

const waitForProcessesExit = pids =>
  waitFor(async () => pEvery(pids, async pid => !(await processExist(pid))))

test('kill a process with no childs', async t => {
  const subprocess = $(`node ${scripts.child}`, { stdio: 'inherit' })
  subprocess.catch(() => {})
  await setTimeout(100)
  t.truthy(await processExist(subprocess.pid))
  await killProcessGroup(subprocess)
  t.true(await waitForProcessExit(subprocess.pid))
  t.falsy(await processExist(subprocess.pid))
})

test('kill a detached process with no childs', async t => {
  const subprocess = $(`node ${scripts.child}`, {
    detached: process.platform !== 'win32',
    stdio: 'inherit'
  })
  subprocess.catch(() => {})
  await setTimeout(100)
  t.truthy(await processExist(subprocess.pid))
  await killProcessGroup(subprocess)
  t.true(await waitForProcessExit(subprocess.pid))
  t.falsy(await processExist(subprocess.pid))
})

test('kill a detached process with childs', async t => {
  const subprocess = $(`node ${scripts.parent}`, {
    detached: process.platform !== 'win32',
    stdio: 'inherit'
  })
  subprocess.catch(() => {})
  await setTimeout(100)
  const pids = [subprocess.pid, ...(await pidtree(subprocess.pid))]
  t.truthy(await pEvery(pids, processExist))
  await killProcessGroup(subprocess)
  t.true(await waitForProcessesExit(pids))
  t.true(await pEvery(pids, async pid => !(await processExist(pid))))
})
