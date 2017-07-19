'use strict';

const Validator = require('jsonschema').Validator;
const schema = require('../schema/tilestats.json');
const layerSchema = require('../schema/layer.json');
const attributeSchema = require('../schema/attribute.json');

/**
 * Check if a stats JSON object is valid
 *
 * @param {Object} stats - a JSON tilestats object
 * @returns {Boolean|Array<String>} error - returns `true` if the object is valid, or an array error strings
 */
module.exports = function(stats) {
  const v = new Validator();
  v.addSchema(layerSchema, '/layer');
  v.addSchema(attributeSchema, '/attribute');

  const results = v.validate(stats, schema);
  if (!results.errors.length) return true;
  return results.errors.map(function(err) {
    return err.message;
  });
};
