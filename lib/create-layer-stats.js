var Set = require('es6-set');

/**
 * Returns a new, empty layer stats object.
 *
 * @param {string} name
 * @returns {Object} The new, empty layer stats.
 */
module.exports = function (name) {
  return {
    name: name,
    attributes: {},
    attributeCountSet: new Set(),
    featureCount: 0,
    attributeCount: 0,
    geometryCounts: {},
  };
};
