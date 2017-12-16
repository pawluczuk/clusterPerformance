'use strict';

const fs = require('fs')
  , shortid = require('shortid')
  , path = require('path');

module.exports = function(data, cb) {
  let quality = data.price ? data.points / data.price : 0;
  let processedData = {
    title: data.title
    , country: data.country
    , quality: quality
  };
  // to do: do something more advanced
  fs.writeFile(path.join('./ouput'), shortid.generate(), processedData, cb);
}