"use strict";var _require = require('pako'),Inflate = _require.Inflate,Z_SYNC_FLUSH = _require.Z_SYNC_FLUSH;

function pakoUnzip(inputData) {
  var strm;
  var pos = 0;
  var i = 0;
  var chunks = [];
  var inflator;
  do {
    var remainingInput = inputData.slice(pos);
    inflator = new Inflate();var _inflator =
    inflator;strm = _inflator.strm;
    inflator.push(remainingInput, Z_SYNC_FLUSH);
    if (inflator.err) throw new Error(inflator.msg);

    pos += strm.next_in;
    chunks[i] = Buffer.from(inflator.result);
    i += 1;
  } while (strm.avail_in);

  var result = Buffer.concat(chunks);

  return result;
}

// similar to pakounzip, except it does extra counting and
// trimming to make sure to return only exactly the data
// range specified in the chunk
function unzipChunk(inputData, chunk) {
  var strm;
  var pos = 0;
  var decompressedBlocks = [];
  var inflator;
  var fileStartingOffset = chunk.minv.blockPosition;
  for (;;) {
    var remainingInput = inputData.slice(pos);
    inflator = new Inflate();var _inflator2 =
    inflator;strm = _inflator2.strm;
    inflator.push(remainingInput, Z_SYNC_FLUSH);
    if (inflator.err) throw new Error(inflator.msg);

    decompressedBlocks.push(Buffer.from(inflator.result));

    if (decompressedBlocks.length === 1 && chunk.minv.dataPosition) {
      // this is the first chunk, trim it
      decompressedBlocks[0] = decompressedBlocks[0].slice(
      chunk.minv.dataPosition);

    }
    if (fileStartingOffset + pos >= chunk.maxv.blockPosition) {
      // this is the last chunk, trim it and stop decompressing
      decompressedBlocks[decompressedBlocks.length - 1] = decompressedBlocks[
      decompressedBlocks.length - 1].
      slice(
      0,
      chunk.minv.blockPosition === chunk.maxv.blockPosition ?
      chunk.maxv.dataPosition - chunk.minv.dataPosition + 1 :
      chunk.maxv.dataPosition + 1);

      break;
    }
    // if we are not at the last chunk and there is no more input available,
    // something is wrong.
    if (!strm.avail_in) {
      throw new Error("unexpected end of input decompressing chunk ".concat(
      chunk.toString()));

    }

    pos += strm.next_in;
  }

  var result = Buffer.concat(decompressedBlocks);
  return result;
}

module.exports = {
  unzip: pakoUnzip,
  unzipChunk: unzipChunk };