'use strict'

const { promisify } = require('util')
const exec = promisify(require('child_process').exec)

const isWin = process.platform === 'win32'

const win = async proc => {
  try {
    await exec(`taskkill /pid ${proc.pid} /T /F`)
  } catch (_) {
    // taskkill can fail to kill the process e.g. due to missing permissions.
    // Let's kill the process via Node API. This delays killing of all child
    // processes of `this.proc` until the main Node.js process dies.
    proc.kill()
  }
}

const unix = subprocess => {
  // on linux the process group can be killed with the group id prefixed with
  // a minus sign. The process group id is the group leader's pid.
  const processGroupId = -subprocess.pid
  try {
    process.kill(processGroupId, 'SIGKILL')
  } catch (error) {
    // Killing the process group can fail due e.g. to missing permissions.
    // Let's kill the process via Node API. This delays killing of all child
    // processes of `this.proc` until the main Node.js process dies.
    subprocess.kill('SIGKILL')
  }
}

module.exports = isWin ? win : unix