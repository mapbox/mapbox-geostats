var gdal = require('gdal');

function translateGdalType(wkbType) {
  switch (wkbType) {
    case gdal.wkbGeometryCollection:
    case gdal.wkbGeometryCollection25D:
      return 'FeatureCollection';
    case gdal.wkbLinearRing:
    case gdal.wkbLinearRing25D:
    case gdal.wkbLineString:
    case gdal.wkbLineString25D:
      return 'LineString';
    case gdal.wkbMultiLineString:
    case gdal.wkbMultiLineString25D:
      return 'MultiLineString';
    case gdal.wkbPoint:
    case gdal.wkbPoint25D:
      return 'Point';
    case gdal.wkbMultiPoint:
    case gdal.wkbMultiPoint25D:
      return 'MultiPoint';
    case gdal.wkbPolygon:
    case gdal.wkbPolygon25D:
      return 'Polygon';
    case gdal.wkbMultiPolygon:
    case gdal.wkbMultiPolygon25D:
      return 'MultiPolygon';
    case gdal.wkbNone:
    case gdal.wkbUnknown:
    case gdal.wkb25DBit:
    default:
      return 'Unknown';
  }
}

module.exports = translateGdalType;
