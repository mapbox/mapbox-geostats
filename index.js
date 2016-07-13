var Set = require('es6-set');
var getFileType = require('./lib/get-file-type');
var mapnikAnalyze = require('./lib/mapnik-analyze');
var tileAnalyze = require('./lib/tile-analyze');
var reportStats = require('./lib/report-stats');
var Constants = require('./lib/constants');

function buildGeoStats(filePath, options) {
  options = options || {};
  if (options.attributes) {
    // Conversion to a Set should make for faster lookups
    options.attributes = new Set(options.attributes);
  }

  return getFileType(filePath)
    .then(function (fileType) {
      if (fileType === Constants.FILETYPE_MBTILES) return tileAnalyze(filePath, options);
      return mapnikAnalyze(filePath, fileType, options);
    })
    .then(reportStats);
}

module.exports = buildGeoStats;
