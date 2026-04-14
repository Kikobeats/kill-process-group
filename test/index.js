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

const getProcessTreePids = async rootPid => {
  if (process.platform !== 'win32') return [rootPid, ...(await pidtree(rootPid))]

  const processList = await psList()
  const pids = new Set([rootPid])
  const queue = [rootPid]

  while (queue.length) {
    const currentPid = queue.shift()
    for (const processInfo of processList) {
      if (processInfo.ppid === currentPid && !pids.has(processInfo.pid)) {
        pids.add(processInfo.pid)
        queue.push(processInfo.pid)
      }
    }
  }

  return [...pids]
}

test('kill a process with no childs', async t => {
  const subprocess = $(`node ${scripts.child}`, { stdio: 'inherit' })
  subprocess.catch(() => {})
  t.teardown(async () => {
    try {
      await killProcessGroup(subprocess)
    } catch (_) {}
  })
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
  t.teardown(async () => {
    try {
      await killProcessGroup(subprocess)
    } catch (_) {}
  })
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
  t.teardown(async () => {
    try {
      await killProcessGroup(subprocess)
    } catch (_) {}
  })
  await setTimeout(100)
  const pids = await getProcessTreePids(subprocess.pid)
  t.truthy(await pEvery(pids, processExist))
  await killProcessGroup(subprocess)
  t.true(await waitForProcessesExit(pids))
  t.true(await pEvery(pids, async pid => !(await processExist(pid))))
})
