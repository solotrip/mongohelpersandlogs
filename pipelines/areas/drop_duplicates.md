# Drop duplicates

```js
[{
  $group: {
    _id: {
      name: '$properties.wkd_id'
    },
    doc: {
      $last: '$$ROOT'
    }
  }
}, {
  $replaceRoot: {
    newRoot: '$doc'
  }
}, {$out: 'areas_non_duplicate'}]
```
