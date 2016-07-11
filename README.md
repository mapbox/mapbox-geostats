# mapbox-geostats [![CircleCI](https://circleci.com/gh/mapbox/mapbox-geostats.svg?style=svg)](https://circleci.com/gh/mapbox/mapbox-geostats)

Generate statistics about geodata.

The initial plan:

- A CLI and Node API that take source files with geographic data as input and produce statistics about that data as output.
- Supported input formats:
  - GeoJSON
  - shapefiles
  - mbtiles
- Use mapnik to parse and analyze GeoJSON and shapefiles.
- Option to specify which attributes should be reported.

More to come.
