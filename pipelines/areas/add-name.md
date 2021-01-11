# Add Name

```js
[{$set: {
    name: {
      $switch: {
        branches: [
          {
            'case': {
              $ne: [
                '$name_properties.name',
                null
              ]
            },
            then: '$name_properties.name'
          },
          {
            'case': {
              $ne: [
                '$properties.asciiname',
                null
              ]
            },
            then: '$properties.asciiname'
          },
          {
            'case': {
              $ne: [
                '$name_properties.name_nomad',
                null
              ]
            },
            then: '$name_properties.name_nomad'
          }
        ]
      }
    }
  }}, {$out: {
    db: "st_knowledgebase",
    coll: "areas"
  }}]
```
