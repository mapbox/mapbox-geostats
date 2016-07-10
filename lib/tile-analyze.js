var tilelive = require('tilelive');
var Promise = require('pinkie-promise');
var MBTiles = require('mbtiles');
var zlib = require('zlib');
var mapboxVectorTile = require('vector-tile');
var Protobuf = require('pbf');
var _ = require('lodash');
var createLayerStats = require('./create-layer-stats');
var registerFeature = require('./register-feature');
var registerAttribute = require('./register-attribute');
var typeIntegerToString = require('./type-integer-to-string');

var VectorTile = mapboxVectorTile.VectorTile;

MBTiles.registerProtocols(tilelive);

module.exports = function (filePath) {
  return getSource(filePath).then(analyzeSource);
};

function getSource(filePath) {
  return new Promise(function (resolve, reject) {
    new MBTiles(filePath, function (err, source) {
      if (err) return reject(err);
      resolve(source);
    });
  });
}

function analyzeSource(source) {
  var layerMap = {};

  return new Promise(function (resolve, reject) {
    var sourceStream = tilelive.createReadStream(source);
    var analyzed = [];

    sourceStream.on('data', function (tile) {
      analyzed.push(analyzeTile(tile));
    });
    sourceStream.on('error', reject);
    sourceStream.on('end', function () {
      Promise.all(analyzed).then(function () {
        resolve({ layers: _.values(layerMap) });
      }).catch(reject);
    });
  });

  function analyzeTile(tile) {
    return new Promise(function (resolve, reject) {
      // TODO: why am i doing this?
      if (!tilelive.verify(tile)) return resolve();
      zlib.gunzip(tile.buffer, function (err, inflatedBuffer) {
        if (err) return reject(err);
        var vectorTile = new VectorTile(new Protobuf(inflatedBuffer));
        _.forOwn(vectorTile.layers, analyzeLayer);
        resolve();
      });
    });
  }

  function analyzeLayer(layer, layerName) {
    if (layerMap[layerName] === undefined) {
      layerMap[layerName] = createLayerStats(layerName);
    }
    var layerStats = layerMap[layerName];
    for (var i = 0, l = layer.length; i < l; i++) {
      analyzeFeature(layerStats, layer.feature(i));
    }
  }
}

function analyzeFeature(layerStats, feature) {
  registerFeature(layerStats, { type: typeIntegerToString(feature.type) });
  _.forOwn(feature.properties, function (value, name) {
    registerAttribute(layerStats, name, value);
  });
}
