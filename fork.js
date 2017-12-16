'use strict';

const debug = require('debug')('fork') 
  , async = require('async');

module.exports = {
  processor: function() {
    process.send('ready');
    
    process.on('message', function(task) {
      if (task.type === 'process') {
        const { data, dataProcessor } = task;
        async.each(data, dataProcessor, (err) => {
          debug(`task execution err: ${err}`);
          process.send('finish');
        });
      }
      else if (task.type === 'exit') {
        debug(`fork exiting ${process.pid}`);
        process.exit();
      }
    });
  }
};