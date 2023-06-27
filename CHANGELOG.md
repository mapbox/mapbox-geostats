# DEVEL

- Ignore/limit attribute values [#1](https://github.com/maptiler/mapbox-geostats/pull/1)
- `buildGeoStats` rejects promise instead of throwing an error [#3](https://github.com/maptiler/mapbox-geostats/pull/3)
- Add an option to insert generated tilestats into mbtiles metadata [#3](https://github.com/maptiler/mapbox-geostats/pull/3)
- Split geostats and validator tests [#3](https://github.com/maptiler/mapbox-geostats/pull/3)

# 1.1.2

- Upgrade to node 16+


# 1.1.1

- Republish of 1.1.0 without accidental large log file, bloating package size

# 1.1.0 (deprecated)

- Upgrade to mapnik 4.3.1
- Test on node 8 + 10

# 1.0.0

- Upgrade to mapnik 3.7.0
- Drops windows support

# 0.5.1

- Fix issue where tile-analyze Promise was not finishing execution on resolve [#34](https://github.com/mapbox/mapbox-geostats/issues/34)

# 0.5.0

- Adds a tilestats schema [#33](https://github.com/mapbox/mapbox-geostats/pull/33)
- Adds a tilestats schema validation method [#33](https://github.com/mapbox/mapbox-geostats/pull/33)
- Checks mbtiles metadata table for a pregenerated tilestats object [#33](https://github.com/mapbox/mapbox-geostats/pull/33)

# 0.4.0

- Upgrade mapnik@3.6.0
- Update test fixtures that are now failing due to changes in mapnik core

# 0.3.1

- Use `mapbox-file-sniff`'s `quaff`, instead of `sniff`, to better handle large files.

# 0.3.0

- Upgrade mapbox-file-sniff@0.5.2
- Use ~ instead of ^ for node-mbtiles and node-mapnik
