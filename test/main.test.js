import 'babel-polyfill'
import { expect } from 'chai'
import { build } from '../index'
import { parseModule } from 'esprima'
import { readFileSync } from 'fs'
import { parse } from 'path'

const options = {
  env: 'dev',
  inputDir: 'test',
  outputDir: '.dist',
  keyMutation: {},
  rollup: {
    shell: {
      inputOptions: {
        input: 'src/index.js',
      },
      outputOptions: {
        format: 'iife',
        file: '.bundle/index.js',
        name: 'bd',
      },
    },
    dynamic: {
      inputOptions: {
        input: 'src/b/index2.js',
      },
      outputOptions: {
        format: 'iife',
        file: '.bundle/index2.js',
      },
    },
  },
}

describe('mutate', () => {
  it('a', async () => {
    await build(options)
    Object.values(options.rollup).forEach(n => {
      let srcFile = readFileSync(
        `${process.cwd()}/${options.outputDir}/${options.env}/${parse(n.outputOptions.file).base}`,
        'utf8'
      )
      let srcAst = parseModule(srcFile)
      let destFile = readFileSync(
        `${process.cwd()}/test/dest/${parse(n.outputOptions.file).base}`,
        'utf8'
      )
      let destAst = parseModule(destFile)

      expect(srcAst).to.deep.equal(destAst)
    })
  })
})
