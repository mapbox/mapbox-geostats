# mapbox-geostats [![CircleCI](https://circleci.com/gh/mapbox/mapbox-geostats.svg?style=svg)](https://circleci.com/gh/mapbox/mapbox-geostats)

Generate statistics about geodata.

## Installation

```
npm install mapbox-geostats
```

## Usage

You feed the module a file, and it outputs stats about the geographic data in the file.

Supports the following file types:

- GeoJSON (`.geojson`)
- Shapefile (`.shp`, in a directory with its supporting files)
- MBTiles (`.mbtiles`)

You'll notice the following limitations in the output:

- No more than 1000 layers are counted, and no more than 100 are reported in detail.
- For any given layer, no more than 1000 unique attributes are counted, and no more than 100 are reported in detail.
- For any given attribute, no more than 1000 unique values are counted, and no more than 100 are reported.
- Attribute values that are strings longer than 256 characters are counted but not reported.

Because of this necessary limitation on the number of reported attributes, you may end up with output that does not include details about a particular attribute that you wanted to learn about. If you are the victim of this misfortune, use the `attributes` option, documented below, to specify the attribute(s) whose details you'd like to inspect.

### CLI

To come ...

### Node

```js
var geostats = require('mapbox-geostats');

geostats(filePath, options).then(function (stats) {
  // Do something with the stats
}).catch(function (err) {
  // Do something with the error
});
```

There's just one exposed function:

#### geostats(filePath[, options])

Returns a Promise that resolves with a stats object, whose structure is described below.

`filepath` (*reqiured*) is the path to the file that you'd like to analyze.

`options` (*optional*) is an optional object that can have the following properties:

- `attributes`: An array of strings identifying attributes that you want analyzed and reported. By default, all attributes are analyzed and reported until we reach the limitations described above.
