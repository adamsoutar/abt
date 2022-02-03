# @abt/bencode

Parses [bencode](https://en.wikipedia.org/wiki/Bencode), sort of like
the JSON of the BitTorrent protocol. It's used in `.torrent` files.

 > bencode in, POJOs out

 ```js
const parseBencode = require('@abt/bencode')

parseBencode('6:Hello!') // "Hello!"
parseBencode('li1ei2ei3ee') // [1, 2, 3]
parseBencode('d3:bari42e3:foo3:baze') // { bar: 42, foo: "baz" }
 ```
