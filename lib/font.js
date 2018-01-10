const fontkit = require('fontkit')

const createFont = (src, family) => {
  switch (true) {
  case typeof src === 'string': return fontkit.openSync(src, family)
  case Buffer.isBuffer(src): return fontkit.create(src, family)
  case src instanceof Uint8Array: return fontkit.create(new Buffer(src), family)
  case src instanceof ArrayBuffer: return fontkit.create(new Buffer(new Uint8Array(src)), family)
  default: throw new Error('Not a supported font format or standard PDF font.')
  }
}

class PDFFont {
  static open(document, src, family, id) {
    const StandardFont = require('./font/standard')
    if (typeof src === 'string' && StandardFont.isStandardFont(src)) {
      return new StandardFont(document, src, id)
    } else {
      const EmbeddedFont = require('./font/embedded')
      return new EmbeddedFont(document, createFont(src, family), id)
    }
  }
  constructor() {
    // throw new Error('Cannot construct a PDFFont directly.')
  }
  encode() {
    throw new Error('encode(text) must be implemented by subclasses')
  }
  widthOfString() {
    throw new Error('widthOfString(text) must be implemented by subclasses')
  }
  ref() {
    return this.dictionary != null ? this.dictionary : (this.dictionary = this.document.ref())
  }
  finalize() {
    if (!this.embedded && this.dictionary != null) {
      this.embed()
      this.embedded = true
    }
  }
  embed() {
    throw new Error('embed() must be implemented by subclasses')
  }
  lineHeight(size, includeGap = false) {
    const gap = includeGap ? this.lineGap : 0
    return (((this.ascender + gap) - this.descender) / 1000) * size
  }
}

module.exports = PDFFont
