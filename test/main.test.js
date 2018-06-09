import 'babel-polyfill'
import { expect } from 'chai'
import { build } from '../index'

const options = {
  env: 'dev',
  inputDir: 'test',
  outputDir: '.dist',
  keyMutation: {},
  rollup: {
    shell: {
      inputOptions: {
        input: 'SnCaptcha.js',
      },
      outputOptions: {
        format: 'iife',
        file: '.bundle/SnCaptcha.js',
        name: 'bd',
      },
    },
    dynamic: {
      inputOptions: {
        input: 'slide/index.js',
      },
      outputOptions: {
        format: 'iife',
        file: '.bundle/slide.js',
      },
    },
  },
}

describe('mutate', () => {
  it('a', async () => {
    await build(options)
    expect(bundle).to.eql()
  })
})
