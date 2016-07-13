var test = require('tap').test;
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
    t.deepEqual(output, { layerCount: 0, layers: [] }, 'expected output');
    t.end();
  }).catch(t.threw);
});

test('GeoJSON with over 1000 unique attributes', function (t) {
  Promise.all([
    geostats(fixturePath('src/two-thousand-properties.geojson')),
    getExpected('two-thousand-properties'),
  ]).then(function (output) {
    t.deepEqual(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
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
    t.deepEqual(output, { layerCount: 0, layers: [] }, 'expected output');
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

test('Shapefile with specified attribute', function (t) {
  Promise.all([
    geostats(fixturePath('src/ports/ports.shp'), {
      attributes: ['name'],
    }),
    getExpected('ports-only-name'),
  ]).then(function (output) {
    t.deepEqual(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
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
