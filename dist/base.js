"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _binProtocol = _interopRequireDefault(require("bin-protocol"));

var _sugar = _interopRequireDefault(require("sugar"));

var Base =
/*#__PURE__*/
function () {
  (0, _createClass2["default"])(Base, null, [{
    key: "GetNumberSize",

    /**
     * Get type of number
     * @param value {number} number to test
     * @returns {string} type of number e.g. "UINT_8"
     */
    value: function GetNumberSize(value) {
      if (typeof value !== 'number') return '';
      if (!Number.isInteger(value)) return 'FLOAT';

      if (value >= 0) {
        var _res = 'UINT_';
        if (value < 255) return _res + 8;
        if (value < 65535) return _res + 16;
        return _res + 32;
      }

      var res = 'INT_';
      if (value >= -128 && value <= 127) return res + 8;
      if (value >= -32768 && value <= 32767) return res + 16;
      return res + 32;
    }
  }]);

  function Base() {
    (0, _classCallCheck2["default"])(this, Base);
    this.protocol = new _binProtocol["default"]();
    this.types = [];
    this.checkFunctions = {};
    var self = this;
    this.protocol.define('Type', {
      read: function read() {
        this.UInt8('type');
        return this.context.type;
      },
      write: function write(value) {
        this.UInt8(value);
      }
    });
    this.protocol.define('Value', {
      read: function read() {
        this.Type('type');
        this[self.types[this.context.type]]('res');

        if (this.context.type === 0) {
          this.context = undefined;
          return undefined;
        } else {
          return this.context.res;
        }
      },
      write: function write(value) {
        var valueType = self.getTypeOfValue(value);
        this.Type(valueType)[self.types[valueType]](value);
      }
    });
    this.protocol.define('Pair', {
      read: function read() {
        this.STRING_8('key').Value('value');
        return {
          key: this.context.key,
          value: this.context.value
        };
      },
      write: function write(value) {
        this.STRING_8(value.key).Value(value.value);
      }
    });
    this.defineType('UNDEFINED', function (value) {
      return value === undefined;
    }, function () {
      return undefined;
    }, function () {
      return undefined;
    });
    this.defineType('NULL', function (value) {
      return value === null;
    }, function () {
      return null;
    }, function () {
      return undefined;
    });
    this.defineType('EMPTY_STRING', function (value) {
      return typeof value === 'string' && value.length === 0;
    }, function () {
      return '';
    }, function () {
      return undefined;
    });
    this.defineType('CHAR', function (value) {
      return typeof value === 'string' && value.length === 1;
    }, function (self) {
      self.Int8('char');
      return String.fromCharCode(self.context["char"]);
    }, function (self, value) {
      self.Int8(value.charCodeAt(0));
    });
    this.defineType('UINT_8', function (value) {
      return Base.GetNumberSize(value) === 'UINT_8';
    }, function (self) {
      self.UInt8('res');
      return self.context.res;
    }, function (self, value) {
      self.UInt8(value);
    });
    this.defineType('UINT_16', function (value) {
      return Base.GetNumberSize(value) === 'UINT_16';
    }, function (self) {
      self.UInt16LE('res');
      return self.context.res;
    }, function (self, value) {
      self.UInt16LE(value);
    });
    this.defineType('UINT_32', function (value) {
      return Base.GetNumberSize(value) === 'UINT_32';
    }, function (self) {
      self.UInt32LE('res');
      return self.context.res;
    }, function (self, value) {
      self.UInt32LE(value);
    });
    this.defineType('INT_8', function (value) {
      return Base.GetNumberSize(value) === 'INT_8';
    }, function (self) {
      self.Int8('res');
      return self.context.res;
    }, function (self, value) {
      self.Int8(value);
    });
    this.defineType('INT_16', function (value) {
      return Base.GetNumberSize(value) === 'INT_16';
    }, function (self) {
      self.Int16LE('res');
      return self.context.res;
    }, function (self, value) {
      self.Int16LE(value);
    });
    this.defineType('INT_32', function (value) {
      return Base.GetNumberSize(value) === 'INT_32';
    }, function (self) {
      self.Int32LE('res');
      return self.context.res;
    }, function (self, value) {
      self.Int32LE(value);
    });
    this.defineType('FLOAT', function (value) {
      return Base.GetNumberSize(value) === 'FLOAT';
    }, function (self) {
      self.DoubleLE('res');
      return self.context.res;
    }, function (self, value) {
      self.DoubleLE(value);
    });
    this.defineType('STRING_8', function (value) {
      if (typeof value !== 'string') return false;
      var len = value.length;
      var uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '8';
    }, function (self) {
      self.UINT_8('length').loop('items', self.CHAR, self.context.length);
      return self.context.items.join('');
    }, function (self, value) {
      var strLen = value.length;
      self.UINT_8(strLen).loop(value.split(''), self.CHAR);
    });
    this.defineType('STRING_16', function (value) {
      if (typeof value !== 'string') return false;
      var len = value.length;
      var uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '16';
    }, function (self) {
      self.UINT_16('length').loop('items', self.CHAR, self.context.length);
      return self.context.items.join('');
    }, function (self, value) {
      var strLen = value.length;
      self.UINT_16(strLen).loop(value.split(''), self.CHAR);
    });
    this.defineType('STRING_32', function (value) {
      if (typeof value !== 'string') return false;
      var len = value.length;
      var uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '32';
    }, function (self) {
      self.UINT_32('length').loop('items', self.CHAR, self.context.length);
      return self.context.items.join('');
    }, function (self, value) {
      var strLen = value.length;
      self.UINT_32(strLen).loop(value.split(''), self.CHAR);
    });
    this.defineType('BOOLEAN', function (value) {
      return typeof value === 'boolean';
    }, function (self) {
      self.UINT_8('res');
      return self.context.res === 1;
    }, function (self, value) {
      self.UINT_8(value ? 1 : 0);
    });
    this.defineType('ARRAY_8', function (value) {
      if ((0, _typeof2["default"])(value) !== 'object') return false;
      if (!Array.isArray(value)) return false;
      var len = value.length;
      var uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '8';
    }, function (self) {
      self.UINT_8('size');
      if (self.context.size === 0) return [];
      self.loop('items', self.Value, self.context.size);
      return self.context.items;
    }, function (self, value) {
      var len = value.length;
      self.UINT_8(len).loop(value, self.Value);
    });
    this.defineType('ARRAY_16', function (value) {
      if ((0, _typeof2["default"])(value) !== 'object') return false;
      if (!Array.isArray(value)) return false;
      var len = value.length;
      var uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '16';
    }, function (self) {
      self.UINT_16('size');
      if (self.context.size === 0) return [];
      self.loop('items', self.Value, self.context.size);
      return self.context.items;
    }, function (self, value) {
      var len = value.length;
      self.UINT_16(len).loop(value, self.Value);
    });
    this.defineType('ARRAY_32', function (value) {
      if ((0, _typeof2["default"])(value) !== 'object') return false;
      if (!Array.isArray(value)) return false;
      var len = value.length;
      var uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '32';
    }, function (self) {
      self.UINT_32('size');
      if (self.context.size === 0) return [];
      self.loop('items', self.Value, self.context.size);
      return self.context.items;
    }, function (self, value) {
      var len = value.length;
      self.UINT_32(len).loop(value, self.Value);
    });
    this.defineType('OBJECT_8', function (value) {
      if ((0, _typeof2["default"])(value) !== 'object') return false;
      if (Array.isArray(value)) return false;
      if (!_sugar["default"].Object.isObject(value)) return false;

      var len = _sugar["default"].Object.keys(value).length;

      var uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '8';
    }, function (self) {
      self.UINT_8('size');
      if (self.context.size === 0) return {};
      self.loop('items', self.Pair, self.context.size);
      var res = {};
      self.context.items.forEach(function (item) {
        res[item.key] = item.value;
      });
      return res;
    }, function (self, value) {
      var len = _sugar["default"].Object.keys(value).length;

      var elems = _sugar["default"].Object.keys(value).map(function (el) {
        return {
          key: el,
          value: value[el]
        };
      });

      self.UINT_8(len).loop(elems, self.Pair);
    });
    this.defineType('OBJECT_16', function (value) {
      if ((0, _typeof2["default"])(value) !== 'object') return false;
      if (Array.isArray(value)) return false;
      if (!_sugar["default"].Object.isObject(value)) return false;

      var len = _sugar["default"].Object.keys(value).length;

      var uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '16';
    }, function (self) {
      self.UINT_16('size');
      if (self.context.size === 0) return {};
      self.loop('items', self.Pair, self.context.size);
      var res = {};
      self.context.items.forEach(function (item) {
        res[item.key] = item.value;
      });
      return res;
    }, function (self, value) {
      var len = _sugar["default"].Object.keys(value).length;

      var elems = _sugar["default"].Object.keys(value).map(function (el) {
        return {
          key: el,
          value: value[el]
        };
      });

      self.UINT_16(len).loop(elems, self.Pair);
    });
    this.defineType('OBJECT_32', function (value) {
      if ((0, _typeof2["default"])(value) !== 'object') return false;
      if (Array.isArray(value)) return false;
      if (!_sugar["default"].Object.isObject(value)) return false;

      var len = _sugar["default"].Object.keys(value).length;

      var uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '32';
    }, function (self) {
      self.UINT_32('size');
      if (self.context.size === 0) return {};
      self.loop('items', self.Pair, self.context.size);
      var res = {};
      self.context.items.forEach(function (item) {
        res[item.key] = item.value;
      });
      return res;
    }, function (self, value) {
      var len = _sugar["default"].Object.keys(value).length;

      var elems = _sugar["default"].Object.keys(value).map(function (el) {
        return {
          key: el,
          value: value[el]
        };
      });

      self.UINT_32(len).loop(elems, self.Pair);
    });
    this.defineType('BUFFER_8', function (value) {
      if (!(value instanceof Buffer)) return false;
      var len = value.length;
      var uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '8';
    }, function (self) {
      self.ARRAY_8('data');
      return Buffer.from(self.context.data);
    }, function (self, value) {
      self.ARRAY_8(value);
    });
    this.defineType('BUFFER_16', function (value) {
      if (!(value instanceof Buffer)) return false;
      var len = value.length;
      var uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '16';
    }, function (self) {
      self.ARRAY_16('data');
      return Buffer.from(self.context.data);
    }, function (self, value) {
      self.ARRAY_16(value);
    });
    this.defineType('BUFFER_32', function (value) {
      if (!(value instanceof Buffer)) return false;
      var len = value.length;
      var uint = Base.GetNumberSize(len).split('_')[1];
      return uint === '32';
    }, function (self) {
      self.ARRAY_32('data');
      return Buffer.from(self.context.data);
    }, function (self, value) {
      self.ARRAY_32(value);
    });
  }
  /**
   * @private
   * @param value {any}
   * @returns {number} index in types array
   */


  (0, _createClass2["default"])(Base, [{
    key: "getTypeOfValue",
    value: function getTypeOfValue(value) {
      for (var key in this.checkFunctions) {
        if (!this.checkFunctions.hasOwnProperty(key)) continue;
        var checkFunction = this.checkFunctions[key];
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

  }, {
    key: "defineType",
    value: function defineType(typeName, checkTypeFunction, readFunction, writeFunction) {
      if (this.types.indexOf(typeName) !== -1) throw new Error('Type is already defined');
      this.types.push(typeName);
      this.checkFunctions[typeName] = checkTypeFunction;
      this.protocol.define(typeName, {
        read: function read() {
          var types = this;
          return readFunction(types);
        },
        write: function write(value) {
          var types = this;
          return writeFunction(types, value);
        }
      });
    }
  }]);
  return Base;
}();

var _default = Base;
exports["default"] = _default;