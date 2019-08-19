"use strict";var TabixIndexedFile = require('./tabixIndexedFile');
var TBI = require('./tbi');
var CSI = require('./csi');
var unzip = require('./unzip');
var unzipChunk = require('./unzip');

module.exports = { TabixIndexedFile: TabixIndexedFile, TBI: TBI, CSI: CSI, unzip: unzip, unzipChunk: unzipChunk };