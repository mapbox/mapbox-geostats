'use strict';

/**
 * Mutates a layer stats object to register stats
 * about a feature (and returns the mutated object).
 *
 * @param {Object} layerStats
 * @param {Object} featureData
 * @param {string} featureData.type - The feature's type.
 * @return {Object} The mutated layerStats.
 */
module.exports = function(layerStats, featureData) {
  layerStats.geometry.add(featureData.type);
  return layerStats;
};
