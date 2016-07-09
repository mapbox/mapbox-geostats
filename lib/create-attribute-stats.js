var Set = require('es6-set');
var Constants = require('./constants');
var getValueType = require('./get-value-type');

module.exports = function (name, value) {
  var attribute = {
    attribute: name,
    count: 1,
    valueSet: new Set(),
  };

  var valueType = getValueType(value);
  if (valueType) attribute.type = valueType;

  if (valueType === Constants.VALUE_TYPE_STRING
    && value.length > Constants.VALUE_STRING_MAX_LENGTH) {
    return attribute;
  }

  attribute.valueSet.add(value);

  if (valueType === Constants.VALUE_TYPE_NUMBER) {
    attribute.min = value;
    attribute.max = value;
    attribute.sum = value;
  }

  return attribute;
};
