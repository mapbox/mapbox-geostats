var Constants = require('./constants');

module.exports = function (value) {
  if (value == null) return Constants.VALUE_TYPE_NULL;
  switch (typeof value) {
    case 'string':
      return Constants.VALUE_TYPE_STRING;
    case 'number':
      return Constants.VALUE_TYPE_NUMBER;
    case 'boolean':
      return Constants.VALUE_TYPE_BOOLEAN;
    default:
      throw new Error('Unknown value type for `' + value + '`');
  }
};
