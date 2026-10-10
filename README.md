# kill-process-group

[![Last version](https://img.shields.io/github/v/tag/Kikobeats/kill-process-group?style=flat-square)](https://github.com/Kikobeats/kill-process-group/releases)
[![Coverage Status](https://img.shields.io/coverallsCoverage/github/Kikobeats/kill-process-group?style=flat-square)](https://coveralls.io/github/Kikobeats/kill-process-group)
[![NPM Status](https://img.shields.io/npm/dm/kill-process-group?style=flat-square)](https://www.npmjs.com/package/kill-process-group)

> It kills a process group. No dependencies. Windows support.

## Install

```bash
$ npm install kill-process-group --save
```

## Usage

```js
const killProcessGroup = require('kill-process-group')
const $ = require('tinyspawn')

const proc = $(`node ${scripts.parent}`, {
  detached: process.platform !== 'win32',
  stdio: 'inherit'
})

await killProcessGroup(proc)
```

## License

**kill-process-group** © [Kiko Beats](https://kikobeats.com), released under the [MIT](https://github.com/Kikobeats/kill-process-group/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Kiko Beats](https://kikobeats.com) with help from [contributors](https://github.com/Kikobeats/kill-process-group/contributors).

> [kikobeats.com](https://kikobeats.com) · GitHub [Kiko Beats](https://github.com/Kikobeats) · X [@Kikobeats](https://x.com/Kikobeats)
