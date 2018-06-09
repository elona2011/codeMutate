const { readFileSync, writeFileSync } = require('fs')
const { editDebugCode } = require('debugcode')

module.exports = (file, options) => {
  let js = readFileSync(file, 'utf8'),
    newJs = editDebugCode(js, options.env)

  writeFileSync(file, newJs)
}
