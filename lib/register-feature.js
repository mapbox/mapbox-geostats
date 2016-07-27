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
  layerStats.featureCount++;
  layerStats.geometryCounts[featureData.type] = 1 +
    (layerStats.geometryCounts[featureData.type] || 0);
  return layerStats;
};
