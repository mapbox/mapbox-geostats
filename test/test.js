var test = require('tape');
var path = require('path');
var geostats = require('../');

geostats(fixture('simple.geojson'))
// geostats(fixture('populations-plus.geojson'))
  .catch(function (err) {
    console.log(err);
  });

function fixture(fileName) {
  return path.join(__dirname, 'fixtures', fileName);
}
