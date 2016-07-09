var Constants = require('./constants');
var getValueType = require('./get-value-type');
var createAttributeStats = require('./create-attribute-stats');

module.exports = function (layerStats, name, value) {
  if (layerStats.attributes[name] === undefined) {
    layerStats.attributeCount++;
    if (layerStats.attributeCount < Constants.ATTRIBUTES_MAX_DETAILS) {
      layerStats.attributes[name] = createAttributeStats(name, value);
    }
    return;
  }

  var attribute = layerStats.attributes[name];

  if (value != null
    && attribute.type !== Constants.VALUE_TYPE_MIXED
    && getValueType(value) !== attribute.type) {
    attribute.type = Constants.VALUE_TYPE_MIXED;
  }

  if (typeof value === 'number') {
    if (attribute.min === undefined || value < attribute.min) attribute.min = value;
    if (attribute.min === undefined || value > attribute.max) attribute.max = value;
    attribute.sum = (attribute.sum || 0) + value;
  }

  // TODO: how can we increment count after VALUES_MAX_DETAILS
  // if we'll no longer know whether the value is unique?
  attribute.count++;

  if (attribute.valueSet.size < Constants.VALUES_MAX_DETAILS) {
    attribute.valueSet.add(value);
  }
};
