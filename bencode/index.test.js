import parseBencode from './index.js'

describe('Bencode', () => {
  describe('Integers', () => {
    it('should parse valid integers', () => {
      expect(parseBencode('i123e')).toBe(123)
    })

    it('should parse negative integers', () => {
      expect(parseBencode('i-123e')).toBe(-123)
    })

    it('should reject negative zero', () => {
      expect(() => parseBencode('i-0e')).toThrow()
    })

    it('should reject leading zeros', () => {
      expect(parseBencode('i0e')).toBe(0)
      expect(parseBencode('i102e')).toBe(102)
      expect(parseBencode('i10002e')).toBe(10002)
      expect(() => parseBencode('i01e')).toThrow()
      expect(() => parseBencode('i-01e')).toThrow()
      expect(() => parseBencode('i00e')).toThrow()
      expect(() => parseBencode('i-00e')).toThrow()
    })

    it('should reject unterminated integers', () => {
      expect(() => parseBencode('i123')).toThrow()
    })

    it('should reject invalid negatives', () => {
      expect(() => parseBencode('i1-2e')).toThrow()
    })

    it('should reject non-number characters', () => {
      expect(() => parseBencode('i1a2e')).toThrow()
    })
  })

  describe('Strings', () => {
    it('should parse valid strings', () => {
      expect(parseBencode('5:hello')).toBe('hello')
    })

    it('should parse valid strings with special chars', () => {
      expect(parseBencode('5::{@!?')).toBe(':{@!?')
    })

    it('should parse the empty string', () => {
      expect(parseBencode('0:')).toBe('')
    })

    it('should reject strings shorter than claimed', () => {
      expect(() => parseBencode('3:ab')).toThrow()
    })

    it('should reject strings longer than claimed', () => {
      expect(() => parseBencode('3:abcd')).toThrow()
    })

    it('should reject strings with invalid lengths', () => {
      expect(() => parseBencode('3x2:ab')).toThrow()
    })
  })

  describe('Lists', () => {
    it('should parse valid lists', () => {
      expect(parseBencode('li1e5:helloi2ee')).toStrictEqual([1, 'hello', 2])
    })

    it('should parse empty lists', () => {
      expect(parseBencode('le')).toStrictEqual([])
    })

    it('should reject unterminated lists', () => {
      expect(() => parseBencode('li1e')).toThrow()
    })
  })

  describe('Dictionaries', () => {
    it('should parse valid dictionaries', () => {
      expect(parseBencode('d3:bari123e3:foo3:baze')).toStrictEqual({ bar: 123, foo: 'baz' })
    })

    it('should parse empty dictionaries', () => {
      expect(parseBencode('de')).toStrictEqual({})
    })

    it('should reject unterminated dictionaries', () => {
      expect(() => parseBencode('d3:fooi123e')).toThrow()
    })

    it('should reject non-string keys', () => {
      expect(() => parseBencode('di123ei456ee')).toThrow()
    })

    it('should reject non-alphabetically-sorted keys', () => {
      expect(() => parseBencode('d3:fooi123e3:bari456ee')).toThrow()
    })
  })

  describe('Nesting', () => {
    it('should parse nested lists', () => {
      expect(parseBencode('li1eli1eli1ei2ei3eei3eei2ee')).toStrictEqual([1, [1, [1, 2, 3], 3], 2])
    })

    it('should parse nested dictionaries', () => {
      expect(parseBencode('d4:dictd4:nestd3:numi123eee5:otheri456ee')).toStrictEqual(
        { dict: { nest: { num: 123 } }, other: 456 }
      )
    })

    it('should parse mixed nesting', () => {
      expect(parseBencode('d4:listli123ed4:moreli1ei2ei3eeeli4ei5ei6eeee')).toStrictEqual(
        { list: [123, { more: [1, 2, 3] }, [4, 5, 6]] }
      )
    })
  })
})
 