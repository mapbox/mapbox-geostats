'use strict';

/**
 * Returns a new, empty layer stats object.
 *
 * @param {string} name
 * @returns {Object} The new, empty layer stats.
 */
module.exports = function(name) {
  return {
    name: name,
    attributes: Object.create(null),
    attributeCountSet: new Set(),
    attributeCount: 0,
    geometry: new Set(),
  };
};
