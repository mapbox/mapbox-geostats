var Promise = require('pinkie-promise');
var path = require('path');
var mapnikAnalyze = require('./lib/mapnik-analyze');
var tileAnalyze = require('./lib/tile-analyze');
var reportStats = require('./lib/report-stats');
var Constants = require('./lib/constants');

function buildGeoStats(filePath, options) {
  return Promise.resolve().then(function () {
    if (!filePath) throw new Error('File path required');
    if (path.extname(filePath) === Constants.EXTNAME_MBTILES) {
      return tileAnalyze(filePath, options);
    }
    return mapnikAnalyze(filePath, options);
  }).then(function (stats) {
    return reportStats(stats);
  });
}

module.exports = buildGeoStats;
