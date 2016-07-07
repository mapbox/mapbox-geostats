# mapbox-geostats

Generate statistics about geodata.

The initial plan:

- A CLI and Node API that take source files with geographic data as input and produce statistics about that data as output.
- Supported input formats:
  - GeoJSON
  - shapefiles
  - mbtiles
- Output format will match [tile-stat-stream](https://github.com/mapbox/tile-stat-stream#output)'s.
- We can use [tile-stat-stream](https://github.com/mapbox/tile-stat-stream) to deal with mbtiles. 
- We'll use gdal or mapnik to parse and analyze GeoJSON and shapefiles.

Some anticipated problems:

- Handling large input files.
- Limiting the generation and output of theoretically unlimited data, like fields and values.
- Handling non-numbers (for stats like `sum`).

More to come.
