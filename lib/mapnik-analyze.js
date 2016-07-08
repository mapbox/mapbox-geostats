var mapnik = require('mapnik');
var _ = require('lodash');
var Promise = require('pinkie-promise');
var translateMapnikType = require('./translate_mapnik_type');

// Register datasource plugins
mapnik.register_default_input_plugins();

function mapnikAnalyze(stats, filePath) {
  return new Promise(function (resolve) {
    var datasource = new mapnik.Datasource({
      type: 'geojson',
      file: filePath,
      cache_features: false,
    });
    var features = datasource.featureset();
    var feature = features.next();
    while (feature) {
      processFeature(feature);
      feature = features.next();
    }
    resolve(stats);
  });

  function processFeature(feature) {
    stats.registerFeature({
      type: translateMapnikType(feature.geometry().type()),
    });

    _.forOwn(feature.attributes(), function (value, key) {
      stats.registerField({
        value: value,
        key: key,
      });
    });
  }
}

module.exports = mapnikAnalyze;
