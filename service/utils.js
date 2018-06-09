/**
 * 返回62个字母数字0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
 */
exports.getChars = () => {
  let s = ''
  for (let i = +(4 + '8'); i < +(1 + '2' + 3); i++) {
    s += String.fromCharCode(i)
  }
  return s.slice(0, 10) + s.slice(17, 43) + s.slice(49)
}

exports.getHashName = (alphanums, num) => {
  let r = ''
  for (let i = 0; i < num; i++) {
    r += alphanums[Math.floor(Math.random() * 62)]
  }
  return r
}
