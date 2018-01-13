import PDFFont from '../font'
import '../font/standard'
import '../font/embedded'

export default {
  initFonts() {
    // Lookup table for embedded fonts
    this._fontFamilies = {}
    this._fontCount = 0

    // Font state
    this._fontSize = 12
    this._font = null

    this._registeredFonts = {}

    // Set the default font
    this.font('Helvetica')
  },

  font(src, family, size) {
    let cacheKey, font
    if (typeof family === 'number') {
      size = family
      family = null
    }

    // check registered fonts if src is a string
    if ((typeof src === 'string') && this._registeredFonts[src]) {
      cacheKey = src
      const registeredFont = this._registeredFonts[src]
      src = registeredFont.src
      family = registeredFont.family
    } else {
      cacheKey = family || src
      if (typeof cacheKey !== 'string') {
        cacheKey = null
      }
    }

    if (size != null) {
      this.fontSize(size)
    }

    // fast path: check if the font is already in the PDF
    font = this._fontFamilies[cacheKey]
    if (font) {
      this._font = font
      return this
    }

    // load the font
    const id = `F${++this._fontCount}`
    this._font = PDFFont.open(this, src, family, id)

    // check for existing font familes with the same name already in the PDF
    // useful if the font was passed as a buffer
    font = this._fontFamilies[this._font.name]
    if (font) {
      this._font = font
      return this
    }

    // save the font for reuse later
    if (cacheKey) {
      this._fontFamilies[cacheKey] = this._font
    }

    if (this._font.name) {
      this._fontFamilies[this._font.name] = this._font
    }

    return this
  },

  fontSize(_fontSize) {
    this._fontSize = _fontSize
    return this
  },

  currentLineHeight(includeGap) {
    if (includeGap == null) {
      includeGap = false
    }
    return this._font.lineHeight(this._fontSize, includeGap)
  },

  registerFont(name, src, family) {
    this._registeredFonts[name] = {
      src,
      family
    }

    return this
  }
}
