'use strict';
const debug = require('debug')('master')
  , workersNumber = require('os').cpus().length
  , cluster = require('cluster')
  , fs = require('fs')
  , path = require('path');

class Master {

  constructor(data, dataProcessor, filesPerProcess) {
    this.dataProcessor = dataProcessor;
    this.data = data;
    this.filesPerProcess = filesPerProcess;
    this.currentlyWorking = 0;
  }

  scheduleNewTask(worker) {
    if (!this.data.length) {
      // no more files to process, process can be closed
      return worker.send({ type: 'exit' });
      // send new batch of files to waiting process
    }
    return worker.send({
      type: 'process'
      , data: this.data.splice(0, Math.min(this.data.length, this.filesPerProcess))
      , dataProcessor: this.dataProcessor
    });
  }

  onlineWorker(worker) {
    debug(`Worker ${worker.process.pid} is online`);
    this.currentlyWorking += 1;
  }

  exitWorker(worker, code, signal, cb) {
    debug(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
    if (this.data.length) {
      debug('Something went wrong. Starting a new worker');
      cluster.fork();
    }
    else {
      this.currentlyWorking -= 1;
      debug(`Active ${this.currentlyWorking} forks`);
      if (!this.currentlyWorking) {
        debug('All workers finished working');
        return cb();
      }
    }
  }

  messageWorker(worker, code) {
    debug('Master received message', code);
    if (['finish', 'ready'].indexOf(code) > -1) {
      debug('Master sending new batch of data.');
      console.log(this)
      this.scheduleNewTask(worker);
    }
  }

  processor(cb) {
    for (let i = 0; i < workersNumber; i++) {
      cluster.fork();
    }
  
    cluster.on('online', this.onlineWorker);
    cluster.on('message', this.messageWorker);
    cluster.on('exit', () => {
      return this.exitWorker(worker, code, signal, cb);
    });
  }
}

module.exports = Master;