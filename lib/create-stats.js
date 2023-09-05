'use strict';

/**
 * Returns a new, empty stats object.
 *
 * @returns {Object} The new, empty stats.
 */
module.exports = function() {
  return {
    languages: new Set(),
    layerCountSet: new Set(),
    layers: [],
  };
};
