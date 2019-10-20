import Base from './base';

class Decoder extends Base {
  decode(buffer) {
    let proto  = this.protocol.read(buffer);
    proto      = proto.Value('res');
    let result = proto.result;
    return result.res;
  }
}

export default Decoder;