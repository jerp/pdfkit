const { expect } = require('chai')
const fs = require('fs')
import PDFDocument from '../lib/document'

const { docList, newDoc, refFolder, outFolder } = require('./pdfs/')

describe('document', () => {
  it('exposes a class', () => {
    expect(PDFDocument).to.be.not.null
    expect(typeof PDFDocument).eq('function')
  })
  docList.forEach(({ name, refPath, outPath, def }) => {
    it(`generates correctly ${name}.pdf`, () => {
      const doc = newDoc(PDFDocument)
      const stream = doc.pipe(fs.createWriteStream(outPath))
      // const bufferStream = new BufferStream()
      // const stream = doc.pipe(bufferStream)
      if (typeof def === 'function') {
        def(doc)
      }
      doc.end()
      return new Promise((resolve, reject) => {
        if (fs.existsSync(refPath)) {
          const refPdf = fs.readFileSync(refPath).toString()
          stream.on('finish', () => {
            if (fs.existsSync(outPath)) {
              const outPdf = fs.readFileSync(outPath).toString()
              resolve({ outPdf, refPdf})
            } else {
              reject(`${name}.pdf not generated`)
            }
          })
          stream.on('error', () => {
            debugger
          })
        } else {
          reject(`${name}.pdf not found in ${refFolder}`)
        }
      }).then(({ outPdf, refPdf}) => {
        expect(outPdf.split('\n'), 'pdf content').to.deep.eq(refPdf.split('\n'))
      })
    })
  })
})

const stream = require('stream')

class BufferStream extends stream.Writable {
  constructor(document, id, data = {}) {
    super({ decodeStrings: false })
  }
  write(chunk, encoding, callback) {
    const ret = stream.Writable.prototype.write.apply(this, arguments)
    if (!ret) this.emit('drain')
    return ret
  }
  _write(chunk, encoding, callback) {
    this.write(chunk, encoding, callback)
  }
  toString() {
    return this.toBuffer().toString()
  }
  toBuffer() {
    const buffers = []
    this._writableState.getBuffer().forEach(function (data) {
      buffers.push(data.chunk)
    })
    return Buffer.concat(buffers)
  }
  end() {
    this.emit('finish')
  }
}

const cleanOutFolder = () => {
  if (fs.existsSync(outFolder)) {
    deleteFolderContent(outFolder)
  } else {
    fs.mkdirSync(outFolder)
  }
}
const deleteFolderContent = (path) => {
  fs.readdirSync(path).forEach((file) => {
    const curPath = `${path}/${file}`
    if (fs.lstatSync(curPath).isDirectory()) {
      deleteFolderContent(curPath)
      fs.rmdirSync(curPath)
    } else {
      fs.unlinkSync(curPath)
    }
  })
}
cleanOutFolder()
