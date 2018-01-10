const parameters = {
  A: 7,
  a: 7,
  C: 6,
  c: 6,
  H: 1,
  h: 1,
  L: 2,
  l: 2,
  M: 2,
  m: 2,
  Q: 4,
  q: 4,
  S: 4,
  s: 4,
  T: 2,
  t: 2,
  V: 1,
  v: 1,
  Z: 0,
  z: 0
}

const runners = {
  M(p, doc, a) {
    p.cx = a[0]
    p.cy = a[1]
    p.px = (p.py = null)
    p.sx = p.cx
    p.sy = p.cy
    doc.moveTo(p.cx, p.cy)
  },

  m(p, doc, a) {
    p.cx += a[0]
    p.cy += a[1]
    p.px = (p.py = null)
    p.sx = p.cx
    p.sy = p.cy
    doc.moveTo(p.cx, p.cy)
  },

  C(p, doc, a) {
    p.cx = a[4]
    p.cy = a[5]
    p.px = a[2]
    p.py = a[3]
    doc.bezierCurveTo(...a)
  },

  c(p, doc, a) {
    doc.bezierCurveTo(a[0] + p.cx, a[1] + p.cy, a[2] + p.cx, a[3] + p.cy, a[4] + p.cx, a[5] + p.cy)
    p.px = p.cx + a[2]
    p.py = p.cy + a[3]
    p.cx += a[4]
    p.cy += a[5]
  },

  S(p, doc, a) {
    if (p.px === null) {
      p.px = p.cx
      p.py = p.cy
    }

    doc.bezierCurveTo(p.cx - (p.px - p.cx), p.cy - (p.py - p.cy), a[0], a[1], a[2], a[3])
    p.px = a[0]
    p.py = a[1]
    p.cx = a[2]
    p.cy = a[3]
  },

  s(p, doc, a) {
    if (p.px === null) {
      p.px = p.cx
      p.py = p.cy
    }

    doc.bezierCurveTo(p.cx - (p.px - p.cx), p.cy - (p.py - p.cy), p.cx + a[0], p.cy + a[1], p.cx + a[2], p.cy + a[3])
    p.px = p.cx + a[0]
    p.py = p.cy + a[1]
    p.cx += a[2]
    p.cy += a[3]
  },

  Q(p, doc, a) {
    p.px = a[0]
    p.py = a[1]
    p.cx = a[2]
    p.cy = a[3]
    doc.quadraticCurveTo(a[0], a[1], p.cx, p.cy)
  },

  q(p, doc, a) {
    doc.quadraticCurveTo(a[0] + p.cx, a[1] + p.cy, a[2] + p.cx, a[3] + p.cy)
    p.px = p.cx + a[0]
    p.py = p.cy + a[1]
    p.cx += a[2]
    p.cy += a[3]
  },

  T(p, doc, a) {
    if (p.px === null) {
      p.px = p.cx
      p.py = p.cy
    } else {
      p.px = p.cx - (p.px - p.cx)
      p.py = p.cy - (p.py - p.cy)
    }

    doc.quadraticCurveTo(p.px, p.py, a[0], a[1])
    p.px = p.cx - (p.px - p.cx)
    p.py = p.cy - (p.py - p.cy)
    p.cx = a[0]
    p.cy = a[1]
  },

  t(p, doc, a) {
    if (p.px === null) {
      p.px = p.cx
      p.py = p.cy
    } else {
      p.px = p.cx - (p.px - p.cx)
      p.py = p.cy - (p.py - p.cy)
    }

    doc.quadraticCurveTo(p.px, p.py, p.cx + a[0], p.cy + a[1])
    p.cx += a[0]
    p.cy += a[1]
  },

  A(p, doc, a) {
    solveArc(p, doc, a)
    p.cx = a[5]
    p.cy = a[6]
  },

  a(p, doc, a) {
    a[5] += p.cx
    a[6] += p.cy
    solveArc(p, doc, a)
    p.cx = a[5]
    p.cy = a[6]
  },

  L(p, doc, a) {
    p.cx = a[0]
    p.cy = a[1]
    p.px = (p.py = null)
    doc.lineTo(p.cx, p.cy)
  },

  l(p, doc, a) {
    p.cx += a[0]
    p.cy += a[1]
    p.px = (p.py = null)
    doc.lineTo(p.cx, p.cy)
  },

  H(p, doc, a) {
    p.cx = a[0]
    p.px = (p.py = null)
    doc.lineTo(p.cx, p.cy)
  },

  h(p, doc, a) {
    p.cx += a[0]
    p.px = (p.py = null)
    doc.lineTo(p.cx, p.cy)
  },

  V(p, doc, a) {
    p.cy = a[0]
    p.px = (p.py = null)
    doc.lineTo(p.cx, p.cy)
  },

  v(p, doc, a) {
    p.cy += a[0]
    p.px = (p.py = null)
    doc.lineTo(p.cx, p.cy)
  },

  Z(p, doc) {
    doc.closePath()
    p.cx = p.sx
    p.cy = p.sy
  },

  z(p, doc) {
    doc.closePath()
    p.cx = p.sx
    p.cy = p.sy
  }

}

