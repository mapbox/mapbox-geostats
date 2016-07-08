var test = require('tape');
var path = require('path');
var geostats = require('../');

geostats(fixture('simple.geojson'));

function fixture(fileName) {
  return path.join(__dirname, 'fixtures', fileName);
}
