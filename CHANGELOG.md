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
