var fs = require('fs');
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
var registerAttributesMap = require('./register-attributes-map');
var typeIntegerToString = require('./type-integer-to-string');
var createStats = require('./create-stats');
var Constants = require('./constants');

var VectorTile = mapboxVectorTile.VectorTile;

function TileAnalyzeStream(processTile) {
  this.processTile = processTile;
  Transform.call(this, { objectMode: true });
}

util.inherits(TileAnalyzeStream, Transform);

TileAnalyzeStream.prototype._transform = function (data, enc, done) {
  // Duck-type the data to see if it's a tile
  if (data.x === undefined
    || data.y === undefined
    || data.z === undefined
    || data.buffer === undefined
    // Note that tiletype currently does not recognize non-gzipped PBFs
    || tiletype.type(data.buffer) !== 'pbf') {
    return done();
  }
  this.processTile(data).then(function () {
    done();
  }, done);
};

/**
 * Returns stats about an MBTiles file.
 *
 * @param {string} filePath
 * @param {Object} [options]
 * @param {Array<string>} [options.attributes]
 * @return {Object} The stats.
 */
module.exports = function (filePath, options) {
  options = options || {};
  var stats = createStats();
  var layerMap = {};

  function getSource() {
    return new Promise(function (resolve, reject) {
      fs.stat(filePath, function (statErr) {
        if (statErr) return reject(new Error('Cound not find ' + filePath));
        // We don't want to create a new file: only read an existing one.
        // So if this file does not exist, we need to error, not create it.
        new MBTiles(filePath, function (err, source) {
          if (err) return reject(err);
          resolve(source);
        });
      });
    });
  }

  function analyzeSourceStream(source) {
    return new Promise(function (resolve, reject) {
      var zxyStream = source.createZXYStream();
      var readStream = tilelive.createReadStream(source, { type: 'list' });
      zxyStream.on('error', reject)
        .pipe(readStream)
        .pipe(new TileAnalyzeStream(analyzeTile))
        .on('error', reject)
        .on('end', function () {
          resolve(_.assign(stats, {
            layers: _.values(layerMap),
          }));
        })
        .resume();
    });
  }

  // Unzips and parses tile data, then analyzes each layer
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
        _.forOwn(vectorTile.layers, analyzeLayer);
        resolve();
      });
    });
  }

  function analyzeLayer(layerData, layerName) {
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
    registerAttributesMap(layerStats, options, feature.properties);
  }

  return getSource(filePath).then(analyzeSourceStream);
};
