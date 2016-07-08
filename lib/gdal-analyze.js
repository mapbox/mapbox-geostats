var gdal = require('gdal');
var Promise = require('pinkie-promise');
var wellknown = require('wellknown');

function gdalAnalyze(stats, filePath) {
  return new Promise(function (resolve) {
    var dataset = gdal.open(filePath);
    dataset.layers.forEach(function (layer) {
      layer.features.forEach(processFeature);
    });
    resolve(stats);
  });

  function processFeature(feature) {
    stats.registerFeature({
      type: wellknown(feature.getGeometry().toWKT()).type,
    });

    feature.fields.forEach(function (value, key) {
      stats.registerField({
        value: value,
        key: key,
      });
    });
  }
}

module.exports = gdalAnalyze;
