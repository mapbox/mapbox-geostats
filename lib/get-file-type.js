'use strict';

const filesniffer = require('@mapbox/mapbox-file-sniff');

/**
 * Returns the file's type, as determined by filesniffer.
 *
 * @param {string} filePath
 * @return {Object} The file's info
 */
module.exports = function(filePath) {
  return new Promise((resolve, reject) => {
    if (!filePath) return reject(new Error('File path required'));

    filesniffer.fromFile(filePath, (err, fileinfo) => {
      if (err) return reject(err);
      resolve(fileinfo.type);
    });
  });
};
