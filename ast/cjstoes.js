const cjstoes = require('cjstoes')
const fse = require('fs-extra')
const glob = require('glob')
const { readFileSync, writeFileSync } = require('fs')

module.exports = () => {
  fse.copySync(`${process.cwd()}/pure/output`, `${process.cwd()}/.pureOutput`)
  glob.sync(`${process.cwd()}/.pureOutput/**/*.js`).forEach(file => {
    let f = readFileSync(file, 'utf8')
    let nf = cjstoes(f, file)
    writeFileSync(file, nf)
  })
}
