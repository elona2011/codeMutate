const fse = require('fs-extra')
const glob = require('glob')
const rollup = require('./service/rollup')
const path = require('path')

const cm = {}
cm['.editEnv'] = require('./ast/editEnv')
// const { editObfus } = require('./ast/obfus')
cm['.toES5'] = require('./service/babel')
cm['.uglify'] = require('./service/uglify')

/**
 * options.outputDir 输出目录，默认为当前项目.dist
 * options.inputDir 输入目录，默认为当前项目src
 * options.outputNum 输出文件数量，默认为1
 * options.env 设置环境，将影响与环境相关代码，默认取process.env.NODE_ENV
 * options.hostname ajax/jsonp请求的hostname
 * options.rollup 对象，rollup打包设置
 * options.keyMutation 一个对象，key为字典名,value为需要乱序的字典值
 */
exports.build = async options => {
  let fromDir = options.inputDir || 'src'

  //before rollup
  fromDir = await doPlugin('beforeRollupPlugins', options, fromDir)

  Object.values(options.rollup).forEach(n => {
    n.inputOptions.input = path.join(fromDir, n.inputOptions.input)
  })
  //get rollup bundle dest
  let dirs = Object.values(options.rollup).map(n => {
    let folders = n.outputOptions.file.split('/')
    if (folders.length < 2) throw new Error('rollup output file path error!')
    return folders[0]
  })

  let rollupDist = dirs[0]
  if (dirs.every(n => n === rollupDist)) {
    fromDir = rollupDist
  } else {
    throw new Error('all rollup output file must under same folder!')
  }
  fse.emptyDirSync(`${process.cwd()}/${fromDir}`)

  return rollup(options).then(async () => {
    //after rollup
    fromDir = await doPlugin('afterRollupPlugins', options, fromDir)

    let buildin = ['.editEnv', '.toES5']
    for (let n of buildin) {
      fromDir = await mutate(options, n, fromDir)
    }

    //before uglify
    fromDir = await doPlugin('beforeUglifyPlugins', options, fromDir)

    //uglify
    fromDir = mutate(options, '.uglify', fromDir)

    //final output
    let output = options.outputDir || '.dist'
    let distDir = path.resolve(process.cwd(), output, options.env || process.env.NODE_ENV || 'dev')
    fse.emptyDirSync(distDir)
    fse.copySync(`${process.cwd()}/${fromDir}`, distDir)
    console.log(`${output} is ready`)
    // editClass()
    // editObfus()
  })
}

const mutate = (options, toDir, fromDir) => {
  fse.emptyDirSync(`${process.cwd()}/${toDir}`)
  fse.copySync(`${process.cwd()}/${fromDir}`, `${process.cwd()}/${toDir}`)
  glob.sync(`${process.cwd()}/${toDir}/**/*.js`).forEach(n => cm[toDir] && cm[toDir](n, options))

  console.log(`${toDir} is ready`)
  return toDir
}

const doPlugin = async (pluginType, options, fromDir) => {
  let plugins = options[pluginType]

  if (plugins && plugins.length > 0) {
    if (plugins.length === 1) {
      fromDir = await plugins[0](options, fromDir)
      console.log(`${fromDir} is ready`)
    } else if (plugins.length > 1) {
      for (let n of plugins) {
        fromDir = await n(options, fromDir)
        console.log(`${fromDir} is ready`)
      }
    }
  }
  return fromDir
}
