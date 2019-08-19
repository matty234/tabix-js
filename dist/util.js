"use strict";var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");var _minSafeInteger = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/number/min-safe-integer"));var _maxSafeInteger = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/number/max-safe-integer"));module.exports = {
  longToNumber: function longToNumber(long) {
    if (
    long.greaterThan(_maxSafeInteger.default) ||
    long.lessThan(_minSafeInteger.default))
    {
      throw new Error('integer overflow');
    }
    return long.toNumber();
  },

  /**
      * properly check if the given AbortSignal is aborted.
      * per the standard, if the signal reads as aborted,
      * this function throws either a DOMException AbortError, or a regular error
      * with a `code` attribute set to `ERR_ABORTED`.
      *
      * for convenience, passing `undefined` is a no-op
      *
      * @param {AbortSignal} [signal]
      * @returns nothing
      */
  checkAbortSignal: function checkAbortSignal(signal) {
    if (!signal) return;

    if (signal.aborted) {
      // console.warn('tabix operation aborted')
      if (typeof DOMException !== 'undefined') {
        // eslint-disable-next-line no-undef
        throw new DOMException('aborted', 'AbortError');
      } else {
        var e = new Error('aborted');
        e.code = 'ERR_ABORTED';
        throw e;
      }
    }
  },

  canMergeBlocks: function canMergeBlocks(block1, block2) {
    return (
      block1.minv.blockPosition === block1.maxv.blockPosition &&
      block1.maxv.blockPosition === block2.minv.blockPosition &&
      block2.minv.blockPosition === block2.maxv.blockPosition);

  } };