var core = require('core-js');
// var Set = require('es6-set');
var Constants = require('./constants');
var getValueType = require('./get-value-type');

var Set = core.Set;

// TODO: Add option to specify attributes to get stats for
module.exports = function (layerStats, name, value) {
  var valueType = getValueType(value);
  var isValueNull = value === null;

  if (layerStats.attributes[name] === undefined) {
    layerStats.attributeCount++;
    if (layerStats.attributeCount < Constants.ATTRIBUTES_MAX_DETAILS) {
      layerStats.attributes[name] = {
        attribute: name,
        count: 0,
        valueSet: new Set(),
        type: valueType,
      };
    } else {
      return;
    }
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

  // TODO: How can we increment count after VALUES_MAX_DETAILS
  // if we'll no longer know whether the value is unique???
  // Right now it's just counting *all* values, not unique values.
  attribute.count++;

  var isLongString = valueType === Constants.VALUE_TYPE_STRING
    && value.length > Constants.VALUE_STRING_MAX_LENGTH;

  if (!isLongString && attribute.valueSet.size < Constants.VALUES_MAX_DETAILS) {
    attribute.valueSet.add(value);
  }
};
