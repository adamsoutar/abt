class CharStream {
  index = 0
  constructor(str) {
    this.str = str
  }
  get peek() {
    return this.str[this.index]
  }
  read() {
    return this.str[this.index++]
  }
  get eof() {
    return this.index >= this.str.length
  }
  croak(message) {
    throw new Error(
      `Bencode parser croaked at position ${this.index}: ${message}`
    )
  }
}

const NUMBERS = '0123456789'.split('')
function isNumber(char) {
  return NUMBERS.includes(char)
}

function readNumber(charStream) {
  let numStr = ''
  let leading0 = false

  while (charStream.peek !== 'e') {
    if (charStream.eof) {
      charStream.croak('Stream ended mid integer')
    }
    if (charStream.peek === '-' && numStr.length != 0) {
      charStream.croak('Encountered a minus character mid-integer')
    }

    const char = charStream.read()
    if (!(isNumber(char) || char === '-')) {
      charStream.croak('Integer contained a non-number character')
    }
    if (leading0) {
      charStream.croak('Encountered a leading zero')
    }
    if (char === '0' && (
      numStr === '' ||
      numStr === '-'
    )) {
      leading0 = true
    }
    numStr += char
  }
  // Munch the 'e'
  charStream.read()

  const num = parseInt(numStr)

  if (num === 0 && !Object.is(num, 0)) {
    charStream.croak('Encountered integer negative zero')
  }

  return num
}

function readString(charStream, initialNumChar) {
  let numStr = initialNumChar

  while (charStream.peek !== ':') {
    if (!isNumber(charStream.peek)) {
      charStream.croak(`Invalid stream length '${numStr}${charStream.peek}'`)
    }
    if (charStream.eof) {
      charStream.croak('Stream ended mid string length')
    }
    numStr += charStream.read()
  }
  // Munch the ':'
  charStream.read()

  const stringLen = parseInt(numStr)
  let str = ''

  for (let i = 0; i < stringLen; i++) {
    if (charStream.eof) {
      charStream.croak('Stream ended mid string')
    }
    str += charStream.read()
  }

  return str
}

function readList(charStream) {
  const output = []

  while (charStream.peek !== 'e') {
    if (charStream.eof) {
      charStream.croak('Stream ended mid list')
    }
    output.push(readBencodeAtom(charStream))
  }
  charStream.read()

  return output
}

function readDictionary(charStream) {
  const output = {}

  while (charStream.peek !== 'e') {
    if (charStream.eof) {
      charStream.croak('Stream ended mid dictionary')
    }
    const strStart = charStream.read()
    if (!isNumber(strStart)) {
      charStream.croak('Encountered a non-string dictionary key')
    }
    const key = readString(charStream, strStart)
    const value = readBencodeAtom(charStream)
    output[key] = value
  }
  charStream.read()

  return output
}

function readBencodeAtom(charStream) {
  const start = charStream.read()

  if (start === 'i') {
    return readNumber(charStream)
  } else if (isNumber(start)) {
    return readString(charStream, start)
  } else if (start === 'l') {
    return readList(charStream)
  } else if (start === 'd') {
    return readDictionary(charStream)
  } else {
    charStream.croak(`Unexpected bencode type '${start}'`)
  }
}

export default function parseBencode(dataString) {
  const charStream = new CharStream(dataString)
  const atom = readBencodeAtom(charStream)

  if (!charStream.eof) {
    charStream.croak('Reader finished, but there was more data left')
  }

  return atom
}
