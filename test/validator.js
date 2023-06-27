'use strict';

const test = require('tap').test;
const sloppySort = require('./utils/sloppy-sort');
const validator = require('../lib/validate-stats');

test('valid stats object', t => {
  const stats = {
    layerCount: 1,
    layers: [
      {
        layer: 'test-layer',
        count: 3,
        geometry: 'Point',
        attributeCount: 1,
        attributes: [
          {
            attribute: 'test-attribute',
            count: 3,
            type: 'number',
            values: [2, 5, 19],
            min: 2,
            max: 19,
          },
        ],
      },
    ],
  };

  t.ok(validator(stats));
  t.end();
});

test('invalid stats object - no layers', t => {
  const stats = {
    layerCount: 1,
  };

  const results = validator(stats);
  t.equal(results.length, 1, 'only one error');
  t.equal(results[0], 'instance requires property "layers"', 'expected error message');
  t.end();
});

test('invalid layer object - no layer name', t => {
  const stats = {
    layerCount: 1,
    layers: [
      {
        count: 3,
        geometry: 'Point',
        attributeCount: 1,
        attributes: [
          {
            attribute: 'test-attribute',
            count: 3,
            type: 'number',
            values: [2, 5, 19],
            min: 2,
            max: 19,
          },
        ],
      },
    ],
  };

  const results = validator(stats);
  t.equal(results.length, 1, 'only one error');
  t.equal(results[0], 'instance.layers[0] requires property "layer"', 'expected error message');
  t.end();
});

test('invalid layer object - no layer name', t => {
  const stats = {
    layerCount: 'wrong type',
    layers: [
      {
        geometry: 'Point',
        attributes: [
          {
            attribute: 'test-attribute',
            type: 'number',
            min: 2,
            max: 19,
          },
        ],
      },
    ],
  };

  const expected = sloppySort([
    'instance.layerCount is not of a type(s) number',
    'instance.layers[0] requires property "count"',
    'instance.layers[0].attributes[0] requires property "values"',
    'instance.layers[0] requires property "layer"',
    'instance.layers[0].attributes[0] requires property "count"',
    'instance.layers[0] requires property "attributeCount"',
  ]);

  const results = validator(stats);
  t.same(sloppySort(results), expected, 'expect lots of errors');
  t.end();
});

test('invalid attributes contain mulitple types', t => {
  const stats = {
    layerCount: 1,
    layers: [
      {
        layer: 'test-layer',
        count: 3,
        geometry: 'Point',
        attributeCount: 1,
        attributes: [
          {
            attribute: 'test-attribute',
            count: 3,
            type: 'number',
            values: [2, 'five', null],
            min: 2,
            max: 19,
          },
        ],
      },
    ],
  };

  const results = validator(stats);
  t.equal(results.length, 1, 'only one error');
  t.equal(results[0], 'instance.layers[0].attributes[0].values is not any of [subschema 0],[subschema 1],[subschema 2],[subschema 3]', 'expected error message');
  t.end();
});
