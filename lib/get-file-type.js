'use strict';

const filesniffer = require('mapbox-file-sniff');

/**
 * Returns the file's type, as determined by filesniffer.
 *
 * @param {string} filePath
 * @return {string} The file's type.
 */
module.exports = function(filePath) {
  return new Promise((resolve, reject) => {
    if (!filePath) return reject(new Error('File path required'));

    filesniffer.quaff(filePath, false, (err, fileType) => {
      if (err) return reject(err);
      resolve(fileType);
    });
  });
};
