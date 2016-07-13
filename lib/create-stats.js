var Set = require('es6-set');

/**
 * Returns a new, empty stats object.
 *
 * @returns {Object} The new, empty stats.
 */
module.exports = function () {
  return {
    layerCountSet: new Set(),
    layers: [],
  };
};
