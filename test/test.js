var test = require('tap').test;
var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var Promise = require('pinkie-promise');
var sloppySort = require('./utils/sloppy-sort');
var geostats = require('../');

function fixturePath(fileName) {
  return path.join(__dirname, 'fixtures', fileName);
}

function getExpected(name) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fixturePath(path.join('expected', name + '.json')), 'utf8', function (err, data) {
      if (err) return reject(err);
      resolve(JSON.parse(data));
    });
  });
}

test('Errors without a file path', function (t) {
  geostats().then(function () {
    t.fail('should have errored');
    t.end();
  }).catch(function (err) {
    t.ok(err, 'errored');
    t.end();
  });
});

test('Errors when MBTiles file not found', function (t) {
  geostats(fixturePath('doodoodoo.mbtiles')).then(function () {
    t.fail('should have errored');
    t.end();
  }).catch(function (err) {
    t.ok(err, 'errored');
    t.end();
  });
});

test('Errors when Mapnik-interpreted file not found', function (t) {
  geostats(fixturePath('doodoodoo.csv')).then(function () {
    t.fail('should have errored');
    t.end();
  }).catch(function (err) {
    t.ok(err, 'errored');
    t.end();
  });
});

test('GeoJSON with many value types, input matching MBTiles', function (t) {
  Promise.all([
    geostats(fixturePath('src/many-types.geojson')),
    getExpected('many-types-geojson'),
  ]).then(function (output) {
    t.deepEqual(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

// Key difference between the MBTiles and the GeoJSON output now
// is that when Mapnik reads the GeoJSON it inserts `null` values
// in weird places
test('MBTiles with many value types, input matching GeoJSON', function (t) {
  Promise.all([
    geostats(fixturePath('src/many-types.mbtiles')),
    getExpected('many-types-mbtiles'),
  ]).then(function (output) {
    t.deepEqual(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

test('GeoJSON with over 100 unique attributes and values, input matching Shapefile and CSV',
  function (t) {
    Promise.all([
      geostats(fixturePath('src/populations-plus.geojson')),
      getExpected('populations-plus-geojson'),
    ]).then(function (output) {
      t.deepEqual(output[0], output[1], 'expected output');
      t.end();
    }).catch(t.threw);
  }
);

// Key difference between the Shapefile and the GeoJSON output right now
// seems to be that the shapefile has converted `null` to `""` in
// predominantly string-valued attributes
test('Shapefile with over 100 unique attributes and values, input matching GeoJSON and CSV',
  function (t) {
    Promise.all([
      geostats(fixturePath('src/populations-plus/populations-plus.shp')),
      getExpected('populations-plus-shp'),
    ]).then(function (output) {
      t.deepEqual(output[0], output[1], 'expected output');
      t.end();
    }).catch(t.threw);
  }
);

// Key difference between the CSV and Shapefile and GeoJSON is that it
// includes X and Y attributes (it also converts `null` to `""`, like Shapefile)
test('CSV with over 100 unique attributes and values, input matching GeoJSON and Shapefile',
  function (t) {
    Promise.all([
      geostats(fixturePath('src/populations-plus.csv')),
      getExpected('populations-plus-csv'),
    ]).then(function (output) {
      t.deepEqual(output[0], output[1], 'expected output');
      t.end();
    }).catch(t.threw);
  }
);

test('Shapefile with over 1000 unique values', function (t) {
  Promise.all([
    geostats(fixturePath('src/ports/ports.shp')),
    getExpected('ports'),
  ]).then(function (output) {
    t.deepEqual(output[0], output[1], 'expected output');
    t.end();
  }).catch(t.threw);
});

test('MBTiles with gzipped data', function (t) {
  Promise.all([
    geostats(fixturePath('src/vectorgzip.mbtiles')),
    getExpected('vectorgzip'),
  ]).then(function (output) {
    t.deepEqual(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

test('MBTiles with raster data', function (t) {
  geostats(fixturePath('src/pngs.mbtiles')).then(function (output) {
    t.deepEqual(output, { layerCount: 0, layers: [] }, 'empty output');
    t.end();
  }).catch(t.threw);
});

test('GeoJSON with over 1000 unique attributes', function (t) {
  Promise.all([
    geostats(fixturePath('src/two-thousand-properties.geojson')),
    getExpected('two-thousand-properties'),
  ]).then(function (output) {
    var actual = sloppySort(output[0]);
    t.deepEqual(actual, sloppySort(output[1]), 'expected output');
    t.equal(actual.layers[0].attributeCount, 1000, 'attributeCount stops at 1000');
    t.equal(actual.layers[0].attributes.length, 100, 'attribute details stop at 100');
    t.end();
  }).catch(t.threw);
});

test('GeoJSON with many geometry types', function (t) {
  Promise.all([
    geostats(fixturePath('src/geometry-extravaganza.geojson')),
    getExpected('geometry-extravaganza'),
  ]).then(function (output) {
    t.deepEqual(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

test('MBTiles with no features', function (t) {
  geostats(fixturePath('src/no-features.mbtiles')).then(function (output) {
    t.deepEqual(output, { layerCount: 0, layers: [] }, 'empty output');
    t.end();
  }).catch(t.threw);
});

test('Shapefile with no features', function (t) {
  Promise.all([
    geostats(fixturePath('src/no-features/no-features.shp')),
    getExpected('no-features'),
  ]).then(function (output) {
    t.deepEqual(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

test('CSV with no features', function (t) {
  Promise.all([
    geostats(fixturePath('src/no-features.csv')),
    getExpected('no-features'),
  ]).then(function (output) {
    t.deepEqual(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

// Currently this is blocked by a bug in node-mapnik
//
// test('geojson with no features', function (t) {
//   geostats(fixturePath('src/no-features.geojson')).then(function (output) {
//     t.deepEqual(output, { layerCount: 0, layers: [] }, 'expected output');
//     t.end();
//   }).catch(t.threw);
// });

test('invalid GeoJSON', function (t) {
  geostats(fixturePath('src/invalid.geojson')).then(function () {
    t.fail('should have errored');
    t.end();
  }).catch(function (err) {
    t.ok(err, 'errored');
    t.end();
  });
});

test('invalid Shapefile', function (t) {
  geostats(fixturePath('src/invalid.shp')).then(function () {
    t.fail('should have errored');
    t.end();
  }).catch(function (err) {
    t.ok(err, 'errored');
    t.end();
  });
});

test('invalid CSV', function (t) {
  geostats(fixturePath('src/invalid.csv')).then(function () {
    t.fail('should have errored');
    t.end();
  }).catch(function (err) {
    t.ok(err, 'errored');
    t.end();
  });
});

test('invalid MBTiles', function (t) {
  geostats(fixturePath('src/invalid.mbtiles')).then(function () {
    t.fail('should have errored');
    t.end();
  }).catch(function (err) {
    t.ok(err, 'errored');
    t.end();
  });
});

test('invalid file format', function (t) {
  geostats(fixturePath('src/invalid.txt')).then(function () {
    t.fail('should have errored');
    t.end();
  }).catch(function (err) {
    t.ok(err, 'errored');
    t.end();
  });
});

test('Shapefile with specified attribute with over 1000 values', function (t) {
  Promise.all([
    geostats(fixturePath('src/ports/ports.shp'), {
      attributes: ['name'],
    }),
    getExpected('ports-only-name'),
  ]).then(function (output) {
    var actual = sloppySort(output[0]);
    t.deepEqual(actual, sloppySort(output[1]), 'expected output');
    var nameAttribute = _.find(actual.layers[0].attributes, function (attribute) {
      return attribute.attribute === 'name';
    });
    t.equal(nameAttribute.count, 1042, 'value count did not stop at 1000');
    t.equal(nameAttribute.values.length, 1042, 'value details did not stop at 100');
    t.end();
  }).catch(t.threw);
});

test('GeoJSON with specified attributes', function (t) {
  Promise.all([
    geostats(fixturePath('src/two-thousand-properties.geojson'), {
      attributes: ['prop-21', 'prop-1031'],
    }),
    getExpected('two-thousand-properties-only-two'),
  ]).then(function (output) {
    t.deepEqual(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

test('GeoJSON with over 10000 unique values and no specified attributes', function (t) {
  Promise.all([
    geostats(fixturePath('src/myriad-values.geojson')),
    getExpected('myriad-values-all-attrs'),
  ]).then(function (output) {
    var actual = sloppySort(output[1]);
    t.deepEqual(sloppySort(output[0]), actual, 'expected output');
    t.ok(actual.layers[0].attributes.every(function (attribute) {
      return attribute.count === 1000;
    }), 'value counts stop at 1000');
    t.ok(actual.layers[0].attributes.every(function (attribute) {
      return attribute.values.length === 100;
    }), 'value details stop at 100');
    t.end();
  }).catch(t.threw);
});

test('GeoJSON with over 10000 unique values and one specified attribute', function (t) {
  Promise.all([
    geostats(fixturePath('src/myriad-values.geojson'), {
      attributes: ['prop-3'],
    }),
    getExpected('myriad-values-1-attr'),
  ]).then(function (output) {
    var actual = sloppySort(output[1]);
    t.deepEqual(sloppySort(output[0]), actual, 'expected output');
    t.ok(actual.layers[0].attributes.every(function (attribute) {
      return attribute.count === 10010;
    }), 'value count does not stop yet');
    t.ok(actual.layers[0].attributes.every(function (attribute) {
      return attribute.values.length === 10000;
    }), 'value details stop at 10000');
    t.end();
  }).catch(t.threw);
});

test('GeoJSON with over 10000 unique values and five specified attribute', function (t) {
  Promise.all([
    geostats(fixturePath('src/myriad-values.geojson'), {
      attributes: ['prop-1', 'prop-2', 'prop-3', 'prop-4', 'prop-5'],
    }),
    getExpected('myriad-values-5-attrs'),
  ]).then(function (output) {
    var actual = sloppySort(output[1]);
    t.deepEqual(sloppySort(output[0]), actual, 'expected output');
    t.ok(actual.layers[0].attributes.every(function (attribute) {
      return attribute.count === 10010;
    }), 'value counts does not stop yet');
    t.ok(actual.layers[0].attributes.every(function (attribute) {
      return attribute.values.length === 2000;
    }), 'value details stop at 2000');
    t.end();
  }).catch(t.threw);
});

test('Trying to report on more than 100 attributes', function (t) {
  t.throws(function () {
    geostats(fixturePath('src/populations-plus.geojson'), {
      attributes: ['attr-0', 'attr-1', 'attr-2', 'attr-3', 'attr-4', 'attr-5',
      'attr-6', 'attr-7', 'attr-8', 'attr-9', 'attr-10', 'attr-11', 'attr-12',
      'attr-13', 'attr-14', 'attr-15', 'attr-16', 'attr-17', 'attr-18', 'attr-19',
      'attr-20', 'attr-21', 'attr-22', 'attr-23', 'attr-24', 'attr-25', 'attr-26',
      'attr-27', 'attr-28', 'attr-29', 'attr-30', 'attr-31', 'attr-32', 'attr-33',
      'attr-34', 'attr-35', 'attr-36', 'attr-37', 'attr-38', 'attr-39', 'attr-40',
      'attr-41', 'attr-42', 'attr-43', 'attr-44', 'attr-45', 'attr-46', 'attr-47',
      'attr-48', 'attr-49', 'attr-50', 'attr-51', 'attr-52', 'attr-53', 'attr-54',
      'attr-55', 'attr-56', 'attr-57', 'attr-58', 'attr-59', 'attr-60', 'attr-61',
      'attr-62', 'attr-63', 'attr-64', 'attr-65', 'attr-66', 'attr-67', 'attr-68',
      'attr-69', 'attr-70', 'attr-71', 'attr-72', 'attr-73', 'attr-74', 'attr-75',
      'attr-76', 'attr-77', 'attr-78', 'attr-79', 'attr-80', 'attr-81', 'attr-82',
      'attr-83', 'attr-84', 'attr-85', 'attr-86', 'attr-87', 'attr-88', 'attr-89',
      'attr-90', 'attr-91', 'attr-92', 'attr-93', 'attr-94', 'attr-95', 'attr-96',
      'attr-97', 'attr-98', 'attr-99', 'attr-100', 'attr-101', 'attr-102',
      'attr-103', 'attr-104', 'attr-105', 'attr-106', 'attr-107', 'attr-108',
      'attr-109'],
    });
  }, 'throws');
  t.end();
});

test('GeoJSON with prototype attribute', function (t) {
  Promise.all([
    geostats(fixturePath('src/prototype.geojson')),
    getExpected('prototype'),
  ]).then(function (output) {
    t.deepEqual(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});
