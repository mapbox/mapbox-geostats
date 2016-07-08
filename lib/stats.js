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
  this.fields[data.key] = {
    valueCount: 1,
    values: new Set(),
  };
  var field = this.fields[data.key];
  var value = normalizeValue(data.value);
  field.values.add(value);

  if (typeof value === 'number') {
    field.min = value;
    field.max = value;
    field.sum = value;
  }
};

Stats.prototype.registerField = function (data) {
  var value = normalizeValue(data.value);
  if (value == null) return;

  var field = this.fields[data.key];
  var valueType = typeof value;

  if (field === undefined) return this.createField(data);
  if (field.valueCount > Constants.FIELDS_MAX) return;

  field.valueCount++;

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

  if (field.values.size > Constants.VALUES_MAX) return;
  if (valueType === 'string' && value.length > Constants.VALUE_STRING_MAX_LENGTH) return;
  field.values.add(value);
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
    result.fields[key] = _.assign({}, value);
    if (value.values) {
      result.fields[key].values = _.toArray(value.values);
    }
  });

  var layerResult = {};
  layerResult[self.layerName] = result;

  return layerResult;
};

module.exports = Stats;

// TODO: Stringification is only necessary if we use gdal (instead of mapnik),
// because gdal stringifies objects but not arrays
function normalizeValue(value) {
  if (value == null) return undefined;
  return (typeof value === 'object') ? JSON.stringify(value) : value;
}
