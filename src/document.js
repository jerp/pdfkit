
/*
PDFDocument - represents an entire PDF document
By Devon Govett
*/

import { Readable as StreamReadable } from 'stream'
import PDFObject from './object'
import PDFReference from './reference'
import PDFPage from './page'

class PDFDocument extends StreamReadable {
  constructor(options) {
    super()
    this.options = options != null ? options : {}

    // PDF version
    this.version = 1.3

    // Whether streams should be compressed
    this.compress = this.options.compress != null ? this.options.compress : true

    this._pageBuffer = []
    this._pageBufferStart = 0

    // The PDF object store
    this._offsets = []
    this._waiting = 0
    this._ended = false
    this._offset = 0

    this._root = this.ref({
      Type: 'Catalog',
      Pages: this.ref({
        Type: 'Pages',
        Count: 0,
        Kids: []
      })
    })

    // The current page
    this.page = null

    // Initialize mixins
    this.initColor()
    this.initVector()
    this.initFonts()
    this.initText()
    this.initImages()

    // Initialize the metadata
    this.info = Object.assign({
      Producer: 'PDFKit',
      Creator: 'PDFKit',
      CreationDate: new Date()
    }, this.options.info)

    // Write the header
    // PDF version
    this._write(`%PDF-${this.version}`)

    // 4 binary chars, as recommended by the spec
    this._write('%\xFF\xFF\xFF\xFF')

    // Add the first page
    if (this.options.autoFirstPage !== false) {
      this.addPage()
    }
  }

  addPage(options = this.options) {
    if (!this.options.bufferPages) { this.flushPages() }

    // create a page object
    this.page = new PDFPage(this, options)
    this._pageBuffer.push(this.page)

    // add the page to the object store
    const pages = this._root.data.Pages.data
    pages.Kids.push(this.page.dictionary)
    pages.Count++

    // reset x and y coordinates
    this.x = this.page.margins.left
    this.y = this.page.margins.top

    // flip PDF coordinate system so that the origin is in
    // the top left rather than the bottom left
    this._ctm = [1, 0, 0, 1, 0, 0]
    this.transform(1, 0, 0, -1, 0, this.page.height)

    this.emit('pageAdded')

    return this
  }

  bufferedPageRange() {
    return { start: this._pageBufferStart, count: this._pageBuffer.length }
  }

  switchToPage(n) {
    const page = this._pageBuffer[n - this._pageBufferStart]
    if (page == null) {
      throw new Error(`switchToPage(${n}) out of bounds, current buffer covers pages ${this._pageBufferStart} to ${(this._pageBufferStart + this._pageBuffer.length) - 1}`)
    }

    this.page = page
  }

  flushPages() {
    // this local variable exists so we're future-proof against
    // reentrant calls to flushPages.
    const pages = this._pageBuffer
    this._pageBuffer = []
    this._pageBufferStart += pages.length
    pages.forEach(page => page.end())
  }

  ref(data) {
    const ref = new PDFReference(this, this._offsets.length + 1, data)
    this._offsets.push(null) // placeholder for this object's offset once it is finalized
    this._waiting++
    return ref
  }

  _read() { }
  // do nothing, but this method is required by node

  _write(data) {
    if (!Buffer.isBuffer(data)) {
      data = new Buffer(data + '\n', 'binary')
    }

    this.push(data)
    this._offset += data.length
  }

  addContent(data) {
    this.page.write(data)
    return this
  }

  _refEnd(ref) {
    this._offsets[ref.id - 1] = ref.offset
    if ((--this._waiting === 0) && this._ended) {
      this._finalize()
      this._ended = false
    }
  }

  write(filename, fn) {
    // print a deprecation warning with a stacktrace
    throw new Error('PDFDocument#write is deprecated, and will be removed in a future version of PDFKit. Please pipe the document into a Node stream.')
  }

  output() {
    // more difficult to support this. It would involve concatenating all the buffers together
    throw new Error('PDFDocument#output is deprecated, and has been removed from PDFKit. Please pipe the document into a Node stream.')
  }

  end() {
    this.flushPages()
    this._info = this.ref()
    Object.keys(this.info).forEach(key => {
      const val = this.info[key]
      this._info.data[key] = typeof val === 'string' ? new String(val) : val // eslint-disable-line no-new-wrappers
    })

    this._info.end()

    Object.keys(this._fontFamilies).forEach(name => {
      this._fontFamilies[name].finalize()
    })

    this._root.end()
    this._root.data.Pages.end()

    if (this._waiting === 0) {
      this._finalize()
    } else {
      this._ended = true
    }
  }

  _finalize() {
    // generate xref
    const xRefOffset = this._offset
    this._write('xref')
    this._write(`0 ${this._offsets.length + 1}`)
    this._write('0000000000 65535 f ')

    this._offsets.forEach(offset => {
      offset = (`0000000000${offset}`).slice(-10)
      this._write(offset + ' 00000 n ')
    })

    // trailer
    this._write('trailer')
    this._write(PDFObject.convert({
      Size: this._offsets.length + 1,
      Root: this._root,
      Info: this._info
    })
    )

    this._write('startxref')
    this._write(`${xRefOffset}`)
    this._write('%%EOF')

    // end the stream
    this.push(null)
  }

  toString() {
    return '[object PDFDocument]'
  }
}

import mixinsColor from './mixins/color'
import mixinsVector from './mixins/vector'
import mixinsFonts from './mixins/fonts'
import mixinsText from './mixins/text'
import mixinsImages from './mixins/images'
import mixinsAnnotations from './mixins/annotations'

// Load mixins
Object.assign(PDFDocument.prototype,
  mixinsColor,
  mixinsVector,
  mixinsFonts,
  mixinsText,
  mixinsImages,
  mixinsAnnotations
)

export default PDFDocument
