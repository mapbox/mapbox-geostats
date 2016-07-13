var _ = require('lodash');
var Constants = require('./constants');

/**
 * Returns an object bearing stats, formatted for output & reportage.
 *
 * @param {Object} stats - See create-layer-stats.js
 * @param {Object} options
 * @param {number} options.maxValuesToReport - The maximum number of unique
 *   attribute values to record.
 * @return {Object} The report, which adheres to the relevant JSON schema.
 */
module.exports = function (stats, options) {
  return {
    layerCount: stats.layerCountSet.size,
    layers: stats.layers.map(reportLayer),
  };


  function reportLayer(layerStats) {
    var result = {
      layer: layerStats.name,
      count: layerStats.featureCount,
      attributeCount: layerStats.attributeCountSet.size,
      attributes: _.values(layerStats.attributes).map(reportAttribute),
    };

    var dominantGeometry;
    var dominantGeometryCount = 0;
    _.forOwn(layerStats.geometryCounts, function (count, geometry) {
      if (count > dominantGeometryCount) {
        dominantGeometryCount = count;
        dominantGeometry = geometry;
      }
    });
    if (dominantGeometry) result.geometry = dominantGeometry;

    return result;
  }

  function reportAttribute(attribute) {
    // Convert the Set to an array of limited size
    var values = [];
    var valueSetIterator = attribute.valueSet.values();
    var item = valueSetIterator.next();
    while (!item.done && values.length < options.maxValuesToReport) {
      if (isValueReportable(item.value)) {
        values.push(item.value);
      }
      item = valueSetIterator.next();
    }

    var result = _.assign({
      values: values,
      count: attribute.valueSet.size,
    }, attribute);
    delete result.valueSet;

    return result;
  }
};

function isValueReportable(x) {
  if (typeof x === 'string'
    && x.length > Constants.VALUE_STRING_MAX_LENGTH) return false;
  return true;
}
