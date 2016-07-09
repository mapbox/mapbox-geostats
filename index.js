var path = require('path');
var Promise = require('pinkie-promise');
var mapnikAnalyze = require('./lib/mapnik-analyze');
var reportStats = require('./lib/report-stats');
var Constants = require('./lib/constants');

function buildGeoStats(filePath) {
  return new Promise(function (resolve) {
    if (!filePath) throw new Error('Filename required');

    var extension = path.extname(filePath);

    var analyze = (function () {
      switch (extension) {
        case Constants.EXTNAME_GEOJSON:
        case Constants.EXTNAME_SHAPEFILE:
          return mapnikAnalyze(filePath);
        default:
          throw new Error('Invalid file type');
      }
    }());

    resolve(analyze.then(function (stats) {
      return reportStats(stats);
    }));
  });
}

module.exports = buildGeoStats;
