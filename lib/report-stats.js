var _ = require('lodash');

module.exports = function (layerStats) {
  return {
    layers: layerStats.layers.map(reportLayer),
  };
};

function reportLayer(layerStats) {
  var result = {
    layer: layerStats.name,
    count: layerStats.featureCount,
    attributeCount: layerStats.attributeCount,
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
  var result = _.assign({
    values: _.toArray(attribute.valueSet),
  }, attribute);
  delete result.valueSet;
  return result;
}
