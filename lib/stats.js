var _ = require('lodash');
var Set = require('es6-set');
var Constants = require('./constants');

function Stats(layerName) {
  this.layerName = layerName;
  this.featureCount = 0;
  this.fieldCount = 0;
  this.fields = {};
  this.geometryTypes = {};
}

Stats.prototype.registerFeature = function (data) {
  this.featureCount++;
  this.geometryTypes[data.type] = (this.geometryTypes[data.type] || 0) + 1;
};

Stats.prototype.createField = function (data) {
  this.fields[data.key] = {
    valueCount: 1,
    valueSet: new Set(),
  };
  var field = this.fields[data.key];
  var value = data.value;
  if (ignoreValue(value)) return;
  field.valueSet.add(value);

  if (typeof value === 'number') {
    field.min = value;
    field.max = value;
    field.sum = value;
  }
};

Stats.prototype.registerField = function (data) {
  var value = data.value;
  if (value == null) return;

  var field = this.fields[data.key];
  var valueType = typeof value;

  if (this.fieldCount > Constants.FIELDS_MAX_COUNT) return;

  if (field === undefined) return this.createField(data);

  if (field.valueCount > Constants.VALUES_MAX_COUNT) return;
  if (!field.valueSet.has(value)) {
    field.valueCount++;
  }

  // field.min serves as an indicator that this field
  // has been considered numeric
  if (field.min && valueType === 'number') {
    if (value < field.min) field.min = value;
    if (value > field.max) field.max = value;
    field.sum += value;
  } else if (field.min) {
    delete field.min;
    delete field.max;
    delete field.sum;
  }

  if (field.valueSet.size > Constants.VALUES_MAX_DETAILS) return;
  if (ignoreValue(value)) return;
  field.valueSet.add(value);
};

Stats.prototype.toJSON = function () {
  var self = this;
  var result = {
    featureCount: self.featureCount,
    fieldCount: self.fieldCount,
    geometryTypes: self.geometryTypes,
    fields: {},
  };

  _.forOwn(this.fields, function (value, key) {
    result.fields[key] = {};
    if (value.valueSet) {
      result.fields[key].values = _.toArray(value.valueSet);
    }
    delete value.valueSet;
    _.assign(result.fields[key], value);
  });

  var layerResult = {};
  layerResult[self.layerName] = result;

  return layerResult;
};

module.exports = Stats;

function ignoreValue(value) {
  return typeof value === 'string' && value.length > Constants.VALUE_STRING_MAX_LENGTH;
}
