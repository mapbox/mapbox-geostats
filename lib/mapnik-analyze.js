var mapnik = require('mapnik');
var path = require('path');
var _ = require('lodash');
var Promise = require('pinkie-promise');
var translateMapnikType = require('./translate_mapnik_type');

// Register datasource plugins
mapnik.register_default_input_plugins();

function mapnikAnalyze(stats, filePath) {
  return new Promise(function (resolve) {
    var datasourceOptions = { file: filePath };
    switch (path.extname(filePath)) {
      case '.geojson':
        datasourceOptions.type = 'geojson';
        datasourceOptions.cache_features = false;
        break;
      case '.shp':
        datasourceOptions.type = 'shape';
        datasourceOptions.layer = path.basename(this.filePath, path.extname(this.filePath));
        break;
      default:
        throw new Error('Unknown type for "' + filePath + '"');
    }
    var datasource = new mapnik.Datasource(datasourceOptions);
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
