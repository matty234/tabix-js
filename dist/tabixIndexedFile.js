"use strict";var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/parse-int"));var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/asyncToGenerator"));var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));var _abortablePromiseCache = _interopRequireDefault(require("abortable-promise-cache"));

var LRU = require('quick-lru');var _require =
require('generic-filehandle'),LocalFile = _require.LocalFile;var _require2 =
require('./unzip'),unzip = _require2.unzip,unzipChunk = _require2.unzipChunk;var _require3 =
require('./util'),checkAbortSignal = _require3.checkAbortSignal;

var TBI = require('./tbi');
var CSI = require('./csi');

function timeout(time) {
  return new _promise.default(function (resolve) {
    setTimeout(resolve, time);
  });
}var

TabixIndexedFile = /*#__PURE__*/function () {
  /**
                                              * @param {object} args
                                              * @param {string} [args.path]
                                              * @param {filehandle} [args.filehandle]
                                              * @param {string} [args.tbiPath]
                                              * @param {filehandle} [args.tbiFilehandle]
                                              * @param {string} [args.csiPath]
                                              * @param {filehandle} [args.csiFilehandle]
                                              * @param {number} [args.chunkSizeLimit] maximum number of bytes to fetch in a single `getLines` call.
                                              * default 2MiB
                                              * @param {number} [args.yieldLimit] maximum number of lines to parse without yielding.
                                              * this avoids having a large read prevent any other work getting done on the thread.  default 300 lines.
                                              * @param {function} [args.renameRefSeqs] optional function with sig `string => string` to transform
                                              * reference sequence names for the purpose of indexing and querying. note that the data that is returned is
                                              * not altered, just the names of the reference sequences that are used for querying.
                                              * @param {number} [args.chunkCacheSize] maximum size in bytes of the chunk cache. default 5MB
                                              * @param {number} [args.blockCacheSize] maximum size in bytes of the block cache. default 5MB
                                              */
  function TabixIndexedFile(_ref)










  {var path = _ref.path,filehandle = _ref.filehandle,tbiPath = _ref.tbiPath,tbiFilehandle = _ref.tbiFilehandle,csiPath = _ref.csiPath,csiFilehandle = _ref.csiFilehandle,_ref$chunkSizeLimit = _ref.chunkSizeLimit,chunkSizeLimit = _ref$chunkSizeLimit === void 0 ? 2000000 : _ref$chunkSizeLimit,_ref$yieldLimit = _ref.yieldLimit,yieldLimit = _ref$yieldLimit === void 0 ? 300 : _ref$yieldLimit,_ref$renameRefSeqs = _ref.renameRefSeqs,renameRefSeqs = _ref$renameRefSeqs === void 0 ? function (n) {return n;} : _ref$renameRefSeqs,_ref$chunkCacheSize = _ref.chunkCacheSize,chunkCacheSize = _ref$chunkCacheSize === void 0 ? 5 * Math.pow(2, 20) : _ref$chunkCacheSize;(0, _classCallCheck2.default)(this, TabixIndexedFile);
    if (filehandle) this.filehandle = filehandle;else
    if (path) this.filehandle = new LocalFile(path);else
    throw new TypeError('must provide either filehandle or path');

    if (tbiFilehandle)
    this.index = new TBI({ filehandle: tbiFilehandle, renameRefSeqs: renameRefSeqs });else
    if (csiFilehandle)
    this.index = new CSI({ filehandle: csiFilehandle, renameRefSeqs: renameRefSeqs });else
    if (tbiPath)
    this.index = new TBI({
      filehandle: new LocalFile(tbiPath),
      renameRefSeqs: renameRefSeqs });else

    if (csiPath)
    this.index = new CSI({
      filehandle: new LocalFile(csiPath),
      renameRefSeqs: renameRefSeqs });else

    if (path) {
      this.index = new TBI({ filehandle: new LocalFile("".concat(path, ".tbi")) });
    } else {
      throw new TypeError(
      'must provide one of tbiFilehandle, tbiPath, csiFilehandle, or csiPath');

    }

    this.chunkSizeLimit = chunkSizeLimit;
    this.yieldLimit = yieldLimit;
    this.renameRefSeqCallback = renameRefSeqs;
    var readChunk = this.readChunk.bind(this);
    this.chunkCache = new _abortablePromiseCache.default({
      cache: new LRU({
        maxSize: Math.floor(chunkCacheSize / (1 << 16)) }),


      fill: function () {var _fill = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(requestData, abortSignal) {return _regenerator.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:return _context.abrupt("return",
                  readChunk(requestData, { signal: abortSignal }));case 1:case "end":return _context.stop();}}}, _callee);}));function fill(_x, _x2) {return _fill.apply(this, arguments);}return fill;}() });


  }

  /**
     * @param {string} refName name of the reference sequence
     * @param {number} start start of the region (in 0-based half-open coordinates)
     * @param {number} end end of the region (in 0-based half-open coordinates)
     * @param {function|object} lineCallback callback called for each line in the region, called as (line, fileOffset) or object containing obj.lineCallback, obj.signal, etc
     * @returns {Promise} resolved when the whole read is finished, rejected on error
     */(0, _createClass2.default)(TabixIndexedFile, [{ key: "getLines", value: function () {var _getLines = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(
      refName, start, end, opts) {var signal, lineCallback, metadata, chunks, i, size, linesSinceLastYield, chunkNum, previousStartCoordinate, c, lines, currentLineStart, _i, line, fileOffset, _this$checkLine, startCoordinate, overlaps;return _regenerator.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:

                lineCallback = opts;if (!(
                refName === undefined)) {_context2.next = 3;break;}throw (
                  new TypeError('must provide a reference sequence name'));case 3:if (

                lineCallback) {_context2.next = 5;break;}throw (
                  new TypeError('line callback must be provided'));case 5:

                if (typeof opts !== 'function') {
                  lineCallback = opts.lineCallback;
                  signal = opts.signal;
                }_context2.next = 8;return (
                  this.index.getMetadata({ signal: signal }));case 8:metadata = _context2.sent;
                checkAbortSignal(signal);
                if (!start) start = 0;
                if (!end) end = metadata.maxRefLength;if (
                start <= end) {_context2.next = 14;break;}throw (
                  new TypeError(
                  'invalid start and end coordinates. start must be less than or equal to end'));case 14:if (!(

                start === end)) {_context2.next = 16;break;}return _context2.abrupt("return");case 16:_context2.next = 18;return (

                  this.index.blocksForRange(refName, start, end, {
                    signal: signal }));case 18:chunks = _context2.sent;

                checkAbortSignal(signal);

                // check the chunks for any that are over the size limit.  if
                // any are, don't fetch any of them
                i = 0;case 21:if (!(i < chunks.length)) {_context2.next = 28;break;}
                size = chunks[i].fetchedSize();if (!(
                size > this.chunkSizeLimit)) {_context2.next = 25;break;}throw (
                  new Error("Too much data. Chunk size ".concat(
                  size.toLocaleString(), " bytes exceeds chunkSizeLimit of ").concat(this.chunkSizeLimit.toLocaleString(), ".")));case 25:i += 1;_context2.next = 21;break;case 28:




                // now go through each chunk and parse and filter the lines out of it
                linesSinceLastYield = 0;
                chunkNum = 0;case 30:if (!(chunkNum < chunks.length)) {_context2.next = 65;break;}
                previousStartCoordinate = void 0;
                c = chunks[chunkNum];_context2.next = 35;return (
                  this.chunkCache.get(c.toString(), c, signal));case 35:lines = _context2.sent;
                checkAbortSignal(signal);

                currentLineStart = chunks[chunkNum].minv.dataPosition;
                _i = 0;case 39:if (!(_i < lines.length)) {_context2.next = 62;break;}
                line = lines[_i];
                fileOffset =
                chunks[chunkNum].minv.blockPosition * Math.pow(2, 16) + currentLineStart;
                // filter the line for whether it is within the requested range
                _this$checkLine = this.checkLine(
                metadata,
                refName,
                start,
                end,
                line), startCoordinate = _this$checkLine.startCoordinate, overlaps = _this$checkLine.overlaps;


                // do a small check just to make sure that the lines are really sorted by start coordinate
                if (!(previousStartCoordinate > startCoordinate)) {_context2.next = 45;break;}throw (
                  new Error("Lines not sorted by start coordinate (".concat(
                  previousStartCoordinate, " > ").concat(startCoordinate, "), this file is not usable with Tabix.")));case 45:

                previousStartCoordinate = startCoordinate;if (!

                overlaps) {_context2.next = 50;break;}
                lineCallback(line.trim(), fileOffset);_context2.next = 52;break;case 50:if (!(
                startCoordinate >= end)) {_context2.next = 52;break;}return _context2.abrupt("return");case 52:






                currentLineStart += line.length + 1;

                // yield if we have emitted beyond the yield limit
                linesSinceLastYield += 1;if (!(
                linesSinceLastYield >= this.yieldLimit)) {_context2.next = 59;break;}_context2.next = 57;return (
                  timeout(1));case 57:
                checkAbortSignal(signal);
                linesSinceLastYield = 0;case 59:_i += 1;_context2.next = 39;break;case 62:chunkNum += 1;_context2.next = 30;break;case 65:case "end":return _context2.stop();}}}, _callee2, this);}));function getLines(_x3, _x4, _x5, _x6) {return _getLines.apply(this, arguments);}return getLines;}() }, { key: "getMetadata", value: function () {var _getMetadata = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3(





      opts) {return _regenerator.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:return _context3.abrupt("return",
                this.index.getMetadata(opts));case 1:case "end":return _context3.stop();}}}, _callee3, this);}));function getMetadata(_x7) {return _getMetadata.apply(this, arguments);}return getMetadata;}()


    /**
                                                                                                                                                                                                                * get a buffer containing the "header" region of
                                                                                                                                                                                                                * the file, which are the bytes up to the first
                                                                                                                                                                                                                * non-meta line
                                                                                                                                                                                                                *
                                                                                                                                                                                                                * @returns {Promise} for a buffer
                                                                                                                                                                                                                */ }, { key: "getHeaderBuffer", value: function () {var _getHeaderBuffer = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4(
      opts) {var _ref2, firstDataLine, metaChar, maxBlockSize, maxFetch, bytes, lastNewline, newlineByte, metaByte, i;return _regenerator.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return (
                  this.getMetadata(
                  opts));case 2:_ref2 = _context4.sent;firstDataLine = _ref2.firstDataLine;metaChar = _ref2.metaChar;maxBlockSize = _ref2.maxBlockSize;

                checkAbortSignal(opts.signal);
                maxFetch =
                firstDataLine && firstDataLine.blockPosition ?
                firstDataLine.blockPosition + maxBlockSize :
                maxBlockSize;
                // TODO: what if we don't have a firstDataLine, and the header
                // actually takes up more than one block? this case is not covered here
                _context4.next = 10;return (
                  this._readRegion(0, maxFetch, opts));case 10:bytes = _context4.sent;
                checkAbortSignal(opts.signal);_context4.prev = 12;

                bytes = unzip(bytes);_context4.next = 20;break;case 16:_context4.prev = 16;_context4.t0 = _context4["catch"](12);

                console.log(_context4.t0);throw (
                  new Error("error decompressing block ".concat(
                  _context4.t0.code, " at 0 (length ").concat(maxFetch, ")"), _context4.t0));case 20:if (!





                metaChar) {_context4.next = 33;break;}
                // trim backward from the end
                lastNewline = -1;
                newlineByte = '\n'.charCodeAt(0);
                metaByte = metaChar.charCodeAt(0);
                i = 0;case 25:if (!(i < bytes.length)) {_context4.next = 32;break;}if (!(
                i === lastNewline + 1 && bytes[i] !== metaByte)) {_context4.next = 28;break;}return _context4.abrupt("break", 32);case 28:
                if (bytes[i] === newlineByte) lastNewline = i;case 29:i += 1;_context4.next = 25;break;case 32:

                bytes = bytes.slice(0, lastNewline + 1);case 33:return _context4.abrupt("return",

                bytes);case 34:case "end":return _context4.stop();}}}, _callee4, this, [[12, 16]]);}));function getHeaderBuffer(_x8) {return _getHeaderBuffer.apply(this, arguments);}return getHeaderBuffer;}()


    /**
                                                                                                                                                                                                                  * get a string containing the "header" region of the
                                                                                                                                                                                                                  * file, is the portion up to the first non-meta line
                                                                                                                                                                                                                  *
                                                                                                                                                                                                                  * @returns {Promise} for a string
                                                                                                                                                                                                                  */ }, { key: "getHeader", value: function () {var _getHeader = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5() {var opts,bytes,_args5 = arguments;return _regenerator.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:
                opts = _args5.length > 0 && _args5[0] !== undefined ? _args5[0] : {};_context5.next = 3;return (
                  this.getHeaderBuffer(opts));case 3:bytes = _context5.sent;
                checkAbortSignal(opts.signal);return _context5.abrupt("return",
                bytes.toString('utf8'));case 6:case "end":return _context5.stop();}}}, _callee5, this);}));function getHeader() {return _getHeader.apply(this, arguments);}return getHeader;}()


    /**
                                                                                                                                                                                                 * get an array of reference sequence names, in the order in which
                                                                                                                                                                                                 * they occur in the file.
                                                                                                                                                                                                 *
                                                                                                                                                                                                 * reference sequence renaming is not applied to these names.
                                                                                                                                                                                                 *
                                                                                                                                                                                                 * @returns {Promise} for an array of string sequence names
                                                                                                                                                                                                 */ }, { key: "getReferenceSequenceNames", value: function () {var _getReferenceSequenceNames = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee6(
      opts) {var metadata;return _regenerator.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:_context6.next = 2;return (
                  this.getMetadata(opts));case 2:metadata = _context6.sent;return _context6.abrupt("return",
                metadata.refIdToName);case 4:case "end":return _context6.stop();}}}, _callee6, this);}));function getReferenceSequenceNames(_x9) {return _getReferenceSequenceNames.apply(this, arguments);}return getReferenceSequenceNames;}() }, { key: "renameRefSeq", value: function renameRefSeq(


    refName) {
      if (this._renameRefSeqCache && this._renameRefSeqCache.from === refName)
      return this._renameRefSeqCache.to;

      var renamed = this.renameRefSeqCallback(refName);
      this._renameRefSeqCache = { from: refName, to: renamed };
      return renamed;
    }

    /**
       * @param {object} metadata metadata object from the parsed index,
       * containing columnNumbers, metaChar, and format
       * @param {string} regionRefName
       * @param {number} regionStart region start coordinate (0-based-half-open)
       * @param {number} regionEnd region end coordinate (0-based-half-open)
       * @param {array[string]} line
       * @returns {object} like `{startCoordinate, overlaps}`. overlaps is boolean,
       * true if line is a data line that overlaps the given region
       */ }, { key: "checkLine", value: function checkLine(_ref3,


    regionRefName,
    regionStart,
    regionEnd,
    line)
    {var columnNumbers = _ref3.columnNumbers,metaChar = _ref3.metaChar,coordinateType = _ref3.coordinateType,format = _ref3.format;
      // skip meta lines
      if (line.charAt(0) === metaChar) return { overlaps: false

        // check ref/start/end using column metadata from index
      };var ref = columnNumbers.ref,start = columnNumbers.start,end = columnNumbers.end;
      if (!ref) ref = 0;
      if (!start) start = 0;
      if (!end) end = 0;
      if (format === 'VCF') end = 8;
      var maxColumn = Math.max(ref, start, end);

      // this code is kind of complex, but it is fairly fast.
      // basically, we want to avoid doing a split, because if the lines are really long
      // that could lead to us allocating a bunch of extra memory, which is slow

      var currentColumnNumber = 1; // cols are numbered starting at 1 in the index metadata
      var currentColumnStart = 0;
      var refSeq;
      var startCoordinate;
      for (var i = 0; i < line.length + 1; i += 1) {
        if (line[i] === '\t' || i === line.length) {
          if (currentColumnNumber === ref) {
            var refName = line.slice(currentColumnStart, i);
            refName = this.renameRefSeq(refName);
            if (refName !== regionRefName) return { overlaps: false };
          } else if (currentColumnNumber === start) {
            startCoordinate = (0, _parseInt2.default)(line.slice(currentColumnStart, i), 10);
            // we convert to 0-based-half-open
            if (coordinateType === '1-based-closed') startCoordinate -= 1;
            if (startCoordinate >= regionEnd)
            return { startCoordinate: startCoordinate, overlaps: false };
            if (end === 0) {
              // if we have no end, we assume the feature is 1 bp long
              if (startCoordinate + 1 <= regionStart)
              return { startCoordinate: startCoordinate, overlaps: false };
            }
          } else if (format === 'VCF' && currentColumnNumber === 4) {
            refSeq = line.slice(currentColumnStart, i);
          } else if (currentColumnNumber === end) {
            var endCoordinate = void 0;
            // this will never match if there is no end column
            if (format === 'VCF')
            endCoordinate = this._getVcfEnd(
            startCoordinate,
            refSeq,
            line.slice(currentColumnStart, i));else

            endCoordinate = (0, _parseInt2.default)(line.slice(currentColumnStart, i), 10);
            if (endCoordinate <= regionStart) return { overlaps: false };
          }
          currentColumnStart = i + 1;
          currentColumnNumber += 1;
          if (currentColumnNumber > maxColumn) break;
        }
      }
      return { startCoordinate: startCoordinate, overlaps: true };
    } }, { key: "_getVcfEnd", value: function _getVcfEnd(

    startCoordinate, refSeq, info) {
      var endCoordinate = startCoordinate + refSeq.length;
      if (info[0] !== '.') {
        var prevChar = ';';
        for (var j = 0; j < info.length; j += 1) {
          if (prevChar === ';' && info.slice(j, j + 4) === 'END=') {
            var valueEnd = info.indexOf(';', j);
            if (valueEnd === -1) valueEnd = info.length;
            endCoordinate = (0, _parseInt2.default)(info.slice(j + 4, valueEnd), 10);
            break;
          }
          prevChar = info[j];
        }
      }
      return endCoordinate;
    }

    /**
       * return the approximate number of data lines in the given reference sequence
       * @param {string} refSeq reference sequence name
       * @returns {Promise} for number of data lines present on that reference sequence
       */ }, { key: "lineCount", value: function () {var _lineCount = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee7(
      refSeq, opts) {return _regenerator.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:return _context7.abrupt("return",
                this.index.lineCount(refSeq, opts));case 1:case "end":return _context7.stop();}}}, _callee7, this);}));function lineCount(_x10, _x11) {return _lineCount.apply(this, arguments);}return lineCount;}() }, { key: "_readRegion", value: function () {var _readRegion2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee8(


      position, compressedSize, opts) {var _ref4, fileSize, compressedData;return _regenerator.default.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:_context8.next = 2;return (

                  this.filehandle.stat());case 2:_ref4 = _context8.sent;fileSize = _ref4.size;
                if (position + compressedSize > fileSize)
                compressedSize = fileSize - position;

                compressedData = Buffer.alloc(compressedSize);

                /* const bytesRead = */_context8.next = 8;return this.filehandle.read(
                compressedData,
                0,
                compressedSize,
                position,
                opts);case 8:return _context8.abrupt("return",


                compressedData);case 9:case "end":return _context8.stop();}}}, _callee8, this);}));function _readRegion(_x12, _x13, _x14) {return _readRegion2.apply(this, arguments);}return _readRegion;}()


    /**
                                                                                                                                                                                                               * read and uncompress the data in a chunk (composed of one or more
                                                                                                                                                                                                               * contiguous bgzip blocks) of the file
                                                                                                                                                                                                               * @param {Chunk} chunk
                                                                                                                                                                                                               * @returns {Promise} for a string chunk of the file
                                                                                                                                                                                                               */ }, { key: "readChunk", value: function () {var _readChunk = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee9(
      chunk, opts) {var compressedData, uncompressed, lines;return _regenerator.default.wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:_context9.next = 2;return (



                  this._readRegion(
                  chunk.minv.blockPosition,
                  chunk.fetchedSize(),
                  opts));case 2:compressedData = _context9.sent;_context9.prev = 3;



                uncompressed = unzipChunk(compressedData, chunk);_context9.next = 10;break;case 7:_context9.prev = 7;_context9.t0 = _context9["catch"](3);throw (

                  new Error("error decompressing chunk ".concat(chunk.toString())));case 10:

                lines = uncompressed.toString().split('\n');

                // remove the last line, since it will be either empty or partial
                lines.pop();return _context9.abrupt("return",

                lines);case 13:case "end":return _context9.stop();}}}, _callee9, this, [[3, 7]]);}));function readChunk(_x15, _x16) {return _readChunk.apply(this, arguments);}return readChunk;}() }]);return TabixIndexedFile;}();



module.exports = TabixIndexedFile;