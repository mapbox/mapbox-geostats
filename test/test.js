/* eslint-disable no-console */
var test = require('tape');
var path = require('path');
var fs = require('fs');
var Promise = require('pinkie-promise');
var geostats = require('../');

// var result = geostats(fixturePath('src/simple.geojson'));
// var result = geostats(fixturePath('src/ports/ports.shp'));
// var result = geostats(fixturePath('src/populations-plus.geojson'));
//
// result.then(function (stats) {
//   console.log(JSON.stringify(stats, null, 2));
// })
// .catch(function (err) {
//   console.error(err.stack);
// });

test('simple geojson', function (t) {
  Promise.all([
    geostats(fixturePath('src/simple.geojson')),
    promiseExpected('simple'),
  ]).then(function (output) {
    t.deepEqual(output[0], output[1]);
    t.end();
  }).catch(logError);
});

test('ports not-so-simple', function (t) {
  Promise.all([
    geostats(fixturePath('src/populations-plus.geojson')),
    promiseExpected('populations-plus'),
  ]).then(function (output) {
    t.deepEqual(output[0], output[1]);
    t.end();
  }).catch(logError);
});

test('ports shapefile', function (t) {
  Promise.all([
    geostats(fixturePath('src/ports/ports.shp')),
    promiseExpected('ports'),
  ]).then(function (output) {
    t.deepEqual(output[0], output[1]);
    t.end();
  }).catch(logError);
});

function fixturePath(fileName) {
  return path.join(__dirname, 'fixtures', fileName);
}

function logError(err) {
  console.error(err.stack);
}

function promiseExpected(name) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fixturePath(path.join('expected', name + '.json')), 'utf8', function (err, data) {
      if (err) return reject(err);
      resolve(JSON.parse(data));
    });
  });
}
