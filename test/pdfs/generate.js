const fs = require('fs')
// latest Coffeescript version of PDFKit
const PDFDocument = require('./pdfkit-0.8.3/document')
// const PDFDocument = require('../../lib/document')
const { docList, newDoc } = require('.')

const genDoc = ({name, refPath, def}) => {
  const doc = newDoc(PDFDocument)
  doc.pipe(fs.createWriteStream(refPath))
  if (typeof def === 'function') {
    def(doc)
  }
  doc.end()
}

docList.forEach((docDef) => {
  genDoc(docDef)
})
