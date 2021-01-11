# Add countries from visa data


```js
[{$lookup: {
    from: 'visas',
    localField: 'properties.ISO2',
    foreignField: 'country.alpha2Code',
    as: 'visalist_country'
  }}, {$set: {
    visalist_country: {
      $first: "$visalist_country.country"
    }
  }}, {$out: 'countries'}]
```
