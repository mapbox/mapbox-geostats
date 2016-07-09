var mapnik = require('mapnik');
var path = require('path');
var _ = require('lodash');
var Promise = require('pinkie-promise');
var Constants = require('./constants');
var createLayerStats = require('./create-layer-stats');
var registerFeature = require('./register-feature');
var registerAttribute = require('./register-attribute');
var translateMapnikType = require('./translate-mapnik-type');

// Register datasource plugins
mapnik.register_default_input_plugins();

function mapnikAnalyze(filePath) {
  return new Promise(function (resolve) {
    var layerName = path.basename(filePath, path.extname(filePath));
    var layerStats = createLayerStats(layerName);

    var datasourceOptions = { file: filePath };
    switch (path.extname(filePath)) {
      case Constants.EXTNAME_GEOJSON:
        datasourceOptions.type = 'geojson';
        datasourceOptions.cache_features = false;
        break;
      case Constants.EXTNAME_SHAPEFILE:
        datasourceOptions.type = 'shape';
        datasourceOptions.layer = layerName;
        break;
      default:
        throw new Error('Unknown type for "' + filePath + '"');
    }
    var datasource = new mapnik.Datasource(datasourceOptions);

    var features = datasource.featureset();
    var feature = features.next();
    while (feature) {
      registerFeature(layerStats, {
        type: translateMapnikType(feature.geometry().type()),
      });

      _.forOwn(feature.attributes(), function (value, name) {
        registerAttribute(layerStats, name, value);
      });
      feature = features.next();
    }

    resolve({ layers: [layerStats] });
  });
}

module.exports = mapnikAnalyze;
