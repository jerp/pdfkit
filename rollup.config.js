// rollup.config.js
import babel from 'rollup-plugin-babel'
import builtins from 'rollup-plugin-node-builtins'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import replace from 'rollup-plugin-replace'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'lib/document.js',
  plugins: [
    builtins(),
    json(),
    inlineDataFiles({
      include: [
        './**/standard.js',
        './**/fontkit/**/*.js',
        './**/linebreak/**/*.js',
      ]
    }),
    // dirty trick to import fontkit with rollup-plugin-node-resolve
    replace({
      include: 'node_modules/fontkit/index.js',
      'module.exports = fontkit': "export default fontkit"
    }),
    resolve({
      // use "module" field for ES6 module if possible
      module: true,
      browser: true,
    }),
    commonjs({
      // non-CommonJS modules will be ignored, but you can also
      // specifically include/exclude files
      include: [
        'node_modules/linebreak/**',
        'node_modules/unicode-trie/**',
        'node_modules/tiny-inflate/**',
        'node_modules/png-js/**',
      ],
    }),
    babel({
      babelrc: false,
      presets: [['es2015', { modules: false, loose: true }]],
      //plugins: ['transform-decorators-legacy', 'transform-class-properties', 'transform-runtime'],
      plugins: ['external-helpers'],
      compact: true,
      runtimeHelpers: true
    })
  ],
  output: {
    file: 'index.js',
    format: 'cjs'
  }
};

// plugin inlining afm font file
import path from 'path'
import fs from 'fs'
import { createFilter } from "rollup-pluginutils"
const reAfm = /fs\.readFileSync\((?:(__dirname)\s*\+\s*)?["']((\.\/)?[^'"]+(?:\.afm))['"]\s*(?:,\s*'(utf8)')\)/g
const reLocPath = /(?:fs|require\('fs'\))\.readFileSync\((?:(__dirname)\s*\+\s*)?["']((\.\/)?[^'"]+(?:\.afm|\.trie))['"]\s*(?:,\s*['"]([^'"]*)['"])?\)/g
function inlineDataFiles(options = {}) {
  const {
    include, // = "./**/*.js"
    exclude
  } = options
  const filter = createFilter(include, exclude)
  return {
    name: 'inlineDataFiles',
    transform(code, id) {
      if (!filter(id)) {
        return null
      } else {
        if (reLocPath.test(code)) {
          return code.replace(reLocPath, (s, dirname, locPath, local, format, i) => {
            return loadFontFileContent(id, dirname, locPath, local, format)
          })
        } else {
          return null
        }
      }
    }
  }
}

function loadFontFileContent(id, dirname, locPath, local, format) {
  const resolvedPath = dirname ? path.resolve(path.dirname(id) + '/' + locPath) : path.resolve(locPath)
  try {
    return `${JSON.stringify(fs.readFileSync(resolvedPath, format))}`
  } catch (e) {
    console.log(`afm file not found: ${locPath}`, e)
    return `"" // afm file not found: ${locPath}`
  }
}
