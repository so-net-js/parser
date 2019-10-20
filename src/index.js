import Encoder from './encoder';
import Decoder from './decoder';

const encoder = new Encoder();
const decoder = new Decoder();


let testObject = {
  type:    'string',
  package: {
    x: 1,
    y: [undefined, null]
  }
};

let encoded = encoder.encode(testObject);
console.log(encoded);

let decoded = decoder.decode(encoded);
console.log(decoded);


export default {
  encoder,
  decoder
};