'use strict';

const debug = require('debug')('index')
  , async = require('async')
  , fs = require('fs')
  , Master = require('./master')
  , fork = require('./fork')
  , dataProcessor = require('./dataProcessor')
  , cluster = require('cluster')
  ;

function startProcessing(dir, filesPerProcess, cb) {
  if (cluster.isMaster) {
    const master = new Master(dir, dataProcessor, filesPerProcess);
    master.processor(cb);
  }
  else {
    fork.processor();
  }
}

function cleanUp() {
  const tempDir = './output';
  const tempFiles = fs.readdirSync(tempDir).map(file => path.join(tempDir, file));
  tempFiles.forEach((file) => {
    fs.unlinkSync(file);
  });
}

if (process.argv < 3) {
  console.error('File not specified');
  process.exit(1);
}

if (!process.argv[2].endsWith('json')) {
  console.error('Provided file must be a JSON file');
  process.exit(1);
}

const filePath = process.argv[2];
const data = require(filePath);
const filesPerProcess = 10;

console.time('processing');
startProcessing(data, filesPerProcess, () => {
  console.timeEnd('processing');
  cleanUp();
  process.exit();
});