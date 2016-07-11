var test = require('tap').test;
var path = require('path');
var fs = require('fs');
var Promise = require('pinkie-promise');
var geostats = require('../');

// var result = geostats(fixturePath('src/simple.geojson'));
// var result = geostats(fixturePath('src/ports/ports.shp'));
// var result = geostats(fixturePath('src/populations-plus.geojson'));
// var result = geostats(fixturePath('src/vectorgzip.mbtiles'));
// var result = geostats(fixturePath('src/twolayers.mbtiles'));
// var result = geostats(fixturePath('src/pngs.mbtiles')); /* raster I think */
var result = geostats(fixturePath('src/simple.mbtiles'), {
  attributes: ['astonishing'],
});
//
result.then(function (stats) {
  console.log(JSON.stringify(stats, null, 2))
}).catch(logError);

// test('simple geojson', function (t) {
//   Promise.all([
//     geostats(fixturePath('src/simple.geojson')),
//     getExpected('simple-geojson'),
//   ]).then(function (output) {
//     t.deepEqual(output[0], output[1]);
//     t.end();
//   }).catch(logError);
// });
//
// test('simple mbtiles', function (t) {
//   Promise.all([
//     geostats(fixturePath('src/simple.mbtiles')),
//     getExpected('simple-mbtiles'),
//   ]).then(function (output) {
//     t.deepEqual(output[0], output[1]);
//     t.end();
//   }).catch(logError);
// });
//
// test('not-so-simple geojson', function (t) {
//   Promise.all([
//     geostats(fixturePath('src/populations-plus.geojson')),
//     getExpected('populations-plus'),
//   ]).then(function (output) {
//     t.deepEqual(output[0], output[1]);
//     t.end();
//   }).catch(logError);
// });
//
// test('shapefile', function (t) {
//   Promise.all([
//     geostats(fixturePath('src/ports/ports.shp')),
//     getExpected('ports'),
//   ]).then(function (output) {
//     t.deepEqual(output[0], output[1]);
//     t.end();
//   }).catch(logError);
// });
//
// test('gzipped mbtiles', function (t) {
//   Promise.all([
//     geostats(fixturePath('src/vectorgzip.mbtiles')),
//     getExpected('vectorgzip'),
//   ]).then(function (output) {
//     t.deepEqual(output[0], output[1]);
//     t.end();
//   }).catch(logError);
// });
//
// test('more gzipped mbtiles', function (t) {
//   Promise.all([
//     geostats(fixturePath('src/twolayers.mbtiles')),
//     getExpected('twolayers'),
//   ]).then(function (output) {
//     t.deepEqual(output[0], output[1]);
//     t.end();
//   }).catch(logError);
// });
//
// test('mbtiles with no features', function (t) {
//   geostats(fixturePath('src/no-features.mbtiles')).then(function (output) {
//     t.deepEqual(output, { layers: [] });
//     t.end();
//   }).catch(logError);
// });

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
