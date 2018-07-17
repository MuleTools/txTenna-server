/*!
 * lib/z85.js
 */
'use strict'


/**
 * A class providing static methods for z85 encoding/deconding
 * Implements http://rfc.zeromq.org/spec:32
 */
class Z85 {

  /**
   * Constructor
   */
  constructor() {}

  /**
   * Encode a data in Z85
   * @param {Buffer} data - array of bytes
   * @returns {string} returns the z85 encoded data
   */
  static encode(data) {
    const remainder = data.length % 4
    const padding = (remainder > 0) ? 4 - remainder : 0

    let ret = ''
    let value = 0

    for (let i = 0; i < data.length + padding; i++) {
      const isPadding = (i >= data.length)
      value = value * 256 + (isPadding ? 0 : data[i] & 0xFF)
    
      if ((i + 1) % 4 == 0) {
        let div = 52200625  // 85 * 85 * 85 * 85
        
        for (let j = 5; j > 0; j--) {
          if (!isPadding || (j > padding)) {
            const code = Math.floor(value / div) % 85
            ret += Z85.ENCODER[code]
          }
          div /= 85
        }
        
        value = 0
      }
    }

    return ret
  }

  /**
   * Decode a Z85 string
   * @param {string} string - Z85 encoded string
   * @returns {Buffer} returns a Buffer (bytes array)
   */
  static decode(string) {
    const remainder = string.length % 5
    const padding = 5 - ((remainder == 0) ? 5 : remainder)

    for (let p = 0; p < padding; p++)
      string += Z85.ENCODER[Z85.ENCODER.length - 1]

    const length = string.length

    let ret = new Buffer((length * 4 / 5) - padding)
    let index = 0
    let value = 0

    for (let i = 0; i < length; i++) {
      const code = string.charCodeAt(i) - 32
      value = value * 85 + Z85.DECODER[code]

      if ((i + 1) % 5 == 0) {
        let div = 16777216    // 256 * 256 * 256
        while (div >= 1) {
          if (index < ret.length)
            ret[index++] = (value / div) % 256
          div /= 256
        }
        value = 0
      }
    }

    return ret
  }

  /**
   * Check if a string looks like a z85 encoded chain
   * @param {string} s
   * @returns {boolean} returns true if the string looks like a z85 encoded chain, false otherwise
   */
  static isZ85(s) {
    //const regexZ85 = new RegExp(/^[0-9A-Za-z\\.\\-:\\+\\=\\^!\\/\\*\\?&<>\\(\\)\\[\\]\\{\\}\\@%\\$\\#]+$/)
    const regexZ85 = new RegExp(/^[0-9A-Za-z\.\-:\+\=\^!\/\*\?&<>\(\)\[\]\{\}\@%\$\#]+$/)
    const regexHex = new RegExp(/^[0-9A-Fa-f]+$/)
    return (regexZ85.test(s) && !regexHex.test(s))
  }

}

/**
 * Array of Z85 encoding characters
 */
Z85.ENCODER = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#'.split('')

/**
 * Array of decoded characters
 */
Z85.DECODER = [
  0x00, 0x44, 0x00, 0x54, 0x53, 0x52, 0x48, 0x00, 
  0x4B, 0x4C, 0x46, 0x41, 0x00, 0x3F, 0x3E, 0x45, 
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 
  0x08, 0x09, 0x40, 0x00, 0x49, 0x42, 0x4A, 0x47, 
  0x51, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 
  0x2B, 0x2C, 0x2D, 0x2E, 0x2F, 0x30, 0x31, 0x32, 
  0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 
  0x3B, 0x3C, 0x3D, 0x4D, 0x00, 0x4E, 0x43, 0x00, 
  0x00, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 
  0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 
  0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20, 
  0x21, 0x22, 0x23, 0x4F, 0x00, 0x50, 0x00, 0x00
]


module.exports = Z85
