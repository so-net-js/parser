import Base from './base';

class Encoder extends Base {
  encode(data) {
    let proto = this.protocol.write();
    proto     = proto.Value(data);
    return proto.result;
  }
}

export default Encoder;