var path = require('path');
var Promise = require('pinkie-promise');
var mapnikAnalyze = require('./lib/mapnik-analyze');
var gdalAnalyze = require('./lib/gdal-analyze');
var Stats = require('./lib/stats');

function buildGeoStats(filePath) {
  return new Promise(function (resolve) {
    var stats = new Stats(path.basename(filePath, path.extname(filePath)));

    if (!filePath) throw new Error('Filename required');

    var extension = path.extname(filePath);

    var analyze = (function () {
      switch (extension) {
        case '.geojson':
          // return mapnikAnalyze(stats, filePath);
          return gdalAnalyze(stats, filePath);
        default:
          throw new Error('Invalid file type');
      }
    }());

    resolve(analyze.then(function (modifiedStats) {
      return modifiedStats.toJSON();
    }));
  });
}

module.exports = buildGeoStats;
