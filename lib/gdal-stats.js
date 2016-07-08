var gdal = require('gdal');
var Promise = require('pinkie-promise');

function geojsonStats(stats, filePath) {
  return new Promise(function() {
    var dataset = gdal.open(filePath);
    dataset.layers.forEach(function(layer) {
      layer.features.forEach(processFeature)
    });
  });

  function processFeature(feature) {
    stats.count++;

    var geometry = feature.getGeometry();
    stats.geometryTypes[geometry]++;

    feature.fields.forEach(function(value, key) {
      if (stats.fields[key] === undefined) {
        stats.fields[key] = newFieldStats(value);
        return;
      }

      var field = stats.fields[key];
      field.values.push(value);

      if (typeof value !== 'number') return;

      if (!field.sum) throw new Error('Incompatible field values');
      if (value < field.min) field.min = value;
      if (value > field.max) field.max = value;
      field.sum += value;
    });
  }

  function newFieldStats(value) {
    var fieldStats = {
      values: [value]
    };

    if (typeof value === 'number') {
      fieldStats.min = value;
      fieldStats.max = value;
      fieldStats.sum = value;
    }

    return fieldStats;
  }
}

module.exports = geojsonStats;
