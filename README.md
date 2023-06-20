# mapbox-geostats

Generate statistics about geographic data.

## Installation

```
git clone https://github.com/maptiler/mapbox-geostats.git
cd mapbox-geostats
npm i
./bin/mapbox-geostats <input> <options>
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
- Layer names, attribute names and attribute values that are strings longer than 256 characters are truncated to a length of 256. (This means that if two attribute names only vary after their 256th character, they will be considered the same. Same for layers.)

#### Avoid limitations by specifying attributes

Because of the necessary limitation on the number of reported attributes, you may end up with output that does not include details about a particular attribute that you wanted to learn about, because 100 attributes were already reported.

If you are the victim of this misfortune, use the `attributes` option, documented below, to specify the attribute(s) whose details you'd like to inspect.

When you use attributes, the limitations on attribute values change based on the following rules.

- You can count a maximum of 100,000 unique values.
- You can report a maximum of 10,000 unique values.

So if you've specified a limited number of attributes to inspect, the number of values that will be counted and reported can be tailored to that count. If you specify one attribute, you can see up to 10,000 values reported, 100,000 values counted per attribute. If you specify 5 attributes, you can see up to 2,000 values reported, 20,000 values counted per attribute.

## CLI

`mapbox-geostats` generate a tilestats JSON object
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

`mapbox-geostats-validate`: validate a tilestats JSON object
```
Usage
  mapbox-geostats-validate <file>

  Output is empty if valid, or a list of errors.

Example
  mapbox-geostats-validate ./path/to/stats.json
```

## Node

```js
var geostats = require('@mapbox/mapbox-geostats');

geostats(filePath, options).then(function (stats) {
  // Do something with the stats
}).catch(function (err) {
  // Do something with the error
});
```

There's just one exposed function:

### geostats(filePath[, options])

Returns a Promise that resolves with a stats object, whose structure is described below.

`filepath` (*required*) is the path to the file that you'd like to analyze.

`options` (*optional*) is an optional object that can have the following properties:

- `attributes`: An array of strings identifying attributes that you want analyzed and reported. By default, all attributes are analyzed and reported until we reach the limitations described above.

## Output: the stats

The tilestats jsonschema is specified in the /schema directory under schema/tilestats.json

The stats output has this structure:

```js
{  
  // The number of layers in the source data (max. 1000)
  "layerCount": Number,
  // An array of details about the first 100 layers
  "layers": [
    {
      // The name of this layer
      "layer": String,
      // The number of features in this layer
      "count": Number,
      // The dominant geometry type in this layer
      "geometry": String,
      // The number of unique attributes in this layer (max. 1000)
      "attributeCount": Number
      // An array of details about the first 100 attributes in this layer
      "attributes": [
        {
          // The name of this attribute
          "attribute": String,
          // The number of unique values for this attribute (max. 1000)
          "count": Number,
          // The type of this attribute's values
          "type": String, // More info below ...
          // An array of this attribute's first 100 unique values
          "values": [
            // ...
          ],
          // If there are *any* numbers in the values, the following
          // numeric stats will be reported
          "min": Number,
          "max": Number
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

- `'string'` if all its values are strings (or `null`).
- `'number'` if all its values are numbers (or `null`).
- `'boolean'` if all its values are booleans (or `null`).
- `'null'` if its only value is `null`.
- `'mixed'` if it has values of multiple types.

Array and object values are coerced to strings.

## Known caveats

- When reading MBTiles files, the feature count will be high. This is because each feature will be included in multiple tiles, so will be analyzed multiple times.
- `null` sometimes appears unbidden in the attribute value lists generated from GeoJSON sources. (cf. https://github.com/mapnik/node-mapnik/issues/668)
- GeoJSON without any features causes a parsing error. (cf. https://github.com/mapnik/mapnik/issues/3463)
- MBTiles files whose vector data is not gzipped will not be understood. (cf. https://github.com/mapbox/tiletype/issues/4)
- Because layer and attribute names are truncated at 256 characters (see above), if two attribute or layer names only vary after their 256th character, they will be considered the same --- that is, their data will be merged.
- if an MBTiles file has a `tilestats` object in the `json` row of the `metadata` table that will be used instead of generating stats from the raw tiles.
