"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _encoder = _interopRequireDefault(require("./encoder"));

var _decoder = _interopRequireDefault(require("./decoder"));

var encoder = new _encoder["default"]();
var decoder = new _decoder["default"]();
var testObject = {
  type: 'string',
  "package": {
    x: 1,
    y: [undefined, null]
  }
};
var encoded = encoder.encode(testObject);
console.log(encoded);
var decoded = decoder.decode(encoded);
console.log(decoded);
var _default = {
  encoder: encoder,
  decoder: decoder
};
exports["default"] = _default;