'use strict';

const t = require('tap');
const path = require('path');
const fs = require('fs').promises;
const sloppySort = require('./utils/sloppy-sort');
const geostats = require('../');

function fixturePath(fileName) {
  return path.join(__dirname, 'fixtures', fileName);
}

async function getExpected(name) {
  const data = await fs.readFile(
    fixturePath(path.join('expected', name + '.json')),
    'utf8',
  );
  return JSON.parse(data);
}

let tmpPath;

t.before(async() => {
  tmpPath = await fs.mkdtemp(fixturePath('tmp-'));
  return tmpPath;
});

t.teardown(() => fs.rm(tmpPath, { recursive: true }));

t.test('Errors without a file path', t => {
  geostats().then(() => {
    t.fail('should have errored');
    t.end();
  }).catch(err => {
    t.ok(err, 'errored');
    t.end();
  });
});

t.test('Errors when MBTiles file not found', t => {
  geostats(fixturePath('doodoodoo.mbtiles')).then(() => {
    t.fail('should have errored');
    t.end();
  }).catch(err => {
    t.ok(err, 'errored');
    t.end();
  });
});

t.test('Errors when Mapnik-interpreted file not found', t => {
  geostats(fixturePath('doodoodoo.csv')).then(() => {
    t.fail('should have errored');
    t.end();
  }).catch(err => {
    t.ok(err, 'errored');
    t.end();
  });
});

