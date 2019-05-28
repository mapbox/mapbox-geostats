'use strict';
const getFileType = require('./lib/get-file-type');
const mapnikAnalyze = require('./lib/mapnik-analyze');
const tileAnalyze = require('./lib/tile-analyze');
const reportStats = require('./lib/report-stats');
const Constants = require('./lib/constants');

function buildGeoStats(filePath, options) {
  options = options || {};

  if (options.attributes) {
    if (options.attributes.length > Constants.ATTRIBUTES_MAX_REPORT) {
      throw new Error('Cannot report on more than ' + Constants.ATTRIBUTES_MAX_REPORT
        + ' attributes');
    }
    // Conversion to a Set should make for faster lookups
    options.attributes = new Set(options.attributes);
  }

  // The number of unique values we'll count and record depends on
  // the number of attributes we might record
  const divisor = (options.attributes)
    ? Math.min(options.attributes.size, Constants.ATTRIBUTES_MAX_REPORT)
    : Constants.ATTRIBUTES_MAX_REPORT;
  options.maxValuesToCount = Math.floor(Constants.VALUES_MAX_COUNT / divisor);
  options.maxValuesToReport = Math.floor(Constants.VALUES_MAX_REPORT / divisor);

  return getFileType(filePath)
    .then(function(fileType) {
      if (fileType === Constants.FILETYPE_MBTILES) return tileAnalyze(filePath, options);
      return mapnikAnalyze(filePath, fileType, options);
    })
    .then(function(stats) {
      return reportStats(stats, options);
    });
}

module.exports = buildGeoStats;
