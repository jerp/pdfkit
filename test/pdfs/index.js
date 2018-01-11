const fs = require('fs')

// reference and output dir for PDF files
const refFolder = `${__dirname}/ref`
const outFolder = `${__dirname}/out`

const CreationDate = new Date(1305567000000)

const newDoc = (PDFDocument, Producer = 'PDFKit 0.8.3') => {
  const doc = new PDFDocument()
  // avoid unwanted difference in creation date
  Object.assign(doc.info, {
    CreationDate,
    Producer
  })
  return doc
}

const docDefs = {
  'a-empty'(doc) {
  },
  'b-text-line'(doc) {
    doc.fontSize(25).text('Here is one text line...', 100, 80)
  },
  'b-text-columns'(doc) {
    // and some justified text wrapped into columns
    doc.text('Here is some wrapped text...', 100, 300)
      .font('Times-Roman', 13)
      .moveDown()
      .text('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. Ut nec accumsan nisl. Suspendisse rhoncus nisl posuere tortor tempus et dapibus elit porta. Cras leo neque, elementum a rhoncus ut, vestibulum non nibh. Phasellus pretium justo turpis. Etiam vulputate, odio vitae tincidunt ultricies, eros odio dapibus nisi, ut tincidunt lacus arcu eu elit. Aenean velit erat, vehicula eget lacinia ut, dignissim non tellus. Aliquam nec lacus mi, sed vestibulum nunc. Suspendisse potenti. Curabitur vitae sem turpis. Vestibulum sed neque eget dolor dapibus porttitor at sit amet sem. Fusce a turpis lorem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;\nMauris at ante tellus. Vestibulum a metus lectus. Praesent tempor purus a lacus blandit eget gravida ante hendrerit. Cras et eros metus. Sed commodo malesuada eros, vitae interdum augue semper quis. Fusce id magna nunc. Curabitur sollicitudin placerat semper. Cras et mi neque, a dignissim risus. Nulla venenatis porta lacus, vel rhoncus lectus tempor vitae. Duis sagittis venenatis rutrum. Curabitur tempor massa tortor.', {
        width: 412,
        align: 'justify',
        indent: 30,
        columns: 2,
        height: 300,
        ellipsis: true
      })
  },
  'c-embed-font'(doc) {
    const seedrandom = require('seedrandom')
    seedrandom('Palatino.', { global: true })
    doc.registerFont('Palatino', './demo/fonts/PalatinoBold.ttf')
    // Set the font, draw some text, and embed an image
    doc.font('Palatino')
      .fontSize(25)
      .text('Some text with an embedded font!', 100, 100)
  },
  'd-graphics-vector'(doc) {
    // draw some text
    doc.fontSize(25)
      .text('Here is some vector graphics...', 100, 80)
    // some vector graphics
    doc.save()
      .moveTo(100, 150)
      .lineTo(100, 250)
      .lineTo(200, 250)
      .fill('#FF3300')
    doc.circle(280, 200, 50)
      .fill('#6600FF')
  },
  'e-graphics-svg'(doc) {
    // draw some text
    doc.fontSize(25)
      .text('Here is some svg graphics...', 100, 80)
    // an SVG path
    doc.scale(0.6)
      .translate(470, 130)
      .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
      .fill('red', 'even-odd')
      .restore()
  },
  'f-page'(doc) {
    doc.fontSize(25).text('Here is one text line on the first page...', 100, 80)
    // Add another page
    doc.addPage()
    .fontSize(18)
    .text('Here is another page...', 100, 80)
  },
  'h-annotations'(doc) {
    // Add some text with annotations
    doc.fillColor("blue")
    .text('Here is a link!', 100, 100, { link: 'http://google.com/', underline: true })
  },
  'h-list'(doc) {
    // Add a list with a font loaded from a TrueType collection file   
    doc.fillColor('#000')
      .font('./demo/fonts/Chalkboard.ttc', 'Chalkboard', 16)
      .list(['One', 'Two', 'Three'], 100, 150)
  },
  'i-images'(doc) {
    doc.fontSize(25)
    .text('PNG and JPEG images:')
    .image('./demo/images/test.png', 100, 160, { width: 412 })
    .image('./demo/images/test.jpeg', 190, 400, { height: 300 })
  },
  'j-tiger'(doc) {
    const tiger = require('../../demo/tiger')
    // Add another page, and set the font back
    doc.registerFont('Palatino', './demo/fonts/PalatinoBold.ttf')
    doc.font('Palatino', 25)
    .text('Rendering some SVG paths...', 100, 100)
    .translate(220, 300)
    // Render each path that makes up the tiger image
    tiger.forEach(part => {
      doc.save()
      doc.path(part.path); // render an SVG path
      if (part['stroke-width']) {
        doc.lineWidth(part['stroke-width'])
      }
      if ((part.fill !== 'none') && (part.stroke !== 'none')) {
        doc.fillAndStroke(part.fill, part.stroke)
      } else {
        if (part.fill !== 'none') {
          doc.fill(part.fill)
        }     
        if (part.stroke !== 'none') {
          doc.stroke(part.stroke)
        }
      }
      doc.restore()
    })
  }
}
const docList = Object.keys(docDefs).map(name => {
  return {
    name,
    refPath: `${refFolder}/${name}.pdf`,
    outPath: `${outFolder}/${name}.pdf`,
    def: docDefs[name]
  }
})

module.exports = { docList, newDoc, refFolder, outFolder }