t.test('GeoJSON with many value types, input matching MBTiles, forceAllAttributes', t => {
  Promise.all([
    geostats(fixturePath('src/many-types.geojson'), { forceAllAttributes: true, ignoreTranslations: true }),
    getExpected('many-types-geojson'),
  ]).then((output) => {
    t.same(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

t.test('GeoJSON, ignoreTranslations to false, briefAttributes to power, addLanguages to true', t => {
  Promise.all([
    geostats(fixturePath('src/many-types.geojson'), { briefAttributes: 'power', addLanguages: true }),
    getExpected('many-types-geojson-translations'),
  ]).then((output) => {
    t.same(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

// Key difference between the MBTiles and the GeoJSON output now
// is that when Mapnik reads the GeoJSON it inserts `null` values
// in weird places
t.test('MBTiles with many value types, input matching GeoJSON', t => {
  Promise.all([
    geostats(fixturePath('src/many-types.mbtiles')),
    getExpected('many-types-mbtiles'),
  ]).then((output) => {
    t.same(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

t.test('GeoJSON with over 100 unique attributes and values, input matching Shapefile and CSV',
  t => {
    Promise.all([
      geostats(fixturePath('src/populations-plus.geojson')),
      getExpected('populations-plus-geojson'),
    ]).then((output) => {
      t.same(output[0], output[1], 'expected output');
      t.end();
    }).catch(t.threw);
  },
);

// Key difference between the Shapefile and the GeoJSON output right now
// seems to be that the shapefile has converted `null` to `""` in
// predominantly string-valued attributes
t.test('Shapefile with over 100 unique attributes and values, input matching GeoJSON and CSV',
  t => {
    Promise.all([
      geostats(fixturePath('src/populations-plus/populations-plus.shp')),
      getExpected('populations-plus-shp'),
    ]).then((output) => {
      t.same(output[0], output[1], 'expected output');
      t.end();
    }).catch(t.threw);
  },
);

// Key difference between the CSV and Shapefile and GeoJSON is that it
// includes X and Y attributes (it also converts `null` to `""`, like Shapefile)
t.test('CSV with over 100 unique attributes and values, input matching GeoJSON and Shapefile',
  t => {
    Promise.all([
      geostats(fixturePath('src/populations-plus.csv')),
      getExpected('populations-plus-csv'),
    ]).then((output) => {
      t.same(output[0], output[1], 'expected output');
      t.end();
    }).catch(t.threw);
  },
);

t.test('MBTiles with gzipped data', t => {
  Promise.all([
    geostats(fixturePath('src/vectorgzip.mbtiles')),
    getExpected('vectorgzip'),
  ]).then((output) => {
    t.same(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

t.test('MBTiles with raster data', t => {
  geostats(fixturePath('src/pngs.mbtiles')).then((output) => {
    t.same(output, { layerCount: 0, layers: [] }, 'empty output');
    t.end();
  }).catch(t.threw);
});

t.test('GeoJSON with over 1000 unique attributes', t => {
  Promise.all([
    geostats(fixturePath('src/two-thousand-properties.geojson')),
    getExpected('two-thousand-properties'),
  ]).then((output) => {
    const actual = sloppySort(output[0]);
    t.same(actual, sloppySort(output[1]), 'expected output');
    t.equal(actual.layers[0].attributeCount, 1000, 'attributeCount stops at 1000');
    t.equal(actual.layers[0].attributes.length, 100, 'attribute details stop at 100');
    t.end();
  }).catch(t.threw);
});

t.test('GeoJSON with many geometry types', t => {
  Promise.all([
    geostats(fixturePath('src/geometry-extravaganza.geojson')),
    getExpected('geometry-extravaganza'),
  ]).then((output) => {
    t.same(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

t.test('MBTiles with no features', t => {
  geostats(fixturePath('src/no-features.mbtiles')).then((output) => {
    t.same(output, { layerCount: 0, layers: [] }, 'empty output');
    t.end();
  }).catch(t.threw);
});

t.test('Shapefile with no features', t => {
  Promise.all([
    geostats(fixturePath('src/no-features/no-features.shp')),
    getExpected('no-features'),
  ]).then((output) => {
    t.same(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

t.test('CSV with no features', t => {
  Promise.all([
    geostats(fixturePath('src/no-features.csv')),
    getExpected('no-features'),
  ]).then((output) => {
    t.same(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

// Currently this is blocked by a bug in node-mapnik
t.skip('GeoJSON with no features still outputs', t => {
  geostats(fixturePath('src/no-features.geojson')).then((output) => {
    const expected = {
      layerCount: 1,
      layers: [
        {
          attributeCount: 0,
          attributes: [],
          count: 0,
          layer: 'no-features',
        },
      ],
    };
    t.same(output, expected, 'expected output');
    t.end();
  }).catch(t.threw);
});

t.test('invalid GeoJSON', t => {
  geostats(fixturePath('src/invalid.geojson')).then(() => {
    t.fail('should have errored');
    t.end();
  }).catch(err => {
    t.ok(err, 'errored');
    t.end();
  });
});

t.test('GeoJSON skips invalid geometry types', t => {
  Promise.all([
    geostats(fixturePath('src/geometry-invalid-types.geojson')),
    getExpected('geojson-invalid-geometry-types'),
  ]).then((output) => {
    t.same(output[0], output[1], 'expected geostats');
    t.end();
  }).catch((err) => {
    t.fail(err);
  });
});

t.test('invalid Shapefile', t => {
  geostats(fixturePath('src/invalid.shp')).then(() => {
    t.fail('should have errored');
    t.end();
  }).catch(err => {
    t.ok(err, 'errored');
    t.end();
  });
});

t.test('invalid CSV', t => {
  geostats(fixturePath('src/invalid.csv')).then(() => {
    t.fail('should have errored');
    t.end();
  }).catch(err => {
    t.ok(err, 'errored');
    t.end();
  });
});

t.test('invalid MBTiles', t => {
  geostats(fixturePath('src/invalid.mbtiles')).then(() => {
    t.fail('should have errored');
    t.end();
  }).catch(err => {
    t.ok(err, 'errored');
    t.end();
  });
});

t.test('invalid file format', t => {
  geostats(fixturePath('src/invalid.txt')).then(() => {
    t.fail('should have errored');
    t.end();
  }).catch(err => {
    t.ok(err, 'errored');
    t.end();
  });
});

t.test('GeoJSON with specified name attribute', t => {
  Promise.all([
    geostats(fixturePath('src/many-types.geojson'), {
      attributes: ['name'],
    }),
    getExpected('many-types-geojson-name-only'),
  ]).then((output) => {
    const actual = sloppySort(output[0]);
    t.same(actual, sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

t.test('GeoJSON with specified attributes', t => {
  Promise.all([
    geostats(fixturePath('src/two-thousand-properties.geojson'), {
      attributes: ['prop-21', 'prop-1031'],
    }),
    getExpected('two-thousand-properties-only-two'),
  ]).then((output) => {
    t.same(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

t.test('Trying to report on more than 100 attributes', t => {
  t.rejects(geostats(fixturePath('src/populations-plus.geojson'), {
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
    }), new Error('Cannot report on more than 100 attributes'),
  );
  t.end();
});

t.test('GeoJSON with prototype attribute', t => {
  Promise.all([
    geostats(fixturePath('src/prototype.geojson')),
    getExpected('prototype'),
  ]).then((output) => {
    t.same(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

t.test('truncate attribute names', t => {
  Promise.all([
    geostats(fixturePath('src/long-attribute-names.geojson')),
    getExpected('long-attribute-names'),
  ]).then((output) => {
    t.same(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

t.test('MBTiles with two layers', t => {
  Promise.all([
    geostats(fixturePath('src/two-layers.mbtiles')),
    getExpected('two-layers'),
  ]).then((output) => {
    t.same(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

t.test('MBTiles with tilestats metadata table returns as expected', t => {
  Promise.all([
    geostats(fixturePath('src/tilestats.mbtiles')),
    getExpected('tilestats'),
  ]).then((output) => {
    t.same(sloppySort(output[0]), sloppySort(output[1]), 'expected output');
    t.end();
  }).catch(t.threw);
});

t.test('option --into-md with non MBTiles file', t => {
  t.rejects(
    geostats(fixturePath('src/many-types.geojson'), { intoMd: true }),
    new Error('Option --into-md can be used only for mbtiles'),
  );
  t.end();
});

t.test('MBTiles with option --into-md', async(t) => {
  const tmpFilename = path.join(tmpPath, 'many-types.mbtiles');
  await fs.copyFile(fixturePath('src/many-types.mbtiles'), tmpFilename);

  const [act, exp] = await Promise.all([
    geostats(tmpFilename, { intoMd: true }),
    getExpected('many-types-mbtiles'),
  ]);
  t.same(sloppySort(act), sloppySort(exp), 'expected output');

  t.rejects(
    geostats(tmpFilename, { intoMd: true }),
    new Error('Tilestats already exist in json record of metadata table, run without --into-md to display them'),
  );

  const preGenStats = await geostats(tmpFilename);
  t.same(sloppySort(preGenStats), sloppySort(exp), 'expected output');
  t.end();
});
