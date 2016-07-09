var Constants = require('./constants');

function getValueType(value) {
  if (value == null) return null;
  switch (typeof value) {
    case 'string':
      return Constants.VALUE_TYPE_STRING;
    case 'number':
      return Constants.VALUE_TYPE_NUMBER;
    case 'boolean':
      return Constants.VALUE_TYPE_BOOLEAN;
    default:
      throw new Error('Unknown value type for "' + value + '"');
  }
}

module.exports = getValueType;
