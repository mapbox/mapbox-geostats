var path = require('path');
var Promise = require('pinkie-promise');
var gdal = require('./lib/gdal-stats');

function buildGeoStats(filePath) {
  var stats = {
    count: 0,
    fields: {},
    geometryTypes: {
      Unknown: 0,
      Point: 0,
      LineString: 0,
      Polygon: 0,
    },
  };

  return new Promise(function() {
    if (!filePath) throw new Error('Filename required');

    var extension = path.extname(filePath);

    switch (extension) {
      case '.geojson':
        return gdal(stats, filePath);
      default:
        throw new Error('Invalid file type');
    }
  });
}

module.exports = buildGeoStats;
