"use strict";var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));var VirtualOffset = /*#__PURE__*/function () {
  function VirtualOffset(blockPosition, dataPosition) {(0, _classCallCheck2.default)(this, VirtualOffset);
    this.blockPosition = blockPosition; // < offset of the compressed data block
    this.dataPosition = dataPosition; // < offset into the uncompressed data
  }(0, _createClass2.default)(VirtualOffset, [{ key: "toString", value: function toString()
















    {
      return "".concat(this.blockPosition, ":").concat(this.dataPosition);
    } }, { key: "compareTo", value: function compareTo(

    b) {
      return (
        this.blockPosition - b.blockPosition || this.dataPosition - b.dataPosition);

    } }], [{ key: "fromBytes", value: function fromBytes(bytes) {var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;var bigendian = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;if (bigendian) throw new Error('big-endian virtual file offsets not implemented');return new VirtualOffset(bytes[offset + 7] * 0x10000000000 + bytes[offset + 6] * 0x100000000 + bytes[offset + 5] * 0x1000000 + bytes[offset + 4] * 0x10000 + bytes[offset + 3] * 0x100 + bytes[offset + 2], bytes[offset + 1] << 8 | bytes[offset]);} }, { key: "min", value: function min()

    {
      var min;
      var i = 0;
      for (; !min; i += 1) {min = i < 0 || arguments.length <= i ? undefined : arguments[i];}
      for (; i < arguments.length; i += 1) {
        if (min.compareTo(i < 0 || arguments.length <= i ? undefined : arguments[i]) > 0) min = i < 0 || arguments.length <= i ? undefined : arguments[i];
      }
      return min;
    } }]);return VirtualOffset;}();


module.exports = VirtualOffset;