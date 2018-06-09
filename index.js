const fse = require('fs-extra')
const glob = require('glob')
const rollup = require('./service/rollup')
const path = require('path')

const cm = {}
cm.editEnv = require('./ast/editEnv')
// const { editObfus } = require('./ast/obfus')
cm.toES5 = require('./service/babel')
cm.uglify = require('./service/uglify')

/**
 * options.outputDir 输出目录，默认为当前项目.dist
 * options.inputDir 输入目录，默认为当前项目src
 * options.outputNum 输出文件数量，默认为1
 * options.env 设置环境，将影响与环境相关代码
 * options.hostname ajax/jsonp请求的hostname
 * options.rollup 对象，rollup打包设置
 * options.keyMutation 一个对象，key为字典名,value为需要乱序的字典值
 */
exports.build = async options => {
  let pluginName = options.inputDir || 'src'

  //before rollup
  pluginName = await doPlugin('beforeRollupPlugins', options, pluginName)

  Object.values(options.rollup).forEach(n => {
    n.inputOptions.input = path.join('.' + pluginName, n.inputOptions.input)
  })
  return rollup(options).then(async () => {
    //get rollup bundle dest
    let dirs = Object.values(options.rollup).map(n => {
      let folders = n.outputOptions.file.split('/')
      if (folders.length < 2) throw new Error('rollup output file path error!')
      return folders[0]
    })

    let rollupDist = dirs[0]
    if (dirs.every(n => n === rollupDist)) {
      pluginName = rollupDist[0] === '.' ? rollupDist.slice(1) : rollupDist
    } else {
      throw new Error('all rollup output file must under same folder!')
    }

    //after rollup
    pluginName = await doPlugin('afterRollupPlugins', options, pluginName)

    let buildin = ['editEnv', 'toES5']
    for (let n of buildin) {
      pluginName = await mutate(options, n, pluginName)
    }

    //before uglify
    pluginName = await doPlugin('beforeUglifyPlugins', options, pluginName)

    //uglify
    pluginName = mutate(options, 'uglify', pluginName)

    //final output
    let output = options.outputDir || '.dist'
    let distDir = path.resolve(process.cwd(), output, options.env)
    fse.emptyDirSync(distDir)
    fse.copySync(`${process.cwd()}/.${pluginName}`, distDir)
    console.log(`output to ${output}: success`)
    // editClass()
    // editObfus()
  })
}

const mutate = (options, pluginName, fromPlugin) => {
  fse.emptyDirSync(`${process.cwd()}/.${pluginName}`)
  fse.copySync(`${process.cwd()}/.${fromPlugin}`, `${process.cwd()}/.${pluginName}`)
  glob
    .sync(`${process.cwd()}/.${pluginName}/**/*.js`)
    .forEach(n => cm[pluginName] && cm[pluginName](n, options))

  console.log(`buildin plugin ${pluginName}: success`)
  return pluginName
}

const doPlugin = async (pluginType, options, fromPlugin) => {
  let plugins = options[pluginType]

  if (plugins && plugins.length > 0) {
    if (plugins.length === 1) {
      fromPlugin = await plugins[0](options, fromPlugin)
      console.log(`foreign plugin ${fromPlugin}: success`)
    } else if (plugins.length > 1) {
      for (let n of plugins) {
        fromPlugin = await n(options, fromPlugin)
        console.log(`foreign plugin ${fromPlugin}: success`)
      }
    }
  }
  return fromPlugin
}

const getPath = 