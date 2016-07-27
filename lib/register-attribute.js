'use strict';

const Constants = require('./constants');
const getValueType = require('./get-value-type');

/**
 * Mutates a layer stats object to register stats
 * about an attribute (and returns the mutated object).
 *
 * @param {Object} layerStats
 * @param {Object} options
 * @param {number} options.maxValuesToCount - The maximum number of unique
 *   attribute values to register.
 * @param {string} name - The attribute name.
 * @param {string|number|boolean|null} value - The attribute value.
 * @return {Object} The mutated layerStats.
 */
module.exports = function(layerStats, options, rawName, value) {
  const name = rawName.slice(0, Constants.NAME_TRUNCATE_LENGTH);
  const valueType = getValueType(value);
  const isValueNull = value === null;

  if (layerStats.attributes[name] === undefined) {
    const priorAttributeCount = layerStats.attributeCountSet.size;
    if (priorAttributeCount >= Constants.ATTRIBUTES_MAX_COUNT) return;
    layerStats.attributeCountSet.add(name);

    if (priorAttributeCount >= Constants.ATTRIBUTES_MAX_REPORT) return;
    layerStats.attributes[name] = {
      attribute: name,
      valueSet: new Set(),
      type: valueType,
    };
  }

  const attribute = layerStats.attributes[name];

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

  if (attribute.valueSet.size >= options.maxValuesToCount) return;

  attribute.valueSet.add(truncateForStorage(value));

  return layerStats;
};

function truncateForStorage(value) {
  if (typeof value !== 'string') return value;
  // Store overly long strings at a length one character longer than the max
  // so we still know later to remove them from the reported value array
  if (value.length <= Constants.VALUE_STRING_MAX_LENGTH) return value;
  return value.slice(0, Constants.VALUE_STRING_MAX_LENGTH + 1);
}
