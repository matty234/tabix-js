import { GenericFilehandle } from "generic-filehandle";

export class CSI {
	constructor(_ref: any);

	blocksForRange(ref: string, start: number, end: number, _x8: options): List<Chunk>;

	getMetadata(_x3: any, ...args: any[]): any;

	lineCount(_x: any, _x2: any, ...args: any[]): any;

	parse(): any;

	parseAuxData(bytes: any, offset: any, auxLength: any): any;

	parsePseudoBin(bytes: any, offset: any): any;
}

export class TBIOptions {
    filehandle: GenericFilehandle
}

export class TBI {
	constructor(opts: TBIOptions & any);

	blocksForRange(ref: string, start: number, end: number, _x8: any): Promise<Array<Chunk>>;

	getMetadata(_x3: any): any;

	lineCount(_x: any, _x2: any): any;

	parse(): any;

	parsePseudoBin(bytes: any, offset: any): any;
}

export class TabixIndexedFile {
	constructor(_ref: any, ...args: any[]);

	checkLine(_ref3: any, regionRefName: any, regionStart: any, regionEnd: any, line: any): any;

	getHeader(...args: any[]): any;

	getHeaderBuffer(_x8: any, ...args: any[]): any;

	getLines(_x3: any, _x4: any, _x5: any, _x6: any, ...args: any[]): any;

	getMetadata(_x7: any, ...args: any[]): any;

	getReferenceSequenceNames(_x9: any, ...args: any[]): any;

	lineCount(_x10: any, _x11: any, ...args: any[]): any;

	readChunk(_x15: any, _x16: any, ...args: any[]): any;

	renameRefSeq(refName: any): any;
}

export class Chunk {
	/**
  * @param {VirtualOffset} minv
  * @param {VirtualOffset} maxv
  * @param {number} bin
  * @param {number} [fetchedSize]
  */
	constructor(minv: VirtualOffset, maxv: VirtualOffset, bin: number, fetchedSize: number);
}

export class VirtualOffset {
	constructor(blockPosition: number, dataPosition: number);

	static fromBytes(bytes: Int8Array, offset?: number, bigendian?: number);

	compareTo(b: any);

	static min(...args);
}
