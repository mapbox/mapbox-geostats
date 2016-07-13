var _ = require('lodash');
var registerAttribute = require('./register-attribute');

/**
 * Mutates a layer stats object to register stats
 * about a object of attributes (and returns the mutated object).
 *
 * @param {Object} layerStats
 * @param {Object} options
 * @param {Object} [options.attributes] - The attributes.
 * @param {Object} attributes - The attributes to register, as an object
 *   of `name: value`
 * @return {Object} The mutated layerStats.
 */
module.exports = function (layerStats, options, attributes) {
  var specifiedAttributes = options.attributes;

  _.forOwn(attributes, function (value, name) {
    if (specifiedAttributes && !specifiedAttributes.has(name)) return;
    registerAttribute(layerStats, name, value);

    // If we've already registered all the attributes that the user
    // is interested in, exit the loop
    if (specifiedAttributes && layerStats.attributeCountSet.size === specifiedAttributes.size) {
      return false;
    }
  });

  return layerStats;
};
