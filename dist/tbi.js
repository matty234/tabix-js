"use strict";var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");var _assign = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/assign"));var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/asyncToGenerator"));var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));var Long = require('long');
// const { Parser } = require('binary-parser')
var VirtualOffset = require('./virtualOffset');
var Chunk = require('./chunk');var _require =

require('./unzip'),unzip = _require.unzip;

var TBI_MAGIC = 21578324; // TBI\1
var TAD_LIDX_SHIFT = 14;var _require2 =

require('./util'),longToNumber = _require2.longToNumber,checkAbortSignal = _require2.checkAbortSignal,canMergeBlocks = _require2.canMergeBlocks;

/**
                                                                                                                                                  * calculate the list of bins that may overlap with region [beg,end) (zero-based half-open)
                                                                                                                                                  * @returns {Array[number]}
                                                                                                                                                  */
function reg2bins(beg, end) {
  beg += 1; // < convert to 1-based closed
  end -= 1;
  var list = [0];
  for (var k = 1 + (beg >> 26); k <= 1 + (end >> 26); k += 1) {list.push(k);}
  for (var _k = 9 + (beg >> 23); _k <= 9 + (end >> 23); _k += 1) {list.push(_k);}
  for (var _k2 = 73 + (beg >> 20); _k2 <= 73 + (end >> 20); _k2 += 1) {list.push(_k2);}
  for (var _k3 = 585 + (beg >> 17); _k3 <= 585 + (end >> 17); _k3 += 1) {list.push(_k3);}
  for (var _k4 = 4681 + (beg >> 14); _k4 <= 4681 + (end >> 14); _k4 += 1) {list.push(_k4);}
  return list;
}var

