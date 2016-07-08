var gdal = require('gdal');
var Promise = require('pinkie-promise');
var wkbTypeToGeojsonType = require('./wkb_type_to_geojson_type');

function gdalAnalyze(stats, filePath) {
  return new Promise(function () {
    var dataset = gdal.open(filePath);
    dataset.layers.forEach(function (layer) {
      layer.features.forEach(processFeature);
    });

    console.log(JSON.stringify(stats.toJSON(), null, 2))
  });

  function processFeature(feature) {
    stats.registerFeature({
      type: wkbTypeToGeojsonType(feature.getGeometry().wkbType)
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
