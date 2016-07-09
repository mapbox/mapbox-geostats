module.exports = function (layerStats, featureData) {
  layerStats.featureCount++;
  layerStats.geometryCounts[featureData.type] = 1 +
    (layerStats.geometryCounts[featureData.type] || 0);
};
