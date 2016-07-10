var test = require('tap').test;
var path = require('path');
var fs = require('fs');
var Promise = require('pinkie-promise');
var geostats = require('../');

// var result = geostats(fixturePath('src/simple.geojson'));
// var result = geostats(fixturePath('src/ports/ports.shp'));
// var result = geostats(fixturePath('src/populations-plus.geojson'));
// var result = geostats(fixturePath('src/valid-vectorgzip.mbtiles'));
// var result = geostats(fixturePath('src/twolayers.mbtiles'));
// var result = geostats(fixturePath('src/038.mbtiles'));
// var result = geostats(fixturePath('src/pngs.mbtiles')); /* raster I think */
// var result = geostats(fixturePath('src/plain_2.mbtiles')); /* not working */
// var result = geostats(fixturePath('src/plain_3.mbtiles')); /* not working */
// var result = geostats(fixturePath('src/plain_4.mbtiles')); /* not working */
// var result = geostats(fixturePath('src/unindexed.mbtiles')); /* not working */
// var result = geostats(fixturePath('src/some-empty-tiles.mbtiles')); /* not working */
// var result = geostats(fixturePath('src/with spaces.mbtiles')); /* not working */

// result.then(function (stats) {
//   console.log(JSON.stringify(stats, null, 2))
// }).catch(logError);

test('simple geojson', function (t) {
  Promise.all([
    geostats(fixturePath('src/simple.geojson')),
    getExpected('simple'),
  ]).then(function (output) {
    t.deepEqual(output[0], output[1]);
    t.end();
  }).catch(logError);
});

test('ports not-so-simple', function (t) {
  Promise.all([
    geostats(fixturePath('src/populations-plus.geojson')),
    getExpected('populations-plus'),
  ]).then(function (output) {
    t.deepEqual(output[0], output[1]);
    t.end();
  }).catch(logError);
});

test('ports shapefile', function (t) {
  Promise.all([
    geostats(fixturePath('src/ports/ports.shp')),
    getExpected('ports'),
  ]).then(function (output) {
    t.deepEqual(output[0], output[1]);
    t.end();
  }).catch(logError);
});

test('gzipped mbtiles', function (t) {
  Promise.all([
    geostats(fixturePath('src/valid-vectorgzip.mbtiles')),
    getExpected('valid-vectorgzip'),
  ]).then(function (output) {
    t.deepEqual(output[0], output[1]);
    t.end();
  }).catch(logError);
});

test('more gzipped mbtiles', function (t) {
  Promise.all([
    geostats(fixturePath('src/twolayers.mbtiles')),
    getExpected('twolayers'),
  ]).then(function (output) {
    t.deepEqual(output[0], output[1]);
    t.end();
  }).catch(logError);
});

function fixturePath(fileName) {
  return path.join(__dirname, 'fixtures', fileName);
}

function logError(err) {
  console.log(err.stack); // eslint-disable-line no-console
}

function getExpected(name) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fixturePath(path.join('expected', name + '.json')), 'utf8', function (err, data) {
      if (err) return reject(err);
      resolve(JSON.parse(data));
    });
  });
}
