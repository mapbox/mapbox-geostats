var Set = require('es6-set');
var Constants = require('./constants');
var getValueType = require('./get-value-type');

// TODO: Add option to specify attributes to get stats for
module.exports = function (layerStats, name, value) {
  var valueType = getValueType(value);
  var isValueNull = value === null;

  if (layerStats.attributes[name] === undefined) {
    if (layerStats.attributeCountSet.size >= Constants.ATTRIBUTES_MAX_COUNT) return;
    layerStats.attributeCountSet.add(name);

    if (layerStats.attributeCountSet.size >= Constants.ATTRIBUTES_MAX_REPORT) return;
    layerStats.attributes[name] = {
      attribute: name,
      valueSet: new Set(),
      type: valueType,
    };
  }

  var attribute = layerStats.attributes[name];

  if (isValueNull && attribute.valueSet.has(null)) return;

  if (attribute.type !== Constants.VALUE_TYPE_MIXED
    && !isValueNull
    && valueType !== attribute.type) {
    attribute.type = Constants.VALUE_TYPE_MIXED;
  }

  if (typeof value === 'number') {
    if (attribute.min === undefined || value < attribute.min) attribute.min = value;
    if (attribute.max === undefined || value > attribute.max) attribute.max = value;
  }

  if (attribute.valueSet.size >= Constants.VALUES_MAX_COUNT) return;

  attribute.valueSet.add(truncateForStorage(value));
};

function truncateForStorage(value) {
  if (typeof value !== 'string') return value;
  // Store strings at one character longer than the max
  // so we know to remove them from the reported value array
  if (value.length <= Constants.VALUE_STRING_MAX_LENGTH) return value;
  return value.slice(0, Constants.VALUE_STRING_MAX_LENGTH + 1);
}
