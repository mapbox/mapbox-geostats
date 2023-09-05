'use strict';

const tilelive = require('@mapbox/tilelive');
const tiletype = require('@mapbox/tiletype');
const Transform = require('stream').Transform;
const MBTiles = require('@mapbox/mbtiles');
const zlib = require('zlib');
const mapboxVectorTile = require('@mapbox/vector-tile');
const Protobuf = require('pbf');
const createLayerStats = require('./create-layer-stats');
const registerFeature = require('./register-feature');
const registerAttributesMap = require('./register-attributes-map');
const typeIntegerToString = require('./type-integer-to-string');
const createStats = require('./create-stats');
const Constants = require('./constants');
const validator = require('./validate-stats');
const reportStats = require('./report-stats');

const VectorTile = mapboxVectorTile.VectorTile;

class TileAnalyzeStream extends Transform {
  constructor(processTile) {
    super();
    this.processTile = processTile;
    Transform.call(this, { objectMode: true });
  }

  _transform(data, enc, done) {
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
  }
}


/**
 * Returns stats about an MBTiles file.
 * Check if the tilestats object has been pre-generated in the mbtiles file.
 * If so, return that, otherwise generate it with analyzeSourceStream.
 *
 * @param {string} filePath
 * @param {Object} [options]
 * @param {Array<string>} [options.attributes]
 * @param {boolean} [options.intoMd]
 * @return {Object} The stats.
 */
module.exports = async function tileAnalyze(filePath, options) {
  const source = await getSource(filePath);

  const info = await getMetadata(source);
  if (info.tilestats && validator(info.tilestats)) {
    if (options.intoMd) throw new Error('Tilestats already exist in json record of metadata table, run without --into-md to display them');
    return info.tilestats;
  }

  const tilestats = await analyzeSourceStream(source, options);

  if (options.intoMd) {
    const report = reportStats(tilestats, options);
    const metadata = { tilestats: report };
    if (info.vector_layers) metadata.vector_layers = info.vector_layers;
    else console.warn('Missing vector_layers in metadata json!');
    try {
      await writeMetadata(source, metadata);
    } catch (err) {
      throw new Error('Error writing metadata: ' + err);
    }
    return report;
  }

  return tilestats;
};

/**
 * Write metadata into MBTiles file
 *
 * @param {MBTiles} mbtiles
 * @param {Object} metadata
 */
function writeMetadata(mbtiles, metadata) {
  return new Promise((resolve, reject) => {
    const jsonRow = { json: JSON.stringify(metadata) };
    mbtiles._isWritable = true;
    mbtiles.putInfo(jsonRow, function(err) {
      if (err) return reject(err);
      mbtiles.stopWriting(function(err) {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

function getMetadata(mbtiles) {
  return new Promise((resolve, reject) => {
    mbtiles.getInfo((err, info) => {
      if (err) reject(err);
      if (info && validator(info)) {
        return resolve(info);
      }
    });
  });
}

function getSource(filePath) {
  return new Promise((resolve, reject) => {
    new MBTiles(filePath, (err, source) => {
      if (err) return reject(err);
      resolve(source);
    });
  });
}

/**
 * Generate stats from an MBTiles file.
 *
 * @param {MBTiles} source
 * @param {Object} options
 * @returns {Object} The stats.
 */
async function analyzeSourceStream(source, options) {
  const stats = createStats();
  const layerMap = {};
  const zxyStream = source.createZXYStream();
  const readStream = tilelive.createReadStream(source, { type: 'list' });
  return new Promise((resolve, reject) => {
    zxyStream.on('error', reject)
      .pipe(readStream)
      .pipe(new TileAnalyzeStream((tile) => analyzeTile(tile, stats, layerMap, options)))
      .on('error', reject)
      .on('end', async() => {
        resolve(Object.assign(stats, {
          layers: Object.values(layerMap),
        }));
      })
      .resume();
  });
}

/**
 * Unzips and parses tile data, then analyzes each layer
 *
 * @param {Object} tile
 * @param {Object} stats
 * @param {Object} layerMap
 * @param {Object} options
 * @returns {Promise<any>}
 */
function analyzeTile(tile, stats, layerMap, options) {
  return new Promise((resolve, reject) => {
    zlib.gunzip(tile.buffer, (err, inflatedBuffer) => {
      // We'll get this error if the data was not gzipped.
      // So we'll just use the original data.
      if (err && err.errno === zlib.constants.Z_DATA_ERROR) {
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
      for (const layerName in vectorTile.layers) {
        if (Object.hasOwnProperty.call(vectorTile.layers, layerName)) {
          const layerData = vectorTile.layers[layerName];
          analyzeLayer(stats, layerData, layerName, layerMap, options);
        }
      }
      resolve();
    });
  });
}

function analyzeLayer(stats, layerData, rawLayerName, layerMap, options) {
  const layerName = rawLayerName.slice(0, Constants.NAME_TRUNCATE_LENGTH);
  if (layerMap[layerName] === undefined) {
    if (stats.layerCountSet.size > Constants.LAYERS_MAX_COUNT) return;
    stats.layerCountSet.add(layerName);

    if (stats.layerCountSet.size > Constants.LAYERS_MAX_REPORT) return;
    layerMap[layerName] = createLayerStats(layerName);
  }
  const layerStats = layerMap[layerName];
  for (let i = 0, l = layerData.length; i < l; i++) {
    analyzeFeature(stats, layerStats, layerData.feature(i), options);
  }
}

function analyzeFeature(stats, layerStats, feature, options) {
  registerFeature(layerStats, {
    type: typeIntegerToString(feature.type),
  });
  registerAttributesMap(stats, layerStats, options, feature.properties);
}
