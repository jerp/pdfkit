const { expect } = require('chai')

import Data from '../src/data'

const makeSting = (string) => (new String(string)) // eslint-disable-line

describe('Data', () => {
  it('exposes a class', () => {
    expect(Data).to.be.not.null
    expect(typeof Data).eq('function')
  })
  it('initiates properly', () => {
    const data = new Data()
    expect(Array.isArray(data.data)).to.be.true
    expect(data.data, 'data').to.have.lengthOf(0)
    expect(data.pos, 'pos').eq(0)
  })
  it('processes bytes properly', () => {
    const dataW = new Data()
    dataW.writeByte(1)
    dataW.writeByte(2)
    expect(dataW.data, 'dataW').to.have.lengthOf(2)
    expect(dataW.pos, 'pos').eq(2)
    dataW.write([3, 4])
    expect(dataW.data, 'dataW').to.have.lengthOf(4)
    const dataR = new Data(dataW.data)
    expect(dataR.data, 'dataR').to.have.lengthOf(4)
    expect(dataR.readByte()).to.eq(1)
    expect(dataR.byteAt(2)).to.eq(3)
    expect(dataR.byteAt(1)).to.eq(2)
    expect(dataR.readByte()).to.eq(2)
    expect(dataR.read(2)).to.deep.eq([3, 4])
  })
  it('processes UInt32 properly', () => {
    const dataW = new Data()
    dataW.writeUInt32(1)
    expect(dataW.data, '1').to.deep.eq([0, 0, 0, 1])
    dataW.writeUInt32(257)
    expect(dataW.data, '1,257').to.deep.eq([0, 0, 0, 1, 0, 0, 1, 1])
    const dataR = new Data(dataW.data)
    expect(dataR.readUInt32()).to.eq(1)
    expect(dataR.readUInt32()).to.eq(257)
  })
  it('processes UInt16 properly', () => {
    const dataW = new Data()
    dataW.writeUInt16(1)
    expect(dataW.data, '1').to.deep.eq([0, 1])
    dataW.writeUInt16(257)
    expect(dataW.data, '1,257').to.deep.eq([0, 1, 1, 1])
    const dataR = new Data(dataW.data)
    expect(dataR.readUInt16()).to.eq(1)
    expect(dataR.readUInt16()).to.eq(257)
  })
  it('processes Int32 properly', () => {
    const dataW = new Data()
    dataW.writeInt32(1)
    expect(dataW.data, '1').to.deep.eq([0, 0, 0, 1])
    dataW.writeInt32(-1)
    expect(dataW.data, '1,-1').to.deep.eq([0, 0, 0, 1, 255, 255, 255, 255])
    const dataR = new Data(dataW.data)
    expect(dataR.readInt32()).to.eq(1)
    expect(dataR.readInt32()).to.eq(-1)
  })
  it('processes Long numbers properly', () => {
    const dataW = new Data()
    dataW.writeLongLong(1)
    expect(dataW.data, '1').to.deep.eq([0, 0, 0, 0, 0, 0, 0, 1])
    dataW.writeLongLong(-1)
    expect(dataW.data, '1,-1').to.deep.eq([0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255, 255, 255, 255, 255])
    const dataR = new Data(dataW.data)
    expect(dataR.readLongLong()).to.eq(1)
    expect(dataR.readLongLong()).to.eq(-1)
  })
})
