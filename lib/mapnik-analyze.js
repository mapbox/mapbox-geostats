var mapnik = require('mapnik');
var path = require('path');
var _ = require('lodash');
var Constants = require('./constants');
var createLayerStats = require('./create-layer-stats');
var registerFeature = require('./register-feature');
var registerAttribute = require('./register-attribute');
var typeIntegerToString = require('./type-integer-to-string');

// Register datasource plugins
mapnik.register_default_input_plugins();

module.exports = function (filePath, options) {
  options = options || {};
  var layerName = path.basename(filePath, path.extname(filePath));
  var layerStats = createLayerStats(layerName);

  var datasourceOptions = { file: filePath };
  switch (path.extname(filePath)) {
    case Constants.EXTNAME_GEOJSON:
      datasourceOptions.type = 'geojson';
      datasourceOptions.cache_features = false;
      datasourceOptions.num_features_to_query = 100;
      break;
    case Constants.EXTNAME_SHAPEFILE:
      datasourceOptions.type = 'shape';
      datasourceOptions.layer = layerName;
      break;
    default:
      throw new Error('Unknown type for ' + filePath + '. Provide .geojson or .shp files.');
  }
  var datasource = new mapnik.Datasource(datasourceOptions);

  var features = datasource.featureset();
  var feature = features.next();
  while (feature) {
    registerFeature(layerStats, {
      type: typeIntegerToString(feature.geometry().type()),
    });

    _.forOwn(feature.attributes(), function (value, name) {
      if (options.attributes && options.attributes.indexOf(name) === -1) return;
      registerAttribute(layerStats, name, value);
    });
    feature = features.next();
  }

  return {
    layers: [layerStats],
  };
};
