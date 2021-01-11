# Merge Languages fields

- Merge wikidata languages with visalist languages

```js
[{$set: {
    "properties.st_languages": {
      $setUnion: [
        "$properties.languages",
        {$split:[
            "$visalist_country.languageNames",
            ","
          ]
        }
      ]
    }
  }}, {$out: 'countries'}]
```
