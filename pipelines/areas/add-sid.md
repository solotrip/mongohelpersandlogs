# Add SolotripId (sid) to areas collection

```js
[{
  $match: {
    'properties.wkd': true
  }
}, {
  $set: {
    sid: {
      $toLower: {
        $replaceAll: {
          input: {
            $replaceAll: {
              input: {
                $cond: {
                  'if': {
                    $ne: [
                      '$properties.commons_category',
                      NaN
                    ]
                  },
                  then: '$properties.commons_category',
                  'else': {
                    $concat: [
                      '$name',
                      '-',
                      '$country.name'
                    ]
                  }
                }
              },
              find: ' ',
              replacement: '-'
            }
          },
          find: ',',
          replacement: '-'
        }
      }
    }
  }
}, {$out: 'areas'}]
```
