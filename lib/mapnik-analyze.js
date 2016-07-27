'use strict';

const mapnik = require('mapnik');
const path = require('path');
const Constants = require('./constants');
const createStats = require('./create-stats');
const createLayerStats = require('./create-layer-stats');
const registerFeature = require('./register-feature');
const registerAttributesMap = require('./register-attributes-map');
const typeIntegerToString = require('./type-integer-to-string');

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
 * @param {string} fileType - One of Constants.FILETYPE_*.
 * @param {Object} [options]
 * @param {Array<string>} [options.attributes]
 * @return {Object} The stats.
 */
module.exports = function(filePath, fileType, options) {
  options = options || {};
  const stats = createStats();
  // Derive a fake layer name from the file's name
  const layerName = path.basename(filePath, path.extname(filePath));
  const layerStats = createLayerStats(layerName);

  stats.layerCountSet.add(layerName);

  const datasourceOptions = { file: filePath };
  switch (fileType) {
    case Constants.FILETYPE_GEOJSON:
      datasourceOptions.type = 'geojson';
      datasourceOptions.cache_features = false;
      break;
    case Constants.FILETYPE_SHAPEFILE:
      datasourceOptions.type = 'shape';
      break;
    case Constants.FILETYPE_CSV:
      datasourceOptions.type = 'csv';
      break;
    default:
      throw new Error('Unrecognized type for ' + filePath);
  }
  const datasource = new mapnik.Datasource(datasourceOptions);

  addFeatures(datasource.featureset());

  stats.layers.push(layerStats);

  return stats;

  function addFeatures(features) {
    if (!features) return;
    let feature = features.next();
    while (feature) {
      registerFeature(layerStats, {
        type: typeIntegerToString(feature.geometry().type()),
      });

      registerAttributesMap(layerStats, options, feature.attributes());

      feature = features.next();
    }
  }
};
