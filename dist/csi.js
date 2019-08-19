"use strict";var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");var _assign = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/assign"));var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/asyncToGenerator"));var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));var Long = require('long');var _require =

require('./unzip'),unzip = _require.unzip;

var VirtualOffset = require('./virtualOffset');
var Chunk = require('./chunk');var _require2 =

require('./util'),longToNumber = _require2.longToNumber,checkAbortSignal = _require2.checkAbortSignal,canMergeBlocks = _require2.canMergeBlocks;

var CSI1_MAGIC = 21582659; // CSI\1
var CSI2_MAGIC = 38359875; // CSI\2

function lshift(num, bits) {
  return num * Math.pow(2, bits);
}
function rshift(num, bits) {
  return Math.floor(num / Math.pow(2, bits));
}

/**
   * calculate the list of bins that may overlap with region [beg,end) (zero-based half-open)
   * @returns {Array[number]}
   */
function reg2bins(beg, end, minShift, depth, binLimit) {
  beg -= 1; // < convert to 1-based closed
  if (beg < 1) beg = 1;
  if (end > Math.pow(2, 50)) end = Math.pow(2, 34); // 17 GiB ought to be enough for anybody
  end -= 1;
  var l = 0;
  var t = 0;
  var s = minShift + depth * 3;
  var bins = [];
  for (; l <= depth; s -= 3, t += lshift(1, l * 3), l += 1) {
    var b = t + rshift(beg, s);
    var e = t + rshift(end, s);
    if (e - b + bins.length > binLimit)
    throw new Error("query ".concat(
    beg, "-").concat(end, " is too large for current binning scheme (shift ").concat(minShift, ", depth ").concat(depth, "), try a smaller query or a coarser index binning scheme"));

    for (var i = b; i <= e; i += 1) {bins.push(i);}
  }
  return bins;
}var

