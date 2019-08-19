"use strict";var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass")); // little class representing a chunk in the index
var Chunk = /*#__PURE__*/function () {
  /**
                                       * @param {VirtualOffset} minv
                                       * @param {VirtualOffset} maxv
                                       * @param {number} bin
                                       * @param {number} [fetchedSize]
                                       */
  function Chunk(minv, maxv, bin, fetchedSize) {(0, _classCallCheck2.default)(this, Chunk);
    this.minv = minv;
    this.maxv = maxv;

    this.bin = bin;
    this._fetchedSize = fetchedSize;
  }(0, _createClass2.default)(Chunk, [{ key: "toUniqueString", value: function toUniqueString()

    {
      return "".concat(this.minv, "..").concat(this.maxv, " (bin ").concat(
      this.bin, ", fetchedSize ").concat(
      this.fetchedSize(), ")");
    } }, { key: "toString", value: function toString()

    {
      return this.toUniqueString();
    } }, { key: "compareTo", value: function compareTo(

    b) {
      return (
        this.minv.compareTo(b.minv) ||
        this.maxv.compareTo(b.maxv) ||
        this.bin - b.bin);

    } }, { key: "fetchedSize", value: function fetchedSize()

    {
      if (this._fetchedSize !== undefined) return this._fetchedSize;
      return this.maxv.blockPosition + (1 << 16) - this.minv.blockPosition;
    } }]);return Chunk;}();


module.exports = Chunk;