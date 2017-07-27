'use strict';

const tilelive = require('@mapbox/tilelive');
const tiletype = require('@mapbox/tiletype');
const Transform = require('stream').Transform;
const util = require('util');
const MBTiles = require('@mapbox/mbtiles');
const zlib = require('zlib');
const mapboxVectorTile = require('@mapbox/vector-tile');
const Protobuf = require('pbf');
const _ = require('lodash');
const createLayerStats = require('./create-layer-stats');
const registerFeature = require('./register-feature');
const registerAttributesMap = require('./register-attributes-map');
const typeIntegerToString = require('./type-integer-to-string');
const createStats = require('./create-stats');
const Constants = require('./constants');
const validator = require('./validate-stats');

const VectorTile = mapboxVectorTile.VectorTile;

function TileAnalyzeStream(processTile) {
  this.processTile = processTile;
  Transform.call(this, { objectMode: true });
}

util.inherits(TileAnalyzeStream, Transform);

TileAnalyzeStream.prototype._transform = function(data, enc, done) {
  // Duck-type the data to see if it's a tile
  if (data.x === undefined
    || data.y === undefined
    || data.z === undefined
    || data.buffer === undefined
    // Note that tiletype currently does not recognize non-gzipped PBFs
    || tiletype.type(data.buffer) !== 'pbf') {
    return done();
  }
  this.processTile(data).then(() => {
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
module.exports = function(filePath, options) {
  options = options || {};
  const stats = createStats();
  const layerMap = {};

  function getSource() {
    return new Promise((resolve, reject) => {
      new MBTiles(filePath, (err, source) => {
        if (err) return reject(err);
        resolve(source);
      });
    });
  }

  function analyzeSourceStream(source) {
    return new Promise((resolve, reject) => {

      // check if the tilestats object has been pre-generated in the mbtiles file
      // if so, return that, otherwise generate it it with analyzeSourceStream
      source.getInfo((err, info) => {
        if (err) reject(err);
        if (info.tilestats && validator(info.tilestats)) resolve(info.tilestats);

        const zxyStream = source.createZXYStream();
        const readStream = tilelive.createReadStream(source, { type: 'list' });
        zxyStream.on('error', reject)
          .pipe(readStream)
          .pipe(new TileAnalyzeStream(analyzeTile))
          .on('error', reject)
          .on('end', () => {
            resolve(Object.assign(stats, {
              layers: _.values(layerMap),
            }));
          })
          .resume();
      });
    });
  }

  // Unzips and parses tile data, then analyzes each layer
  function analyzeTile(tile) {
    return new Promise((resolve, reject) => {
      zlib.gunzip(tile.buffer, (err, inflatedBuffer) => {
        // We'll get this error if the data was not gzipped.
        // So we'll just use the original data.
        if (err && err.errno === zlib.Z_DATA_ERROR) {
          inflatedBuffer = tile.buffer;
        } else if (err) {
          return reject(err);
        }
        let vectorTile;
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

  function analyzeLayer(layerData, rawLayerName) {
    const layerName = rawLayerName.slice(0, Constants.NAME_TRUNCATE_LENGTH);
    if (layerMap[layerName] === undefined) {
      if (stats.layerCountSet.size > Constants.LAYERS_MAX_COUNT) return;
      stats.layerCountSet.add(layerName);

      if (stats.layerCountSet.size > Constants.LAYERS_MAX_REPORT) return;
      layerMap[layerName] = createLayerStats(layerName);
    }
    const layerStats = layerMap[layerName];
    for (let i = 0, l = layerData.length; i < l; i++) {
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
