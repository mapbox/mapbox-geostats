'use strict';

const fs = require('fs');
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

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) return reject(readErr);

      filesniffer.sniff(data, (sniffErr, fileType) => {
        if (sniffErr) return reject(sniffErr);
        resolve(fileType);
      });
    });
  });
};
