var _ = require('lodash');
var Set = require('es6-set');
var getValueType = require('./get-value-type');
var Constants = require('./constants');

function StatLayer(layerName) {
  this.layerName = layerName;
  this.featureCount = 0;
  this.attributeCount = 0;
  this.attributes = {};
  this.geometryCounts = {};
}

StatLayer.prototype.feature = function (data) {
  this.featureCount++;
  this.geometryCounts[data.type] = (this.geometryCounts[data.type] || 0) + 1;
};

StatLayer.prototype.newAttribute = function (data) {
  this.attributeCount++;
  if (this.attributeCount >= Constants.ATTRIBUTES_MAX_DETAILS) return;

  var value = data.value;
  var valueType = getValueType(value);
  this.attributes[data.key] = {
    count: 1,
    valueSet: new Set(),
    type: valueType,
  };
  var attribute = this.attributes[data.key];

  if (ignoreValue(value)) return;
  attribute.valueSet.add(value);

  if (valueType === Constants.VALUE_TYPE_NUMBER) {
    attribute.min = value;
    attribute.max = value;
    attribute.sum = value;
  }
};

StatLayer.prototype.attribute = function (data) {
  var attribute = this.attributes[data.key];
  if (attribute === undefined) return this.newAttribute(data);

  var value = data.value;
  if (value == null) return;

  // For every attribute, no matter the count,
  // possibly override type and numeric stats

  if (attribute.type !== Constants.VALUE_TYPE_MIXED
    && getValueType(value) !== attribute.type) {
    attribute.type = Constants.VALUE_TYPE_MIXED;
  }

  if (typeof value === 'number') {
    if (attribute.min === undefined || value < attribute.min) attribute.min = value;
    if (attribute.min === undefined || value > attribute.max) attribute.max = value;
    attribute.sum = (attribute.sum || 0) + value;
  }

  if (!attribute.valueSet.has(value)) {
    attribute.count++;
  }

  if (attribute.valueSet.size < Constants.VALUES_MAX_DETAILS) {
    attribute.valueSet.add(value);
  }
};

StatLayer.prototype.toJSON = function () {
  var self = this;
  var result = {
    featureCount: self.featureCount,
    attributeCount: self.attributeCount,
    geometryCounts: self.geometryCounts,
    attributes: {},
  };

  _.forOwn(this.attributes, function (value, key) {
    result.attributes[key] = {};
    if (value.valueSet) {
      result.attributes[key].values = _.toArray(value.valueSet);
    }
    delete value.valueSet;
    _.assign(result.attributes[key], value);
  });

  var layerResult = {};
  layerResult[self.layerName] = result;

  return layerResult;
};

function Stats() {
  this.layers = [];
};

Stats.prototype.layer = function (layerName) {
  var newLayer = new StatLayer(layerName);
  this.layers.push(newLayer);
  return new Layer;
};

module.exports = StatLayer;

function ignoreValue(value) {
  return typeof value === 'string' && value.length > Constants.VALUE_STRING_MAX_LENGTH;
}
