# Export Areas Collection to API DB

```js
[{
  $match: {
    "properties.wkd": true
  }
}, {$unset: ["parentCountry", "countryCode", "name_properties", "solotrip_location"]}, {
  $project: {
    _id: 0,
    sid: 1,
    name: 1,
    country: 1,
    location: 1,
    properties: {
      ids: {
        "freebase_ids": "$properties.freebase_ids",
        "osm_ids": "$properties.OSM_relation_ids",
        "wkd_id": "$properties.wkd_id"
      },
      tags: "$tags",
      activity_tags: "$activity_tags",
      wikipedia_urls: "$properties.wikipedias",
      wikivoyage_urls: "$properties.wikivoyages",
      scores: "$scores",
      electricity: "$electricity",
      distances: "$distances",
      near_airports: "$near_airports"
    },
  }
}, {
  $out: {
    db: "st_knowledgebase",
    coll: "areas"
  }
}]
```