CSI = /*#__PURE__*/function () {
  /**
                                 * @param {filehandle} filehandle
                                 * @param {function} [renameRefSeqs]
                                 */
  function CSI(_ref) {var filehandle = _ref.filehandle,_ref$renameRefSeqs = _ref.renameRefSeqs,renameRefSeqs = _ref$renameRefSeqs === void 0 ? function (n) {return n;} : _ref$renameRefSeqs;(0, _classCallCheck2.default)(this, CSI);
    this.filehandle = filehandle;
    this.renameRefSeq = renameRefSeqs;
  }(0, _createClass2.default)(CSI, [{ key: "_findFirstData", value: function _findFirstData(

    data, virtualOffset) {
      var currentFdl = data.firstDataLine;
      if (currentFdl) {
        data.firstDataLine =
        currentFdl.compareTo(virtualOffset) > 0 ? virtualOffset : currentFdl;
      } else {
        data.firstDataLine = virtualOffset;
      }
    } }, { key: "lineCount", value: function () {var _lineCount = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(

      refName, opts) {var indexData, refId, idx, stats;return _regenerator.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (
                  this.parse(opts));case 2:indexData = _context.sent;if (
                indexData) {_context.next = 5;break;}return _context.abrupt("return", -1);case 5:
                refId = indexData.refNameToId[refName];
                idx = indexData.indices[refId];if (
                idx) {_context.next = 9;break;}return _context.abrupt("return", -1);case 9:
                stats = indexData.indices[refId].stats;if (!
                stats) {_context.next = 12;break;}return _context.abrupt("return", stats.lineCount);case 12:return _context.abrupt("return",
                -1);case 13:case "end":return _context.stop();}}}, _callee, this);}));function lineCount(_x, _x2) {return _lineCount.apply(this, arguments);}return lineCount;}()


    /**
                                                                                                                                                                                   * @returns {Promise} for an object like
                                                                                                                                                                                   * `{ columnNumbers, metaChar, skipLines, refIdToName, refNameToId, coordinateType, format }`
                                                                                                                                                                                   */ }, { key: "getMetadata", value: function () {var _getMetadata = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(
      opts) {var _ref2, columnNumbers, metaChar, format, coordinateType, skipLines, refIdToName, refNameToId, firstDataLine, maxBlockSize, maxBinNumber, maxRefLength;return _regenerator.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return (












                  this.parse(opts));case 2:_ref2 = _context2.sent;columnNumbers = _ref2.columnNumbers;metaChar = _ref2.metaChar;format = _ref2.format;coordinateType = _ref2.coordinateType;skipLines = _ref2.skipLines;refIdToName = _ref2.refIdToName;refNameToId = _ref2.refNameToId;firstDataLine = _ref2.firstDataLine;maxBlockSize = _ref2.maxBlockSize;maxBinNumber = _ref2.maxBinNumber;maxRefLength = _ref2.maxRefLength;return _context2.abrupt("return",
                {
                  columnNumbers: columnNumbers,
                  metaChar: metaChar,
                  format: format,
                  coordinateType: coordinateType,
                  skipLines: skipLines,
                  refIdToName: refIdToName,
                  refNameToId: refNameToId,
                  firstDataLine: firstDataLine,
                  maxBlockSize: maxBlockSize,
                  maxBinNumber: maxBinNumber,
                  maxRefLength: maxRefLength });case 15:case "end":return _context2.stop();}}}, _callee2, this);}));function getMetadata(_x3) {return _getMetadata.apply(this, arguments);}return getMetadata;}() }, { key: "parseAuxData", value: function parseAuxData(



    bytes, offset, auxLength) {
      if (auxLength < 30) return {};

      var data = {};
      data.formatFlags = bytes.readInt32LE(offset);
      data.coordinateType =
      data.formatFlags & 0x10000 ? 'zero-based-half-open' : '1-based-closed';
      data.format = { 0: 'generic', 1: 'SAM', 2: 'VCF' }[data.formatFlags & 0xf];
      if (!data.format)
      throw new Error("invalid Tabix preset format flags ".concat(data.formatFlags));
      data.columnNumbers = {
        ref: bytes.readInt32LE(offset + 4),
        start: bytes.readInt32LE(offset + 8),
        end: bytes.readInt32LE(offset + 12) };

      data.metaValue = bytes.readInt32LE(offset + 16);
      data.metaChar = data.metaValue ? String.fromCharCode(data.metaValue) : '';
      data.skipLines = bytes.readInt32LE(offset + 20);
      var nameSectionLength = bytes.readInt32LE(offset + 24);

      (0, _assign.default)(
      data,
      this._parseNameBytes(
      bytes.slice(offset + 28, offset + 28 + nameSectionLength)));


      return data;
    } }, { key: "_parseNameBytes", value: function _parseNameBytes(

    namesBytes) {
      var currRefId = 0;
      var currNameStart = 0;
      var refIdToName = [];
      var refNameToId = {};
      for (var i = 0; i < namesBytes.length; i += 1) {
        if (!namesBytes[i]) {
          if (currNameStart < i) {
            var refName = namesBytes.toString('utf8', currNameStart, i);
            refName = this.renameRefSeq(refName);
            refIdToName[currRefId] = refName;
            refNameToId[refName] = currRefId;
          }
          currNameStart = i + 1;
          currRefId += 1;
        }
      }
      return { refNameToId: refNameToId, refIdToName: refIdToName };
    }

    // memoize
    // fetch and parse the index
  }, { key: "parse", value: function () {var _parse = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3(opts) {var signal, data, bytes, auxLength, currOffset, i, binCount, binIndex, stats, j, bin, loffset, chunkCount, chunks, k, u, v;return _regenerator.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:
                signal = opts && opts.signal;
                data = { csi: true, maxBlockSize: 1 << 16 };_context3.t0 =
                unzip;_context3.next = 5;return this.filehandle.readFile({ signal: signal });case 5:_context3.t1 = _context3.sent;_context3.next = 8;return (0, _context3.t0)(_context3.t1);case 8:bytes = _context3.sent;
                checkAbortSignal(signal);
                // check TBI magic numbers
                if (!(bytes.readUInt32LE(0) === CSI1_MAGIC)) {_context3.next = 14;break;}
                data.csiVersion = 1;_context3.next = 19;break;case 14:if (!(
                bytes.readUInt32LE(0) === CSI2_MAGIC)) {_context3.next = 18;break;}
                data.csiVersion = 2;_context3.next = 19;break;case 18:throw (

                  new Error('Not a CSI file'));case 19:



                data.minShift = bytes.readInt32LE(4);
                data.depth = bytes.readInt32LE(8);
                data.maxBinNumber = ((1 << (data.depth + 1) * 3) - 1) / 7;
                data.maxRefLength = Math.pow(2, data.minShift + data.depth * 3);

                auxLength = bytes.readInt32LE(12);
                if (auxLength) {
                  (0, _assign.default)(data, this.parseAuxData(bytes, 16, auxLength));
                }
                data.refCount = bytes.readInt32LE(16 + auxLength);

                // read the indexes for each reference sequence
                data.indices = new Array(data.refCount);
                currOffset = 16 + auxLength + 4;
                for (i = 0; i < data.refCount; i += 1) {
                  // the binning index
                  binCount = bytes.readInt32LE(currOffset);
                  currOffset += 4;
                  binIndex = {};
                  stats = void 0; // < provided by parsing a pseudo-bin, if present
                  for (j = 0; j < binCount; j += 1) {
                    bin = bytes.readUInt32LE(currOffset);
                    if (bin > data.maxBinNumber) {
                      // this is a fake bin that actually has stats information
                      // about the reference sequence in it
                      stats = this.parsePseudoBin(bytes, currOffset + 4);
                      currOffset += 4 + 8 + 4 + 16 + 16;
                    } else {
                      loffset = VirtualOffset.fromBytes(bytes, currOffset + 4);
                      this._findFirstData(data, loffset);
                      chunkCount = bytes.readInt32LE(currOffset + 12);
                      currOffset += 16;
                      chunks = new Array(chunkCount);
                      for (k = 0; k < chunkCount; k += 1) {
                        u = VirtualOffset.fromBytes(bytes, currOffset);
                        v = VirtualOffset.fromBytes(bytes, currOffset + 8);
                        currOffset += 16;
                        // this._findFirstData(data, u)
                        chunks[k] = new Chunk(u, v, bin);
                      }
                      binIndex[bin] = chunks;
                    }
                  }

                  data.indices[i] = { binIndex: binIndex, stats: stats };
                }return _context3.abrupt("return",

                data);case 30:case "end":return _context3.stop();}}}, _callee3, this);}));function parse(_x4) {return _parse.apply(this, arguments);}return parse;}() }, { key: "parsePseudoBin", value: function parsePseudoBin(


    bytes, offset) {
      // const one = Long.fromBytesLE(bytes.slice(offset + 4, offset + 12), true)
      // const two = Long.fromBytesLE(bytes.slice(offset + 12, offset + 20), true)
      // const three = longToNumber(
      //   Long.fromBytesLE(bytes.slice(offset + 20, offset + 28), true),
      // )
      var lineCount = longToNumber(
      Long.fromBytesLE(bytes.slice(offset + 28, offset + 36), true));

      return { lineCount: lineCount };
    } }, { key: "blocksForRange", value: function () {var _blocksForRange = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4(

      refName, beg, end, opts) {var indexData, refId, indexes, binIndex, bins, l, numOffsets, i, off, _i, chunks, j, _i2, _i3, _i4;return _regenerator.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:
                if (beg < 0) beg = 0;_context4.next = 3;return (

                  this.parse(opts));case 3:indexData = _context4.sent;if (
                indexData) {_context4.next = 6;break;}return _context4.abrupt("return", []);case 6:
                refId = indexData.refNameToId[refName];
                indexes = indexData.indices[refId];if (
                indexes) {_context4.next = 10;break;}return _context4.abrupt("return", []);case 10:

                binIndex = indexes.binIndex;

                bins = reg2bins(
                beg,
                end,
                indexData.minShift,
                indexData.depth,
                indexData.maxBinNumber);



                numOffsets = 0;
                for (i = 0; i < bins.length; i += 1) {
                  if (binIndex[bins[i]]) numOffsets += binIndex[bins[i]].length;
                }if (!(

                numOffsets === 0)) {_context4.next = 16;break;}return _context4.abrupt("return", []);case 16:

                off = [];
                numOffsets = 0;
                for (_i = 0; _i < bins.length; _i += 1) {
                  chunks = binIndex[bins[_i]];
                  if (chunks)
                  for (j = 0; j < chunks.length; j += 1) {
                    off[numOffsets] = new Chunk(
                    chunks[j].minv,
                    chunks[j].maxv,
                    chunks[j].bin);

                    numOffsets += 1;
                  }
                }if (

                off.length) {_context4.next = 21;break;}return _context4.abrupt("return", []);case 21:

                off = off.sort(function (a, b) {return a.compareTo(b);});

                // resolve completely contained adjacent blocks
                l = 0;
                for (_i2 = 1; _i2 < numOffsets; _i2 += 1) {
                  if (off[l].maxv.compareTo(off[_i2].maxv) < 0) {
                    l += 1;
                    off[l].minv = off[_i2].minv;
                    off[l].maxv = off[_i2].maxv;
                  }
                }
                numOffsets = l + 1;

                // resolve overlaps between adjacent blocks; this may happen due to the merge in indexing
                for (_i3 = 1; _i3 < numOffsets; _i3 += 1) {
                  if (off[_i3 - 1].maxv.compareTo(off[_i3].minv) >= 0)
                  off[_i3 - 1].maxv = off[_i3].minv;}
                // merge adjacent blocks
                l = 0;
                for (_i4 = 1; _i4 < numOffsets; _i4 += 1) {
                  if (canMergeBlocks(off[l], off[_i4])) off[l].maxv = off[_i4].maxv;else
                  {
                    l += 1;
                    off[l].minv = off[_i4].minv;
                    off[l].maxv = off[_i4].maxv;
                  }
                }
                numOffsets = l + 1;return _context4.abrupt("return",

                off.slice(0, numOffsets));case 30:case "end":return _context4.stop();}}}, _callee4, this);}));function blocksForRange(_x5, _x6, _x7, _x8) {return _blocksForRange.apply(this, arguments);}return blocksForRange;}() }]);return CSI;}();



// this is the stupidest possible memoization, ignores arguments.
function tinyMemoize(_class, methodName) {
  var method = _class.prototype[methodName];
  if (!method)
  throw new Error("no method ".concat(methodName, " found in class ").concat(_class.name));
  var memoAttrName = "_memo_".concat(methodName);
  _class.prototype[methodName] = function _tinyMemoized() {
    if (!(memoAttrName in this)) this[memoAttrName] = method.call(this);
    return this[memoAttrName];
  };
}
// memoize index.parse()
tinyMemoize(CSI, 'parse');

module.exports = CSI;