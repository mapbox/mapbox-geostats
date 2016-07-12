var tilelive = require('tilelive');
var tiletype = require('tiletype');
var Transform = require('stream').Transform;
var util = require('util');
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
var createStats = require('./create-stats');
var Constants = require('./constants');

var VectorTile = mapboxVectorTile.VectorTile;

module.exports = function (filePath, options) {
  options = options || {};
  var stats = createStats();
  var layerMap = {};

  function TileAnalyzeStream() {
    Transform.call(this, { objectMode: true });
  }

  util.inherits(TileAnalyzeStream, Transform);

  TileAnalyzeStream.prototype._transform = function (data, enc, done) {
    // Duck-type the data to see if it's a tile
    if (data.x === undefined
      || data.y === undefined
      || data.z === undefined
      || data.buffer === undefined
      || tiletype.type(data.buffer) !== 'pbf') {
      return done();
    }
    analyzeTile(data).then(function () {
      done();
    }, done);
  };

  function getSource() {
    return new Promise(function (resolve, reject) {
      new MBTiles(filePath, function (err, source) {
        if (err) return reject(err);
        resolve(source);
      });
    });
  }

  function analyzeSourceStream(source) {
    return new Promise(function (resolve, reject) {
      var zxyStream = source.createZXYStream();
      var readStream = tilelive.createReadStream(source, { type: 'list' });
      zxyStream.pipe(readStream)
        .pipe(new TileAnalyzeStream())
        .on('error', reject)
        .on('end', function () {
          resolve(_.assign(stats, {
            layers: _.values(layerMap),
          }));
        })
        .resume();
    });
  }

  function analyzeTile(tile) {
    return new Promise(function (resolve, reject) {
      zlib.gunzip(tile.buffer, function (err, inflatedBuffer) {
        // We'll get this error if the data was not gzipped.
        // So we'll just use the original data.
        if (err && err.errno === zlib.Z_DATA_ERROR) {
          inflatedBuffer = tile.buffer;
        } else if (err) {
          return reject(err);
        }
        var vectorTile;
        try {
          vectorTile = new VectorTile(new Protobuf(inflatedBuffer));
        } catch (e) {
          // We'll get this error if the data cannot be interpreted as a vector tile.
          // We skip this in order to see if we can gather data from other tiles.
          if (e.message.indexOf('Unimplemented type') === 0) return resolve();
          return reject(e);
        }
        _.forOwn(vectorTile.layers, function (data, name) {
          analyzeLayer(name, data);
        });
        resolve();
      });
    });
  }

  function analyzeLayer(layerName, layerData) {
    if (layerMap[layerName] === undefined) {
      if (stats.layerCountSet.size > Constants.LAYERS_MAX_COUNT) return;
      stats.layerCountSet.add(layerName);

      if (stats.layerCountSet.size > Constants.LAYERS_MAX_REPORT) return;
      layerMap[layerName] = createLayerStats(layerName);
    }
    var layerStats = layerMap[layerName];
    for (var i = 0, l = layerData.length; i < l; i++) {
      analyzeFeature(layerStats, layerData.feature(i));
    }
  }

  function analyzeFeature(layerStats, feature) {
    registerFeature(layerStats, {
      type: typeIntegerToString(feature.type),
    });
    _.forOwn(feature.properties, function (value, name) {
      if (options.attributes && options.attributes.indexOf(name) === -1) return;
      registerAttribute(layerStats, name, value);
    });
  }

  return getSource(filePath).then(analyzeSourceStream);
};
