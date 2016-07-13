# mapbox-geostats [![CircleCI](https://circleci.com/gh/mapbox/mapbox-geostats.svg?style=svg)](https://circleci.com/gh/mapbox/mapbox-geostats)

Generate statistics about geographic data.

## Installation

```
npm install mapbox-geostats
```

## About

You feed the module a file, and it outputs stats about the geographic data in the file.

### Input types

Supports the following file types:

- GeoJSON (`.geojson`)
- Shapefile (`.shp`, in a directory with its supporting files)
- CSV (`.csv`)
- MBTiles (`.mbtiles`)

### Limitations

You'll notice the following limitations in the output:

- No more than 1000 layers are counted, and no more than 100 are reported in detail.
- For any given layer, no more than 1000 unique attributes are counted, and no more than 100 are reported in detail.
- For any given attribute, no more than 1000 unique values are counted, and no more than 100 are reported.
- Attribute values that are strings longer than 256 characters are counted but not reported.

Because of this necessary limitation on the number of reported attributes, you may end up with output that does not include details about a particular attribute that you wanted to learn about. If you are the victim of this misfortune, use the `attributes` option, documented below, to specify the attribute(s) whose details you'd like to inspect.

## CLI

This is what you get from `mapbox-geostats --help`:

```
Generate statistics about geographic data.

Usage
  mapbox-geostats <input> <options>

  Output is logged to the console as a JSON string.

Options
  --attributes, -a Specify attributes to analyze. The provided value
                   will be parsed as an array, split on commas.

Example
  mapbox-geostats population-centers.geojson --attributes name,pop > output.json
```

## Node

```js
var geostats = require('mapbox-geostats');

geostats(filePath, options).then(function (stats) {
  // Do something with the stats
}).catch(function (err) {
  // Do something with the error
});
```

There's just one exposed function:

### geostats(filePath[, options])

Returns a Promise that resolves with a stats object, whose structure is described below.

`filepath` (*reqiured*) is the path to the file that you'd like to analyze.

`options` (*optional*) is an optional object that can have the following properties:

- `attributes`: An array of strings identifying attributes that you want analyzed and reported. By default, all attributes are analyzed and reported until we reach the limitations described above.

## Output: the stats

The stats output has this structure:

```js
{  
  // The number of layers in the source data (max. 1000)
  layerCount: Number,
  // An array of details about the first 100 layers
  layers: [
    {
      // The name of this layer
      layer: String,
      // The number of features in this layer
      count: Number,
      // The dominant geometry type in this layer
      geometry: String,
      // The number of unique attributes in this layer (max. 1000)
      attributeCount: Number
      // An array of details about the first 100 attributes in this layer
      attributes: [
        {
          // The name of this attribute
          attribute: String,
          // The number of unique values for this attribute (max. 1000)
          count: Number,
          // The type of this attribute's values
          type: String, // More info below ...
          // An array of this attribute's first 100 unique values
          values: [
            // ...
          ]
        }
        // ...
      ]
    }
    // ...
  ]
}
```

You can find more examples in the test fixtures.

### Attribute type

Each attribute has one of the following types:

- `'String'` if all its values are strings (or `null`).
- `'Number'` if all its values are numbers (or `null`).
- `'Boolean'` if all its values are booleans (or `null`).
- `'Null'` if its only value is `null`.
- `'Mixed'` if it has values of multiple types.

Array and object values are coerced to strings.

## Known caveats

- When reading MBTiles files, the feature count will be meaningless. This is because each feature will be included in multiple tiles, so will be analyzed multiple times.
- `null` sometimes appears unbidden in the attribute value lists generated from GeoJSON sources.
- MBTiles files whose vector data is not gzipped will not be understood.
