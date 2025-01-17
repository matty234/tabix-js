<a name="1.3.0"></a>
# [1.3.0](https://github.com/GMOD/tabix-js/compare/v1.2.0...v1.3.0) (2019-08-08)



<a name="1.2.0"></a>
# [1.2.0](https://github.com/GMOD/tabix-js/compare/v1.1.8...v1.2.0) (2019-07-05)



- Add ability for `getLines` to be open-ended. With no `end`, getlines continues
until the end of the sequence.

<a name="1.1.8"></a>
## [1.1.8](https://github.com/GMOD/tabix-js/compare/v1.1.7...v1.1.8) (2019-06-06)



- Add a fix for a bgzf unzipping thing that could result in duplicate features being returned


## [1.1.7](https://github.com/GMOD/tabix-js/compare/v1.1.6...v1.1.7) (2019-06-04)



- Removed chunk merging from header file parsing which now results in smaller bgzf unzip calls being streamed out to clients

## [1.1.6](https://github.com/GMOD/tabix-js/compare/v1.1.5...v1.1.6) (2019-05-31)

- Fix issue with headerless files returning data lines in header
- Use generic-filehandle for localFile

## [1.1.5](https://github.com/GMOD/tabix-js/compare/v1.1.4...v1.1.5) (2019-03-05)

- Fix parsing on a tabix file that should be csi files (e.g. too long of chromosomes)

## [1.1.4](https://github.com/GMOD/tabix-js/compare/v1.1.3...v1.1.4) (2019-02-23)

- Upgrade to babel 7

## [1.1.3](https://github.com/GMOD/tabix-js/compare/v1.1.2...v1.1.3) (2018-11-23)

- Change to es6-promisify and quick-lru which can be babelified to IE11 (util.promisify and lru-cache used Object.defineProperty('length', ...))

## [1.1.2](https://github.com/GMOD/tabix-js/compare/v1.1.1...v1.1.2) (2018-10-26)

- Add VCF info field END= parsing and other file offset improvements
- Treats VCF type differently from generic type tabix files

## [1.1.1](https://github.com/GMOD/tabix-js/compare/v1.1.0...v1.1.1) (2018-10-05)

- Trim output to avoid CRLF in output

## [1.1.0](https://github.com/GMOD/tabix-js/compare/v1.0.2...v1.1.0) (2018-09-24)

- Use custom bgzf block unzipping function
- Fixes to avoid duplicate lines in output

## [1.0.2](https://github.com/GMOD/tabix-js/compare/v1.0.1...v1.0.2) (2018-09-18)

- Implement better lineCount function from tbi/csi pseudobin
- Fix first data line finding with very large header tabix files

## [1.0.1](https://github.com/GMOD/tabix-js/compare/v1.0.0...v1.0.1) (2018-09-15)


- Add renameRefSeqs handling
- Fix some blocksForRange

# 1.0.0 (2018-09-09)

- Initial release
