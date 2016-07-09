var Promise = require('pinkie-promise');
var mapnikAnalyze = require('./lib/mapnik-analyze');
var reportStats = require('./lib/report-stats');

function buildGeoStats(filePath) {
  return Promise.resolve().then(function () {
    if (!filePath) throw new Error('File path required');
    return mapnikAnalyze(filePath);
  }).then(function (stats) {
    return reportStats(stats);
  });
}

module.exports = buildGeoStats;