const parse = (path) => {
  let cmd
  const ret = []
  let args = []
  let curArg = ''
  let foundDecimal = false
  let params = 0

  path.split('').forEach(c => {
    if (parameters[c] != null) {
      params = parameters[c]
      if (cmd) { // save existing command
        if (curArg.length > 0) {
          args[args.length] = +curArg
        }
        ret[ret.length] = { cmd, args }
        args = []
        curArg = ''
        foundDecimal = false
      }
      cmd = c
    } else if ([' ', ','].includes(c) || ((c === '-') && (curArg.length > 0) && (curArg[curArg.length - 1] !== 'e')) || ((c === '.') && foundDecimal)) {
      if (curArg.length !== 0) {
        if (args.length === params) { // handle reused commands
          ret[ret.length] = { cmd, args }
          args = [+curArg]

          // handle assumed commands
          if (cmd === 'M') {
            cmd = 'L'
          }
          if (cmd === 'm') {
            cmd = 'l'
          }
        } else {
          args[args.length] = +curArg
        }
        foundDecimal = (c === '.')
        // fix for negative numbers or repeated decimals with no delimeter between commands
        curArg = ['-', '.'].includes(c) ? c : ''
      }
    } else {
      curArg += c
      if (c === '.') {
        foundDecimal = true
      }
    }
  })

  // add the last command
  if (curArg.length > 0) {
    if (args.length === params) { // handle reused commands
      ret[ret.length] = { cmd, args }
      args = [+curArg]

      // handle assumed commands
      if (cmd === 'M') {
        cmd = 'L'
      }
      if (cmd === 'm') {
        cmd = 'l'
      }
    } else {
      args[args.length] = +curArg
    }
  }

  ret[ret.length] = { cmd, args }

  return ret
}

class SVGPath {
  static apply(doc, path) {
    const commands = parse(path)
    // current point, control point, and subpath starting point
    const p = {
      cx: 0,
      cy: 0,
      px: 0,
      py: 0,
      sx: 0,
      sy: 0
    }
    // run the commands
    commands.forEach(c => {
      if (typeof runners[c.cmd] === 'function') {
        runners[c.cmd](p, doc, c.args)
      }
    })
  }
}

function solveArc(p, doc, coords) {
  const [rx, ry, rot, large, sweep, ex, ey] = coords
  arcToSegments(ex, ey, rx, ry, large, sweep, rot, p)
    .forEach(seg => {
      const bez = segmentToBezier(...seg)
      doc.bezierCurveTo(...bez)
    })
}

function arcToSegments(x, y, rx, ry, large, sweep, rotateX, p) {
  const th = rotateX * (Math.PI / 180)
  const sinTh = Math.sin(th)
  const cosTh = Math.cos(th)
  rx = Math.abs(rx)
  ry = Math.abs(ry)
  p.px = (cosTh * (p.cx - x) * 0.5) + (sinTh * (p.cy - y) * 0.5)
  p.py = (cosTh * (p.cy - y) * 0.5) - (sinTh * (p.cx - x) * 0.5)
  let pl = ((p.px * p.px) / (rx * rx)) + ((p.py * p.py) / (ry * ry))
  if (pl > 1) {
    pl = Math.sqrt(pl)
    rx *= pl
    ry *= pl
  }

  const a00 = cosTh / rx
  const a01 = sinTh / rx
  const a10 = (-sinTh) / ry
  const a11 = (cosTh) / ry
  const x0 = (a00 * p.cx) + (a01 * p.cy)
  const y0 = (a10 * p.cx) + (a11 * p.cy)
  const x1 = (a00 * x) + (a01 * y)
  const y1 = (a10 * x) + (a11 * y)

  const d = ((x1 - x0) * (x1 - x0)) + ((y1 - y0) * (y1 - y0))
  let sfactorSq = (1 / d) - 0.25
  if (sfactorSq < 0) {
    sfactorSq = 0
  }
  let sfactor = Math.sqrt(sfactorSq)
  if (sweep === large) {
    sfactor = -sfactor
  }

  const xc = (0.5 * (x0 + x1)) - (sfactor * (y1 - y0))
  const yc = (0.5 * (y0 + y1)) + (sfactor * (x1 - x0))

  const th0 = Math.atan2(y0 - yc, x0 - xc)
  const th1 = Math.atan2(y1 - yc, x1 - xc)

  let thArc = th1 - th0
  if ((thArc < 0) && (sweep === 1)) {
    thArc += 2 * Math.PI
  } else if ((thArc > 0) && (sweep === 0)) {
    thArc -= 2 * Math.PI
  }

  const segments = Math.ceil(Math.abs(thArc / ((Math.PI * 0.5) + 0.001)))
  const result = []

  for (let i = 0; i < segments; i++) {
    const th2 = th0 + ((i * thArc) / segments)
    const th3 = th0 + (((i + 1) * thArc) / segments)
    result[i] = [xc, yc, th2, th3, rx, ry, sinTh, cosTh]
  }

  return result
}

function segmentToBezier(cx, cy, th0, th1, rx, ry, sinTh, cosTh) {
  const a00 = cosTh * rx
  const a01 = -sinTh * ry
  const a10 = sinTh * rx
  const a11 = cosTh * ry

  const thHalf = 0.5 * (th1 - th0)
  const t = ((8 / 3) * Math.sin(thHalf * 0.5) * Math.sin(thHalf * 0.5)) / Math.sin(thHalf)
  const x1 = (cx + Math.cos(th0)) - (t * Math.sin(th0))
  const y1 = cy + Math.sin(th0) + (t * Math.cos(th0))
  const x3 = cx + Math.cos(th1)
  const y3 = cy + Math.sin(th1)
  const x2 = x3 + (t * Math.sin(th1))
  const y2 = y3 - (t * Math.cos(th1))

  return [
    (a00 * x1) + (a01 * y1), (a10 * x1) + (a11 * y1),
    (a00 * x2) + (a01 * y2), (a10 * x2) + (a11 * y2),
    (a00 * x3) + (a01 * y3), (a10 * x3) + (a11 * y3)
  ]
}

module.exports = SVGPath
