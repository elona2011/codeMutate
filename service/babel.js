const babel = require('babel-core')
const { readFileSync, writeFileSync } = require('fs')

module.exports = (file, options) => {
  let js = readFileSync(file, 'utf8')
  let r = babel.transform(js, {
    presets: ['env'],
  })

  writeFileSync(file, r.code)
}
