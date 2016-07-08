var gdal = require('gdal');
var Promise = require('pinkie-promise');
var translateGdalType = require('./translate_gdal_type');

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
      type: translateGdalType(feature.getGeometry().wkbType),
    });

    feature.fields.forEach(function (value, key) {
      stats.registerField({
        value: normalizeValue(value),
        key: key,
      });
    });
  }
}

module.exports = gdalAnalyze;

function normalizeValue(value) {
  if (value == null) return undefined;
  return (typeof value === 'object') ? JSON.stringify(value) : value;
}
