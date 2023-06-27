'use strict';

const getFileType = require('./lib/get-file-type');
const mapnikAnalyze = require('./lib/mapnik-analyze');
const tileAnalyze = require('./lib/tile-analyze');
const reportStats = require('./lib/report-stats');
const Constants = require('./lib/constants');

/**
 * @param {string} filePath
 * @param {Object} options
 * @returns {Object} The stats.
 */
async function buildGeoStats(filePath, options) {
  options = options || {};
  options.maxValuesToReport ??= 50;

  if (options.attributes) {
    if (options.attributes.length > Constants.ATTRIBUTES_MAX_REPORT) {
      throw new Error('Cannot report on more than ' + Constants.ATTRIBUTES_MAX_REPORT
        + ' attributes');
    }
    // Conversion to a Set should make for faster lookups
    options.attributes = new Set(options.attributes);
  }

  const fileType = await getFileType(filePath);
  const stats = fileType === Constants.FILETYPE_MBTILES
    ? await tileAnalyze(filePath, options)
    : mapnikAnalyze(filePath, fileType, options);

  return reportStats(stats, options);
}

module.exports = buildGeoStats;
