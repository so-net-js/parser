import Protocol from 'bin-protocol';
import Sugar    from 'sugar';

class Base {

  /**
   * Get type of number
   * @param value {number} number to test
   * @returns {string} type of number e.g. "UINT_8"
   */
  static GetNumberSize(value) {
    if (typeof value !== 'number') return '';
    if (!Number.isInteger(value)) return 'FLOAT';
    if (value >= 0) {
      let res = 'UINT_';
      if (value < 255) return res + 8;
      if (value < 65535) return res + 16;
      return res + 32;
    }
    let res = 'INT_';
    if (value >= -128 && value <= 127) return res + 8;
    if (value >= -32768 && value <= 32767) return res + 16;
    return res + 32;
  }

  constructor() {
    this.protocol       = new Protocol();
    this.types          = [];
    this.checkFunctions = {};
    const self          = this;

    this.protocol.define('Type', {
      read() {
        this.UInt8('type');
        return this.context.type;
      },
      write(value) {
        this.UInt8(value);
      }
    });

    this.protocol.define('Value', {
      read() {
        this.Type('type');
        this[self.types[this.context.type]]('res');
        if (this.context.type === 0) {
          this.context = undefined;
          return undefined;
        } else {
          return this.context.res;
        }
      },
      write(value) {
        let valueType = self.getTypeOfValue(value);
        this.Type(valueType)[self.types[valueType]](value);
      }
    });

    this.protocol.define('Pair', {
      read() {
        this.STRING_8('key').Value('value');
        return {
          key:   this.context.key,
          value: this.context.value
        };
      },
      write(value) {
        this.STRING_8(value.key).Value(value.value);
      }
    });

    this.defineType('UNDEFINED', (value) => value === undefined, () => undefined, () => undefined);

    this.defineType('NULL', (value) => value === null, () => null, () => undefined);

    this.defineType('EMPTY_STRING', (value) => typeof value === 'string' && value.length
      === 0, () => '', () => undefined);

    this.defineType('CHAR', (value) => typeof value === 'string' && value.length === 1, (self) => {
      self.Int8('char');
      return String.fromCharCode(self.context.char);
    }, (self, value) => {
      self.Int8(value.charCodeAt(0));
    });

    this.defineType('UINT_8', (value) => Base.GetNumberSize(value) === 'UINT_8', (self) => {
      self.UInt8('res');
      return self.context.res;
    }, (self, value) => {
      self.UInt8(value);
    });

    this.defineType('UINT_16', (value) => Base.GetNumberSize(value) === 'UINT_16', (self) => {
      self.UInt16LE('res');
      return self.context.res;
    }, (self, value) => {
      self.UInt16LE(value);
    });

    this.defineType('UINT_32', (value) => Base.GetNumberSize(value) === 'UINT_32', (self) => {
      self.UInt32LE('res');
      return self.context.res;
    }, (self, value) => {
      self.UInt32LE(value);
    });

    this.defineType('INT_8', (value) => Base.GetNumberSize(value) === 'INT_8', (self) => {
      self.Int8('res');
      return self.context.res;
    }, (self, value) => {
      self.Int8(value);
    });

    this.defineType('INT_16', (value) => Base.GetNumberSize(value) === 'INT_16', (self) => {
      self.Int16LE('res');
      return self.context.res;
    }, (self, value) => {
      self.Int16LE(value);
    });

    this.defineType('INT_32', (value) => Base.GetNumberSize(value) === 'INT_32', (self) => {
      self.Int32LE('res');
      return self.context.res;
    }, (self, value) => {
      self.Int32LE(value);
    });

    this.defineType('FLOAT', (value) => Base.GetNumberSize(value) === 'FLOAT', (self) => {
      self.DoubleLE('res');
      return self.context.res;
    }, (self, value) => {
      self.DoubleLE(value);
    });

    this.defineType('STRING_8', (value) => {
      if (typeof value !== 'string') return false;
      let len  = value.length;
      let uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '8';
    }, (self) => {
      self.UINT_8('length').loop('items', self.CHAR, self.context.length);
      return self.context.items.join('');
    }, (self, value) => {
      let strLen = value.length;
      self.UINT_8(strLen).loop(value.split(''), self.CHAR);
    });

    this.defineType('STRING_16', (value) => {
      if (typeof value !== 'string') return false;
      let len  = value.length;
      let uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '16';
    }, (self) => {
      self.UINT_16('length').loop('items', self.CHAR, self.context.length);
      return self.context.items.join('');
    }, (self, value) => {
      let strLen = value.length;
      self.UINT_16(strLen).loop(value.split(''), self.CHAR);
    });

    this.defineType('STRING_32', (value) => {
      if (typeof value !== 'string') return false;
      let len  = value.length;
      let uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '32';
    }, (self) => {
      self.UINT_32('length').loop('items', self.CHAR, self.context.length);
      return self.context.items.join('');
    }, (self, value) => {
      let strLen = value.length;
      self.UINT_32(strLen).loop(value.split(''), self.CHAR);
    });

    this.defineType('BOOLEAN', (value) => {
      return typeof value === 'boolean';
    }, (self) => {
      self.UINT_8('res');
      return self.context.res === 1;
    }, (self, value) => {
      self.UINT_8(value ? 1 : 0);
    });

    this.defineType('ARRAY_8', (value) => {
      if (typeof value !== 'object') return false;
      if (!Array.isArray(value)) return false;
      let len  = value.length;
      let uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '8';
    }, (self) => {
      self.UINT_8('size');
      if (self.context.size === 0) return [];
      self.loop('items', self.Value, self.context.size);
      return self.context.items;
    }, (self, value) => {
      let len = value.length;
      self.UINT_8(len).loop(value, self.Value);
    });

    this.defineType('ARRAY_16', (value) => {
      if (typeof value !== 'object') return false;
      if (!Array.isArray(value)) return false;
      let len  = value.length;
      let uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '16';
    }, (self) => {
      self.UINT_16('size');
      if (self.context.size === 0) return [];
      self.loop('items', self.Value, self.context.size);
      return self.context.items;
    }, (self, value) => {
      let len = value.length;
      self.UINT_16(len).loop(value, self.Value);
    });

    this.defineType('ARRAY_32', (value) => {
      if (typeof value !== 'object') return false;
      if (!Array.isArray(value)) return false;
      let len  = value.length;
      let uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '32';
    }, (self) => {
      self.UINT_32('size');
      if (self.context.size === 0) return [];
      self.loop('items', self.Value, self.context.size);
      return self.context.items;
    }, (self, value) => {
      let len = value.length;
      self.UINT_32(len).loop(value, self.Value);
    });

    this.defineType('OBJECT_8', (value) => {
      if (typeof value !== 'object') return false;
      if (Array.isArray(value)) return false;
      if (!Sugar.Object.isObject(value)) return false;
      let len  = Sugar.Object.keys(value).length;
      let uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '8';
    }, (self) => {
      self.UINT_8('size');
      if (self.context.size === 0) return {};
      self.loop('items', self.Pair, self.context.size);
      let res = {};
      self.context.items.forEach(item => {
        res[item.key] = item.value;
      });
      return res;
    }, (self, value) => {
      let len   = Sugar.Object.keys(value).length;
      let elems = Sugar.Object.keys(value).map(el => ({
        key:   el,
        value: value[el]
      }));
      self.UINT_8(len).loop(elems, self.Pair);
    });

    this.defineType('OBJECT_16', (value) => {
      if (typeof value !== 'object') return false;
      if (Array.isArray(value)) return false;
      if (!Sugar.Object.isObject(value)) return false;
      let len  = Sugar.Object.keys(value).length;
      let uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '16';
    }, (self) => {
      self.UINT_16('size');
      if (self.context.size === 0) return {};
      self.loop('items', self.Pair, self.context.size);
      let res = {};
      self.context.items.forEach(item => {
        res[item.key] = item.value;
      });
      return res;
    }, (self, value) => {
      let len   = Sugar.Object.keys(value).length;
      let elems = Sugar.Object.keys(value).map(el => ({
        key:   el,
        value: value[el]
      }));
      self.UINT_16(len).loop(elems, self.Pair);
    });

    this.defineType('OBJECT_32', (value) => {
      if (typeof value !== 'object') return false;
      if (Array.isArray(value)) return false;
      if (!Sugar.Object.isObject(value)) return false;
      let len  = Sugar.Object.keys(value).length;
      let uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '32';
    }, (self) => {
      self.UINT_32('size');
      if (self.context.size === 0) return {};
      self.loop('items', self.Pair, self.context.size);
      let res = {};
      self.context.items.forEach(item => {
        res[item.key] = item.value;
      });
      return res;
    }, (self, value) => {
      let len   = Sugar.Object.keys(value).length;
      let elems = Sugar.Object.keys(value).map(el => ({
        key:   el,
        value: value[el]
      }));
      self.UINT_32(len).loop(elems, self.Pair);
    });

    this.defineType('BUFFER_8', (value) => {
      if (!(value instanceof Buffer)) return false;
      let len  = value.length;
      let uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '8';
    }, (self) => {
      self.ARRAY_8('data');
      return Buffer.from(self.context.data);
    }, (self, value) => {
      self.ARRAY_8(value);
    });

    this.defineType('BUFFER_16', (value) => {
      if (!(value instanceof Buffer)) return false;
      let len  = value.length;
      let uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '16';
    }, (self) => {
      self.ARRAY_16('data');
      return Buffer.from(self.context.data);
    }, (self, value) => {
      self.ARRAY_16(value);
    });

    this.defineType('BUFFER_32', (value) => {
      if (!(value instanceof Buffer)) return false;
      let len  = value.length;
      let uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '32';
    }, (self) => {
      self.ARRAY_32('data');
      return Buffer.from(self.context.data);
    }, (self, value) => {
      self.ARRAY_32(value);
    });

  }


  /**
   * @private
   * @param value {any}
   * @returns {number} index in types array
   */
  getTypeOfValue(value) {
    for (let key in this.checkFunctions) {
      if (!this.checkFunctions.hasOwnProperty(key)) continue;
      let checkFunction = this.checkFunctions[key];
      if (checkFunction(value)) return this.types.indexOf(key);
    }
    return 0;
  }

  /**
   * Add custom type
   *
   * @throws Already defined error, if a type with the same name has already been defined
   *
   * @param typeName {string} Type name for second use
   * @param checkTypeFunction {function} Function to test if value is needed type
   * @param readFunction {function(types)} Parse this value from binary
   * @param writeFunction {function(types, value)} Create buffer from value
   * @returns {void}
   */
  defineType(typeName, checkTypeFunction, readFunction, writeFunction) {
    if (this.types.indexOf(typeName) !== -1) throw new Error('Type is already defined');
    this.types.push(typeName);
    this.checkFunctions[typeName] = checkTypeFunction;
    this.protocol.define(typeName, {
      read() {
        let types = this;
        return readFunction(types);
      },
      write(value) {
        let types = this;
        return writeFunction(types, value);
      }
    });
  }

}

export default Base;
