class Data {
  constructor(data = []) {
    this.data = data
    this.pos = 0
    this.length = this.data.length
  }
  readByte() {
    return this.data[this.pos++]
  }
  writeByte(byte) {
    this.data[this.pos++] = byte
  }
  byteAt(index) {
    return this.data[index]
  }
  readBool() {
    return !!this.readByte()
  }
  writeBool(val) {
    this.writeByte(val ? 1 : 0)
  }
  readUInt32() {
    const b1 = this.readByte() * 0x1000000
    const b2 = this.readByte() << 16
    const b3 = this.readByte() << 8
    const b4 = this.readByte()
    return b1 + b2 + b3 + b4
  }
  writeUInt32(val) {
    this.writeByte((val >>> 24) & 0xff)
    this.writeByte((val >> 16) & 0xff)
    this.writeByte((val >> 8) & 0xff)
    this.writeByte(val & 0xff)
  }
  readInt32() {
    const int = this.readUInt32()
    return int >= 0x80000000 ? int - 0x100000000 : int
  }
  writeInt32(val) {
    if (val < 0) { val += 0x100000000 }
    this.writeUInt32(val)
  }
  readUInt16() {
    const b1 = this.readByte() << 8
    const b2 = this.readByte()
    return b1 | b2
  }
  writeUInt16(val) {
    this.writeByte((val >> 8) & 0xff)
    this.writeByte(val & 0xff)
  }
  readInt16() {
    const int = this.readUInt16()
    return int >= 0x8000 ? int - 0x10000 : int
  }
  writeInt16(val) {
    if (val < 0) { val += 0x10000 }
    this.writeUInt16(val)
  }
  readString(length) {
    return this.read(length).map(String.fromCharCode).join('')
  }
  writeString(val) {
    val.split('').forEach(ch => {
      this.writeByte(ch.charCodeAt(0))
    })
  }
  stringAt(pos, length) {
    this.pos = pos
    return this.readString(length)
  }
  readShort() {
    this.readInt16()
  }
  writeShort(val) {
    return this.writeInt16(val)
  }
  readLongLong() {
    const b1 = this.readByte()
    const b2 = this.readByte()
    const b3 = this.readByte()
    const b4 = this.readByte()
    const b5 = this.readByte()
    const b6 = this.readByte()
    const b7 = this.readByte()
    const b8 = this.readByte()
    if (b1 & 0x80) { // sign -> avoid overflow
      return (((b1 ^ 0xff) * 0x100000000000000) +
          ((b2 ^ 0xff) * 0x1000000000000) +
          ((b3 ^ 0xff) * 0x10000000000) +
          ((b4 ^ 0xff) * 0x100000000) +
          ((b5 ^ 0xff) * 0x1000000) +
          ((b6 ^ 0xff) * 0x10000) +
          ((b7 ^ 0xff) * 0x100) +
          (b8 ^ 0xff) + 1) * -1
    }
    return (b1 * 0x100000000000000) +
         (b2 * 0x1000000000000) +
         (b3 * 0x10000000000) +
         (b4 * 0x100000000) +
         (b5 * 0x1000000) +
         (b6 * 0x10000) +
         (b7 * 0x100) +
         b8
  }
  writeLongLong(val) {
    const high = Math.floor(val / 0x100000000)
    const low = val & 0xffffffff
    this.writeByte((high >> 24) & 0xff)
    this.writeByte((high >> 16) & 0xff)
    this.writeByte((high >> 8) & 0xff)
    this.writeByte(high & 0xff)
    this.writeByte((low >> 24) & 0xff)
    this.writeByte((low >> 16) & 0xff)
    this.writeByte((low >> 8) & 0xff)
    this.writeByte(low & 0xff)
  }
  readInt() {
    return this.readInt32()
  }
  writeInt(val) {
    this.writeInt32(val)
  }
  slice(start, end) {
    return this.data.slice(start, end)
  }
  read(bytes) {
    const buf = this.data.slice(this.pos, this.pos + bytes)
    this.pos += bytes
    return buf
  }
  write(bytes) {
    bytes.map((byte) =>
      this.writeByte(byte))
  }
}
module.exports = Data
