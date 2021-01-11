# Add visa free for field to Countries

- Visa data contains visa category in two different places. One is in the root, named as `visaCategoryId`. This one is empty for many documents. The other one is `visaRequirement.visaCategoryId`.


```js
[{
  $lookup: {
    from: 'visas',
    'let': {
      cc: '$properties.ISO2'
    },
    pipeline: [{
      $match: {
        $expr: {
          $or: [{
            $and: [{
              $eq: [
                '$destinationCountry.alpha2Code',
                '$$cc'
              ]
            },
              {
                $eq: [
                  '$visaCategoryId',
                  2
                ]
              }
            ]
          },
            {
              $and: [{
                $eq: [
                  '$destinationCountry.alpha2Code',
                  '$$cc'
                ]
              },
                {
                  $eq: [
                    '$visaRequirement.visaCategoryId',
                    2
                  ]
                }
              ]
            }
          ]
        }
      }
    },
      {
        $replaceWith: {
          c: '$country.alpha2Code'
        }
      }
    ],
    as: 'visa_on_arrival_for'
  }
}, {
  $set: {
    visa_on_arrival_for: {
      $map: {
        input: '$visa_on_arrival_for',
        as: 'i',
        'in': '$$i.c'
      }
    }
  }
}, {
  $out: 'countries'
}]
```
