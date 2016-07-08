var path = require('path');
var Promise = require('pinkie-promise');
var gdalAnalyze = require('./lib/gdal-analyze');
var Stats = require('./lib/stats');

function buildGeoStats(filePath) {
  return new Promise(function () {
    var stats = new Stats(path.basename(filePath, path.extname(filePath)));

    if (!filePath) throw new Error('Filename required');

    var extension = path.extname(filePath);

    switch (extension) {
      case '.geojson':
        return gdalAnalyze(stats, filePath);
      default:
        throw new Error('Invalid file type');
    }
  });
}

module.exports = buildGeoStats;
