```js
const { build } = require('./build')
const { insert } = require('./service/insert')

build({
  env: 'dev',
  keyMutation: {},
  rollup: {
    shell: {
      inputOptions: {
        input: '.editEnv/collect/shell.js',
      },
      outputOptions: {
        format: 'iife',
        file: '.bundle/shell.js',
        name: 'bd',
      },
    },
    dynamic: {
      inputOptions: {
        input: '.editEnv/collect/dynamic.js',
      },
      outputOptions: {
        format: 'iife',
        file: '.bundle/dynamic.js',
        name: 'bd_d',
      },
    },
  },
  afterRollupPlugins: [insert],
})
```