var Promise = require('pinkie-promise');
var fs = require('fs');
var filesniffer = require('mapbox-file-sniff');

/**
 * Returns the file's type, as determined by filesniffer.
 *
 * @param {string} filePath
 * @return {string} The file's type.
 */
module.exports = function (filePath) {
  return new Promise(function (resolve, reject) {
    if (!filePath) return reject(new Error('File path required'));

    fs.readFile(filePath, function (readErr, data) {
      if (readErr) return reject(readErr);

      filesniffer.sniff(data, function (sniffErr, fileType) {
        if (sniffErr) return reject(sniffErr);
        resolve(fileType);
      });
    });
  });
};