TabixIndex = /*#__PURE__*/function () {
  /**
                                        * @param {filehandle} filehandle
                                        * @param {function} [renameRefSeqs]
                                        */
  function TabixIndex(_ref) {var filehandle = _ref.filehandle,_ref$renameRefSeqs = _ref.renameRefSeqs,renameRefSeqs = _ref$renameRefSeqs === void 0 ? function (n) {return n;} : _ref$renameRefSeqs;(0, _classCallCheck2.default)(this, TabixIndex);
    this.filehandle = filehandle;
    this.renameRefSeq = renameRefSeqs;
  }(0, _createClass2.default)(TabixIndex, [{ key: "lineCount", value: function () {var _lineCount = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(

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
                  maxRefLength: maxRefLength });case 15:case "end":return _context2.stop();}}}, _callee2, this);}));function getMetadata(_x3) {return _getMetadata.apply(this, arguments);}return getMetadata;}()



    // memoize
    // fetch and parse the index
  }, { key: "parse", value: function () {var _parse = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3(opts) {var signal, data, bytes, nameSectionLength, names, currOffset, i, binCount, binIndex, stats, j, bin, chunkCount, _chunkCount, chunks, k, u, v, linearCount, linearIndex, _k5;return _regenerator.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:
                signal = opts && opts.signal;
                data = { depth: 5, maxBlockSize: 1 << 16 };_context3.t0 =
                unzip;_context3.next = 5;return this.filehandle.readFile({ signal: signal });case 5:_context3.t1 = _context3.sent;_context3.next = 8;return (0, _context3.t0)(_context3.t1);case 8:bytes = _context3.sent;
                checkAbortSignal(opts);

                // check TBI magic numbers
                if (!(bytes.readUInt32LE(0) !== TBI_MAGIC /* "TBI\1" */)) {_context3.next = 12;break;}throw (
                  new Error('Not a TBI file'));case 12:



                // number of reference sequences in the index
                data.refCount = bytes.readInt32LE(4);
                data.formatFlags = bytes.readInt32LE(8);
                data.coordinateType =
                data.formatFlags & 0x10000 ? 'zero-based-half-open' : '1-based-closed';
                data.format = { 0: 'generic', 1: 'SAM', 2: 'VCF' }[data.formatFlags & 0xf];if (
                data.format) {_context3.next = 18;break;}throw (
                  new Error("invalid Tabix preset format flags ".concat(data.formatFlags)));case 18:
                data.columnNumbers = {
                  ref: bytes.readInt32LE(12),
                  start: bytes.readInt32LE(16),
                  end: bytes.readInt32LE(20) };

                data.metaValue = bytes.readInt32LE(24);
                data.depth = 5;
                data.maxBinNumber = ((1 << (data.depth + 1) * 3) - 1) / 7;
                data.maxRefLength = Math.pow(2, 14 + data.depth * 3);
                data.metaChar = data.metaValue ? String.fromCharCode(data.metaValue) : null;
                data.skipLines = bytes.readInt32LE(28);

                // read sequence dictionary
                nameSectionLength = bytes.readInt32LE(32);
                names = this._parseNameBytes(bytes.slice(36, 36 + nameSectionLength));
                (0, _assign.default)(data, names);

                // read the indexes for each reference sequence
                data.indices = new Array(data.refCount);
                currOffset = 36 + nameSectionLength;
                i = 0;case 31:if (!(i < data.refCount)) {_context3.next = 56;break;}
                // the binning index
                binCount = bytes.readInt32LE(currOffset);
                currOffset += 4;
                binIndex = {};
                stats = void 0;
                j = 0;case 37:if (!(j < binCount)) {_context3.next = 48;break;}
                bin = bytes.readUInt32LE(currOffset);
                currOffset += 4;if (!(
                bin > data.maxBinNumber + 1)) {_context3.next = 44;break;}throw (
                  new Error(
                  'tabix index contains too many bins, please use a CSI index'));case 44:

                if (bin === data.maxBinNumber + 1) {
                  chunkCount = bytes.readInt32LE(currOffset);
                  currOffset += 4;
                  if (chunkCount === 2) {
                    stats = this.parsePseudoBin(bytes, currOffset);
                  }
                  currOffset += 16 * chunkCount;
                } else {
                  _chunkCount = bytes.readInt32LE(currOffset);
                  currOffset += 4;
                  chunks = new Array(_chunkCount);
                  for (k = 0; k < _chunkCount; k += 1) {
                    u = VirtualOffset.fromBytes(bytes, currOffset);
                    v = VirtualOffset.fromBytes(bytes, currOffset + 8);
                    currOffset += 16;
                    data.firstDataLine = VirtualOffset.min(data.firstDataLine, u);
                    chunks[k] = new Chunk(u, v, bin);
                  }
                  binIndex[bin] = chunks;
                }case 45:j += 1;_context3.next = 37;break;case 48:


                // the linear index
                linearCount = bytes.readInt32LE(currOffset);
                currOffset += 4;
                linearIndex = new Array(linearCount);
                for (_k5 = 0; _k5 < linearCount; _k5 += 1) {
                  linearIndex[_k5] = VirtualOffset.fromBytes(bytes, currOffset);
                  currOffset += 8;
                  data.firstDataLine = VirtualOffset.min(
                  data.firstDataLine,
                  linearIndex[_k5]);

                }

                data.indices[i] = { binIndex: binIndex, linearIndex: linearIndex, stats: stats };case 53:i += 1;_context3.next = 31;break;case 56:return _context3.abrupt("return",


                data);case 57:case "end":return _context3.stop();}}}, _callee3, this);}));function parse(_x4) {return _parse.apply(this, arguments);}return parse;}() }, { key: "parsePseudoBin", value: function parsePseudoBin(


    bytes, offset) {
      // const one = Long.fromBytesLE(bytes.slice(offset + 4, offset + 12), true)
      // const two = Long.fromBytesLE(bytes.slice(offset + 12, offset + 20), true)
      var lineCount = longToNumber(
      Long.fromBytesLE(bytes.slice(offset + 16, offset + 24), true));

      // const four = Long.fromBytesLE(bytes.slice(offset + 28, offset + 36), true)
      return { lineCount: lineCount };
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
    } }, { key: "blocksForRange", value: function () {var _blocksForRange = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4(

      refName, beg, end, opts) {var indexData, refId, indexes, linearIndex, binIndex, bins, minOffset, l, numOffsets, i, off, _i, chunks, j, _i2, _i3, _i4;return _regenerator.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:
                if (beg < 0) beg = 0;_context4.next = 3;return (

                  this.parse(opts));case 3:indexData = _context4.sent;if (
                indexData) {_context4.next = 6;break;}return _context4.abrupt("return", []);case 6:
                refId = indexData.refNameToId[refName];
                indexes = indexData.indices[refId];if (
                indexes) {_context4.next = 10;break;}return _context4.abrupt("return", []);case 10:

                linearIndex = indexes.linearIndex, binIndex = indexes.binIndex;

                bins = reg2bins(beg, end);

                minOffset = linearIndex.length ?
                linearIndex[
                beg >> TAD_LIDX_SHIFT >= linearIndex.length ?
                linearIndex.length - 1 :
                beg >> TAD_LIDX_SHIFT] :

                new VirtualOffset(0, 0);if (
                minOffset) {_context4.next = 16;break;}
                console.warn('querying outside of possible tabix range');return _context4.abrupt("return",
                []);case 16:



                numOffsets = 0;
                for (i = 0; i < bins.length; i += 1) {
                  if (binIndex[bins[i]]) numOffsets += binIndex[bins[i]].length;
                }if (!(

                numOffsets === 0)) {_context4.next = 20;break;}return _context4.abrupt("return", []);case 20:

                off = [];
                numOffsets = 0;
                for (_i = 0; _i < bins.length; _i += 1) {
                  chunks = binIndex[bins[_i]];
                  if (chunks)
                  for (j = 0; j < chunks.length; j += 1) {
                    if (minOffset.compareTo(chunks[j].maxv) < 0) {
                      off[numOffsets] = new Chunk(
                      chunks[j].minv,
                      chunks[j].maxv,
                      chunks[j].bin);

                      numOffsets += 1;
                    }}
                }if (

                off.length) {_context4.next = 25;break;}return _context4.abrupt("return", []);case 25:

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

                off.slice(0, numOffsets));case 34:case "end":return _context4.stop();}}}, _callee4, this);}));function blocksForRange(_x5, _x6, _x7, _x8) {return _blocksForRange.apply(this, arguments);}return blocksForRange;}() }]);return TabixIndex;}();



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
tinyMemoize(TabixIndex, 'parse');

module.exports = TabixIndex;