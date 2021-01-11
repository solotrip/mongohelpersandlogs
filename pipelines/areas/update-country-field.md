# Update Country Field

This can be used after updating country fields e.g `languages`, `visa_free_for`

```js
[{$lookup: {
    from: 'countries',
    localField: 'country.ISO2',
    foreignField: 'properties.ISO2',
    as: 'new_c'
  }}, {$set: {
    new_c: {
      $first: "$new_c"
    }
  }}, {$set: {
    country: {
      country_code: "$new_c.properties.country_code",
      ISO2: "$new_c.properties.ISO2",
      emoji_flag: "$new_c.properties.emoji_flag",
      name: "$new_c.name",
      visa_free_for: "$new_c.visa_free_for",
      visa_on_arrival_for: "$new_c.visa_on_arrival_for",
      languages: "$new_c.properties.st_languages"
    }
  }}, {$unset: ['new_c']}, {$out: 'areas'}]
```
