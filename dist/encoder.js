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

var Encoder =
/*#__PURE__*/
function (_Base) {
  (0, _inherits2["default"])(Encoder, _Base);

  function Encoder() {
    (0, _classCallCheck2["default"])(this, Encoder);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Encoder).apply(this, arguments));
  }

  (0, _createClass2["default"])(Encoder, [{
    key: "encode",
    value: function encode(data) {
      var proto = this.protocol.write();
      proto = proto.Value(data);
      return proto.result;
    }
  }]);
  return Encoder;
}(_base["default"]);

var _default = Encoder;
exports["default"] = _default;