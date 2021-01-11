# Add name field

- Merge wikidata languages with visalist languages

```js
[{$set: {
    'name': {
      $ifNull: [
        '$visalist_country.name',
        {
          $ifNull: [
            {$first:"$properties.labels"},
            "$properties.commons_category"]
        }]
    }
  }}, {$out: 'countries'}]
```
