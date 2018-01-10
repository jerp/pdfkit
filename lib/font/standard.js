const AFMFont = require('./afm')
const PDFFont = require('../font')
const fs = require('fs')

// This insanity is so browserify can inline the font files
/* eslint-disable no-path-concat */
const STANDARD_FONTS = {
  'Courier'() { return fs.readFileSync(__dirname + '/../font/data/Courier.afm', 'utf8') },
  'Courier-Bold'() { return fs.readFileSync(__dirname + '/../font/data/Courier-Bold.afm', 'utf8') },
  'Courier-Oblique'() { return fs.readFileSync(__dirname + '/../font/data/Courier-Oblique.afm', 'utf8') },
  'Courier-BoldOblique'() { return fs.readFileSync(__dirname + '/../font/data/Courier-BoldOblique.afm', 'utf8') },
  'Helvetica'() { return fs.readFileSync(__dirname + '/../font/data/Helvetica.afm', 'utf8') },
  'Helvetica-Bold'() { return fs.readFileSync(__dirname + '/../font/data/Helvetica-Bold.afm', 'utf8') },
  'Helvetica-Oblique'() { return fs.readFileSync(__dirname + '/../font/data/Helvetica-Oblique.afm', 'utf8') },
  'Helvetica-BoldOblique'() { return fs.readFileSync(__dirname + '/../font/data/Helvetica-BoldOblique.afm', 'utf8') },
  'Times-Roman'() { return fs.readFileSync(__dirname + '/../font/data/Times-Roman.afm', 'utf8') },
  'Times-Bold'() { return fs.readFileSync(__dirname + '/../font/data/Times-Bold.afm', 'utf8') },
  'Times-Italic'() { return fs.readFileSync(__dirname + '/../font/data/Times-Italic.afm', 'utf8') },
  'Times-BoldItalic'() { return fs.readFileSync(__dirname + '/../font/data/Times-BoldItalic.afm', 'utf8') },
  'Symbol'() { return fs.readFileSync(__dirname + '/../font/data/Symbol.afm', 'utf8') },
  'ZapfDingbats'() { return fs.readFileSync(__dirname + '/../font/data/ZapfDingbats.afm', 'utf8') }
}
class StandardFont extends PDFFont {
  constructor(document, name, id) {
    super()
    this.document = document
    this.name = name
    this.id = id
    this.font = new AFMFont(STANDARD_FONTS[this.name]())
    this.ascender = this.font.ascender
    this.descender = this.font.descender
    this.bbox = this.font.bbox
    this.lineGap = this.font.lineGap
  }

  embed() {
    this.dictionary.data = {
      Type: 'Font',
      BaseFont: this.name,
      Subtype: 'Type1',
      Encoding: 'WinAnsiEncoding'
    }

    this.dictionary.end()
  }

  encode(text) {
    const encoded = this.font.encodeText(text)
    const glyphs = this.font.glyphsForString(`${text}`)
    const advances = this.font.advancesForGlyphs(glyphs)
    const positions = []
    for (let i = 0; i < glyphs.length; i++) {
      const glyph = glyphs[i]
      positions.push({
        xAdvance: advances[i],
        yAdvance: 0,
        xOffset: 0,
        yOffset: 0,
        advanceWidth: this.font.widthOfGlyph(glyph)
      })
    }

    return [encoded, positions]
  }

  widthOfString(string, size) {
    const glyphs = this.font.glyphsForString(`${string}`)
    const advances = this.font.advancesForGlyphs(glyphs)

    const width = advances.reduce((redWidth, advance) => {
      return redWidth + advance
    }, 0)

    const scale = size / 1000
    return width * scale
  }

  static isStandardFont(name) {
    return name in STANDARD_FONTS
  }
}

module.exports = StandardFont
