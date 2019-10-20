"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _base = _interopRequireDefault(require("./base"));

var Decoder =
/*#__PURE__*/
function (_Base) {
  (0, _inherits2["default"])(Decoder, _Base);

  function Decoder() {
    (0, _classCallCheck2["default"])(this, Decoder);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Decoder).apply(this, arguments));
  }

  (0, _createClass2["default"])(Decoder, [{
    key: "decode",
    value: function decode(buffer) {
      var proto = this.protocol.read(buffer);
      proto = proto.Value('res');
      var result = proto.result;
      return result.res;
    }
  }]);
  return Decoder;
}(_base["default"]);

var _default = Decoder;
exports["default"] = _default;