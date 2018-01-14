/*
PDFImage - embeds images in PDF documents
By Devon Govett
*/

import JPEG from './image/jpeg'
import PNG from './image/png'

class PDFImage {
  static open(src, label) {
    let data
    if (Buffer.isBuffer(src)) {
      data = src
    } else if (src instanceof ArrayBuffer) {
      data = new Buffer(new Uint8Array(src))
    } else {
      const match = /^data:.+;base64,(.*)$/.exec(src)
      if (match != null) {
        data = new Buffer(match[1], 'base64')
      } else {
        const fs = require('fs')
        data = fs.readFileSync(src)
        if (!data) {
          return
        }
      }
    }
    if ((data[0] === 0xff) && (data[1] === 0xd8)) {
      return new JPEG(data, label)
    } else if ((data[0] === 0x89) && (data.toString('ascii', 1, 4) === 'PNG')) {
      return new PNG(data, label)
    } else {
      throw new Error('Unknown image format.')
    }
  }
}

export default PDFImage
