var Set = require('es6-set');
var _ = require('lodash');
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
  var value = data.value;
  var field = this.fields[data.key] = {
    valueCount: 1,
  };

  if (typeof value === 'object') {
    field.nonPrimitiveType = (_.isArray(value))
      ? Constants.TYPE_ARRAY
      : Constants.TYPE_OBJECT;
  } else {
    field.valueSet = new Set([value]);
  }

  if (typeof value === 'number') {
    field.min = value;
    field.max = value;
    field.sum = value;
  }
};

Stats.prototype.registerField = function (data) {
  this.fieldCount++;
  if (this.fieldCount > Constants.FIELDS_MAX) return;

  var field = this.fields[data.key];
  var value = data.value;

  if (field === undefined) return this.createField(data);

  field.valueCount++;
  if (typeof value === 'object') return;

  // field.min serves as an indicator that this field
  // has been considered numeric
  if (field.min && typeof value === 'number') {
    if (value < field.min) field.min = value;
    if (value > field.max) field.max = value;
    field.sum += value;
  } else if (field.min) {
    delete field.min;
    delete field.max;
    delete field.sum;
  }

  if (field.valueSet.size <= Constants.VALUES_MAX) {
    field.valueSet.add(value);
  }
};

Stats.prototype.toJSON = function () {
  var result = {
    featureCount: this.featureCount,
    fieldCount: this.fieldCount,
    geometryTypes: this.geometryTypes,
    fields: {},
  };

  for (var key in this.fields) {
    if (!this.fields.hasOwnProperty(key)) continue;
    result.fields[key] = _.assign({}, this.fields[key]);
    if (this.fields[key].valueSet) {
      result.fields[key].values = _.toArray(this.fields[key].valueSet);
    }
  }

  var layerResult = {};
  layerResult[this.layerName] = result;

  return layerResult;
};

module.exports = Stats;
