var mapnik = require('mapnik');
var path = require('path');
var Constants = require('./constants');
var createStats = require('./create-stats');
var createLayerStats = require('./create-layer-stats');
var registerFeature = require('./register-feature');
var registerAttributes = require('./register-attributes');
var typeIntegerToString = require('./type-integer-to-string');

// Register datasource plugins
mapnik.register_default_input_plugins();

/**
 * Returns stats about a file we can analyze with Mapnik.
 * Understand the following:
 * - .geojson
 * - .shp
 * - .csv
 *
 * @param {string} filePath
 * @param {Object} [options]
 * @param {Array<string>} [options.attributes]
 * @return {Object} The stats.
 */
module.exports = function (filePath, options) {
  options = options || {};
  var stats = createStats();
  // Derive a fake layer name from the file's name
  var layerName = path.basename(filePath, path.extname(filePath));
  var layerStats = createLayerStats(layerName);

  stats.layerCountSet.add(layerName);

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
    case Constants.EXTNAME_CSV:
      datasourceOptions.type = 'csv';
      datasourceOptions.layer = layerName;
      break;
    default:
      throw new Error('Unknown type for ' + filePath + '. Provide .geojson, .shp, .csv files.');
  }
  var datasource = new mapnik.Datasource(datasourceOptions);

  var features = datasource.featureset();
  var feature = features.next();
  while (feature) {
    registerFeature(layerStats, {
      type: typeIntegerToString(feature.geometry().type()),
    });

    registerAttributes(layerStats, options, feature.attributes());

    feature = features.next();
  }

  stats.layers.push(layerStats);

  return stats;
};
