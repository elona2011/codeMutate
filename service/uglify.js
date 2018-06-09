const UglifyJS = require('uglify-js')
const { readFileSync, writeFileSync } = require('fs')

module.exports = (file, options) => {
  let js = readFileSync(file, 'utf8')
  let r = UglifyJS.minify(js)

  if (r.error) {
    console.log(r.error)
  } else {
    writeFileSync(file, r.code)
  }
}
