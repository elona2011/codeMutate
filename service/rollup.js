const rollup = require('rollup')

const commonjs = require('rollup-plugin-commonjs')
const resolve = require('rollup-plugin-node-resolve')

const plugins = [
  resolve(),
  commonjs({
    include: ['node_modules/**'],
    namedExports: {
      // 'node_modules/chai/index.js': ['expect'],
      // 'node_modules/es6-promise/dist/es6-promise.js': ['Promise'],
      'node_modules/crypto-js/index.js': ['crypto'],
      // 'pure/index.js': ['addScript'],
    },
  }),
]

module.exports = options => {
  return Promise.all(
    Object.values(options.rollup).map(n => {
      if (n.pluginEdit) {
        n.inputOptions.plugins = n.pluginEdit(plugins)
      } else {
        n.inputOptions.plugins = plugins
      }
      return rollupBuild(n)
    })
  )
}

async function rollupBuild(options) {
  const bundle = await rollup.rollup(options.inputOptions)

  await bundle.write(options.outputOptions)
}
