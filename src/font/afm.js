class AFMFont {
  static open(filename) {
    const fs = require('fs')
    return new AFMFont(fs.readFileSync(filename, 'utf8'))
  }

  constructor(contents) {
    this.contents = contents
    this.attributes = {}
    this.glyphWidths = {}
    this.boundingBoxes = {}
    this.kernPairs = {}

    this.parse()
    this.charWidths = Array.from(Array(255).keys()).map((i) => this.glyphWidths[characters[i]])

    this.bbox = this.attributes['FontBBox'].split(/\s+/).map((e) => +e)
    this.ascender = +(this.attributes['Ascender'] || 0)
    this.descender = +(this.attributes['Descender'] || 0)
    this.lineGap = (this.bbox[3] - this.bbox[1]) - (this.ascender - this.descender)
  }

  parse() {
    let section = ''
    this.contents.split('\n').forEach(line => {
      const startMatch = line.match(/^Start(\w+)/)
      if (startMatch) {
        section = startMatch[1]
        return
      } else if (line.match(/^End(\w+)/)) {
        section = ''
        return
      }

      switch (section) {
      case 'FontMetrics':
        {
          const metricsMatch = line.match(/(^\w+)\s+(.*)/)
          const key = metricsMatch[1]
          const value = metricsMatch[2]
          const attribute = this.attributes[key]
          if (attribute) {
            if (!Array.isArray(attribute)) { this.attributes[key] = [attribute] }
            this.attributes[key].push(value)
          } else {
            this.attributes[key] = value
          }
        }
        break
      case 'CharMetrics':
        {
          if (!/^CH?\s/.test(line)) {
            return
          }
          const name = line.match(/\bN\s+(\.?\w+)\s*;/)[1]
          this.glyphWidths[name] = +line.match(/\bWX\s+(\d+)\s*;/)[1]
        }
        break
      case 'KernPairs':
        {
          const kernPairsMatch = line.match(/^KPX\s+(\.?\w+)\s+(\.?\w+)\s+(-?\d+)/)
          if (kernPairsMatch) {
            this.kernPairs[kernPairsMatch[1] + '\0' + kernPairsMatch[2]] = parseInt(kernPairsMatch[3])
          }
        }
        break
      }
    })
  }

  encodeText(text) {
    const res = []
    for (let i = 0; i < text.length; i++) {
      let char = text.charCodeAt(i)
      char = WIN_ANSI_MAP[char] || char
      res.push(char.toString(16))
    }

    return res
  }

  glyphsForString(string) {
    const glyphs = []

    for (let i = 0; i < string.length; i++) {
      const charCode = string.charCodeAt(i)
      glyphs.push(this.characterToGlyph(charCode))
    }

    return glyphs
  }

  characterToGlyph(character) {
    return characters[WIN_ANSI_MAP[character] || character] || '.notdef'
  }

  widthOfGlyph(glyph) {
    return this.glyphWidths[glyph] || 0
  }

  getKernPair(left, right) {
    return this.kernPairs[left + '\0' + right] || 0
  }

  advancesForGlyphs(glyphs) {
    const advances = []

    for (let index = 0; index < glyphs.length; index++) {
      const left = glyphs[index]
      const right = glyphs[index + 1]
      advances.push(this.widthOfGlyph(left) + this.getKernPair(left, right))
    }

    return advances
  }
}

export default AFMFont

const WIN_ANSI_MAP = {
  402: 131,
  8211: 150,
  8212: 151,
  8216: 145,
  8217: 146,
  8218: 130,
  8220: 147,
  8221: 148,
  8222: 132,
  8224: 134,
  8225: 135,
  8226: 149,
  8230: 133,
  8364: 128,
  8240: 137,
  8249: 139,
  8250: 155,
  710: 136,
  8482: 153,
  338: 140,
  339: 156,
  732: 152,
  352: 138,
  353: 154,
  376: 159,
  381: 142,
  382: 158
}

const characters = `\
.notdef       .notdef        .notdef        .notdef
.notdef       .notdef        .notdef        .notdef
.notdef       .notdef        .notdef        .notdef
.notdef       .notdef        .notdef        .notdef
.notdef       .notdef        .notdef        .notdef
.notdef       .notdef        .notdef        .notdef
.notdef       .notdef        .notdef        .notdef
.notdef       .notdef        .notdef        .notdef

space         exclam         quotedbl       numbersign
dollar        percent        ampersand      quotesingle
parenleft     parenright     asterisk       plus
comma         hyphen         period         slash
zero          one            two            three
four          five           six            seven
eight         nine           colon          semicolon
less          equal          greater        question

at            A              B              C
D             E              F              G
H             I              J              K
L             M              N              O
P             Q              R              S
T             U              V              W
X             Y              Z              bracketleft
backslash     bracketright   asciicircum    underscore

grave         a              b              c
d             e              f              g
h             i              j              k
l             m              n              o
p             q              r              s
t             u              v              w
x             y              z              braceleft
bar           braceright     asciitilde     .notdef

Euro          .notdef        quotesinglbase florin
quotedblbase  ellipsis       dagger         daggerdbl
circumflex    perthousand    Scaron         guilsinglleft
OE            .notdef        Zcaron         .notdef
.notdef       quoteleft      quoteright     quotedblleft
quotedblright bullet         endash         emdash
tilde         trademark      scaron         guilsinglright
oe            .notdef        zcaron         ydieresis

space         exclamdown     cent           sterling
currency      yen            brokenbar      section
dieresis      copyright      ordfeminine    guillemotleft
logicalnot    hyphen         registered     macron
degree        plusminus      twosuperior    threesuperior
acute         mu             paragraph      periodcentered
cedilla       onesuperior    ordmasculine   guillemotright
onequarter    onehalf        threequarters  questiondown

Agrave        Aacute         Acircumflex    Atilde
Adieresis     Aring          AE             Ccedilla
Egrave        Eacute         Ecircumflex    Edieresis
Igrave        Iacute         Icircumflex    Idieresis
Eth           Ntilde         Ograve         Oacute
Ocircumflex   Otilde         Odieresis      multiply
Oslash        Ugrave         Uacute         Ucircumflex
Udieresis     Yacute         Thorn          germandbls

agrave        aacute         acircumflex    atilde
adieresis     aring          ae             ccedilla
egrave        eacute         ecircumflex    edieresis
igrave        iacute         icircumflex    idieresis
eth           ntilde         ograve         oacute
ocircumflex   otilde         odieresis      divide
oslash        ugrave         uacute         ucircumflex
udieresis     yacute         thorn          ydieresis\
`.split(/\s+/)
