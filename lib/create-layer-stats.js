var Set = require('es6-set');

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
