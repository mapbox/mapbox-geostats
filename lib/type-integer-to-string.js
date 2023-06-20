'use strict';

// Copied from https://github.com/mapnik/mapnik/blob/v3.0.11/include/mapnik/geometry_types.hpp

module.exports = function(mapnikType) {
  switch (mapnikType) {
  case 1:
    return 'Point';
  case 2:
    return 'LineString';
  case 3:
    return 'Polygon';
  case 4:
    return 'MultiPoint';
  case 5:
    return 'MultiLineString';
  case 6:
    return 'MultiPolygon';
  case 7:
    return 'GeometryCollection';
  case 0:
  default:
    return 'Unknown';
  }
};
