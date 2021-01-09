import { toJson } from "xml2json";

//Projection to safety score.
db.areas.aggregate([
  {
    $lookup: {
      from: "countries",
      localField: "properties.country_code",
      foreignField: "properties.country_code",
      as: "parentCountry",
    },
  },

  {
    $project: {
      _id: 1,
      properties: 1,
      parentCountry: 1,
      countryCode: "$properties.country_code",
      solotrip_safety_score: {
        $cond: [
          "$properties.safety_level",
          {
            $round: [
              { $multiply: [{ $toDouble: "$properties.safety_level" }, 2] },
            ],
          },
          {
            $round: [
              {
                $toDouble: {
                  $multiply: [
                    {
                      $toDouble: {
                        $arrayElemAt: [
                          "$parentCountry.properties.safety_level",
                          0,
                        ],
                      },
                    },
                    2,
                  ],
                },
              },
            ],
          },
        ],
      },
    },
  },
  { $out: "projectedareas" },
]);

//projection to overall score.
db.projectedareas.aggregate([
  {
    $project: {
      _id: 1,
      properties: 1,
      parentCountry: 1,
      countryCode: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: {
        $cond: [
          "$properties.overall_score",
          { $round: [{ $multiply: ["$properties.overall_score", 2] }, 0] },
          {
            $cond: [
              "$parentCountry.properties.overall_score",
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $toDouble: {
                          $arrayElemAt: [
                            "$parentCountry.properties.overall_score",
                            0,
                          ],
                        },
                      },
                      2,
                    ],
                  },
                ],
              },
              -1,
            ],
          },
        ],
      },
    },
  },
  { $out: "projectedareas2" },
]);

//projection to foodie score.

db.projectedareas2.aggregate([
  {
    $project: {
      _id: 1,
      properties: 1,
      parentCountry: 1,
      countryCode: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: 1,
      solotrip_foodie_score: {
        $cond: [
          "$parentCountry.properties.food_quality_and_safety_score",
          {
            $round: [
              {
                $divide: [
                  {
                    $toDouble: {
                      $arrayElemAt: [
                        "$parentCountry.properties.food_quality_and_safety_score",
                        0,
                      ],
                    },
                  },
                  10,
                ],
              },
            ],
          },
          -10,
        ],
      },
    },
  },
  { $out: "projectedareas3" },
]);

//Adding foodscore to countries collection.
//db.countries.update({"properties.wkd_id":"Q717"},{$set: {"properties.food_quality_and_safety_score": 66.9}})

//Projection to budget score.

db.projectedareas3.aggregate([
  {
    $project: {
      _id: 1,
      properties: 1,
      parentCountry: 1,
      countryCode: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: 1,
      solotrip_foodie_score: 1,
      solotrip_budget_score: {
        $cond: [
          "$properties.cost_score",
          { $round: [{ $multiply: ["$properties.cost_score", 2] }, 0] },
          {
            $cond: [
              "$parentCountry.properties.cost_score",
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $toDouble: {
                          $arrayElemAt: [
                            "$parentCountry.properties.cost_score",
                            0,
                          ],
                        },
                      },
                      2,
                    ],
                  },
                ],
              },
              -1,
            ],
          },
        ],
      },
    },
  },
  { $out: "projectedareas4" },
]);

//Projection to walkscore.
db.projectedareas4.aggregate([
  {
    $project: {
      _id: 1,
      properties: 1,
      parentCountry: 1,
      countryCode: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: 1,
      solotrip_foodie_score: 1,
      solotrip_budget_score: 1,
      solotrip_walkable_score: {
        $cond: [
          "$properties.walkScore",
          { $round: [{ $divide: ["$properties.walkScore", 10] }, 0] },
          {
            $cond: [
              "$parentCountry.properties.walkScore",
              {
                $round: [
                  {
                    $divide: [
                      {
                        $toDouble: {
                          $arrayElemAt: [
                            "$parentCountry.properties.walkScore",
                            0,
                          ],
                        },
                      },
                      10,
                    ],
                  },
                ],
              },
              -1,
            ],
          },
        ],
      },
    },
  },
  { $out: "projectedareas5" },
]);

//Projection to Social Score.
db.projectedareas5.aggregate([
  {
    $project: {
      _id: 1,
      properties: 1,
      parentCountry: 1,
      countryCode: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: 1,
      solotrip_foodie_score: 1,
      solotrip_budget_score: 1,
      solotrip_walkable_score: 1,
      solotrip_social_score: {
        $cond: [
          "$properties.life_score",
          { $round: [{ $multiply: ["$properties.life_score", 2] }, 0] },
          {
            $cond: [
              "$parentCountry.properties.life_score",
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $toDouble: {
                          $arrayElemAt: [
                            "$parentCountry.properties.life_score",
                            0,
                          ],
                        },
                      },
                      2,
                    ],
                  },
                ],
              },
              -1,
            ],
          },
        ],
      },
    },
  },
  { $out: "projectedareas6" },
]);

//Sorting
db.projectedareas5
  .aggregate([{ $sort: { solotrip_foodie_score: -1 } }, { $limit: 5 }])
  .pretty();

//Projection to health score.
db.projectedareas6.aggregate([
  {
    $project: {
      _id: 1,
      properties: 1,
      parentCountry: 1,
      countryCode: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: 1,
      solotrip_foodie_score: 1,
      solotrip_budget_score: 1,
      solotrip_walkable_score: 1,
      solotrip_social_score: 1,
      solotrip_health_score: {
        $cond: [
          "$properties.healthcare_score",
          { $round: [{ $multiply: ["$properties.healthcare_score", 2] }, 0] },
          {
            $cond: [
              "$parentCountry.properties.healthcare_score",
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $toDouble: {
                          $arrayElemAt: [
                            "$parentCountry.properties.healthcare_score",
                            0,
                          ],
                        },
                      },
                      2,
                    ],
                  },
                ],
              },
              -1,
            ],
          },
        ],
      },
    },
  },
  { $out: "projectedareas7" },
]);

//Projection to freedom score.
db.projectedareas7.aggregate([
  {
    $project: {
      _id: 1,
      properties: 1,
      parentCountry: 1,
      countryCode: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: 1,
      solotrip_foodie_score: 1,
      solotrip_budget_score: 1,
      solotrip_walkable_score: 1,
      solotrip_social_score: 1,
      solotrip_health_score: 1,
      solotrip_freedom_score: {
        $cond: [
          "$properties.democracy_score",
          { $round: [{ $multiply: ["$properties.democracy_score", 2] }, 0] },
          {
            $cond: [
              "$parentCountry.properties.democracy_score",
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $toDouble: {
                          $arrayElemAt: [
                            "$parentCountry.properties.democracy_score",
                            0,
                          ],
                        },
                      },
                      2,
                    ],
                  },
                ],
              },
              -1,
            ],
          },
        ],
      },
    },
  },
  { $out: "projectedareas8" },
]);

//Projection to freedom score.
db.projectedareas8.aggregate([
  {
    $project: {
      _id: 1,
      properties: 1,
      parentCountry: 1,
      countryCode: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: 1,
      solotrip_foodie_score: 1,
      solotrip_budget_score: 1,
      solotrip_walkable_score: 1,
      solotrip_social_score: 1,
      solotrip_health_score: 1,
      solotrip_freedom_score: 1,
      solotrip_camper_score: {
        $cond: [
          "$properties.backpacker_score",
          { $round: [{ $multiply: ["$properties.backpacker_score", 2] }, 0] },
          {
            $cond: [
              "$parentCountry.properties.backpacker_score",
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $toDouble: {
                          $arrayElemAt: [
                            "$parentCountry.properties.backpacker_score",
                            0,
                          ],
                        },
                      },
                      2,
                    ],
                  },
                ],
              },
              -1,
            ],
          },
        ],
      },
    },
  },
  { $out: "projectedareas9" },
]);

//Projection to family score.

db.projectedareas9.aggregate([
  {
    $project: {
      _id: 1,
      properties: 1,
      parentCountry: 1,
      countryCode: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: 1,
      solotrip_foodie_score: 1,
      solotrip_budget_score: 1,
      solotrip_walkable_score: 1,
      solotrip_social_score: 1,
      solotrip_health_score: 1,
      solotrip_freedom_score: 1,
      solotrip_camper_score: 1,
      solotrip_family_score: {
        $cond: [
          "$properties.family_score",
          { $round: [{ $multiply: ["$properties.family_score", 2] }, 0] },
          {
            $cond: [
              "$parentCountry.properties.family_score",
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $toDouble: {
                          $arrayElemAt: [
                            "$parentCountry.properties.family_score",
                            0,
                          ],
                        },
                      },
                      2,
                    ],
                  },
                ],
              },
              -1,
            ],
          },
        ],
      },
    },
  },
  { $out: "projectedareas10" },
]);

//Adding sustainability score manually.
//db.projectedareas10.updateMany({"parentCountry.properties.wkd_id":"Q35"},{$set: {"solotrip_sustainability_score": 82.5}})

//Projection to shorter version of sustainability score.
db.projectedareas10.aggregate([
  {
    $set: {
      solotrip_sustainability_short_score: {
        $round: [{ $divide: ["$solotrip_sustainability_score", 10] }],
      },
    },
  },
  { $out: "projectedareas11" },
]);

//Getting culture score from culturalHeritages
db.projectedareas11.aggregate([
  {
    $lookup: {
      from: "culturalHeritages",
      localField: "parentCountry.properties.wkd_id",
      foreignField: "wkd_id",
      as: "heritages",
    },
  },
  {
    $project: {
      _id: 1,
      properties: 1,
      parentCountry: 1,
      countryCode: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: 1,
      solotrip_foodie_score: 1,
      solotrip_budget_score: 1,
      solotrip_walkable_score: 1,
      solotrip_social_score: 1,
      solotrip_health_score: 1,
      solotrip_freedom_score: 1,
      solotrip_camper_score: 1,
      solotrip_family_score: 1,
      solotrip_sustainability_score: 1,
      solotrip_sustainability_short_score: 1,
      heritages: 1,
      solotrip_culture_score: {
        $round: [{ $arrayElemAt: ["$heritages.culture_score", 0] }],
      },
    },
  },
  { $out: "projectedareas12" },
]);

//Getting the airtransport score from airtransportArrivals.
db.projectedareas12.aggregate([
  {
    $lookup: {
      from: "airtransportArrivals",
      localField: "parentCountry.properties.wkd_id",
      foreignField: "wkd_id",
      as: "airtransportArrivals",
    },
  },
  {
    $project: {
      _id: 1,
      properties: 1,
      parentCountry: 1,
      countryCode: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: 1,
      solotrip_foodie_score: 1,
      solotrip_budget_score: 1,
      solotrip_walkable_score: 1,
      solotrip_social_score: 1,
      solotrip_health_score: 1,
      solotrip_freedom_score: 1,
      solotrip_camper_score: 1,
      solotrip_family_score: 1,
      solotrip_sustainability_score: 1,
      solotrip_sustainability_short_score: 1,
      heritages: 1,
      solotrip_culture_score: 1,
      airtransportArrivals: 1,
      solotrip_airtransport_score: {
        $round: [
          { $arrayElemAt: ["$airtransportArrivals.airtransport_score", 0] },
        ],
      },
    },
  },
  { $out: "projectedareas13" },
]);

//Getting the forest score from forestPercentage.
db.projectedareas13.aggregate([
  {
    $lookup: {
      from: "forestPercentage",
      localField: "parentCountry.properties.wkd_id",
      foreignField: "wkd_id",
      as: "forestPercentage",
    },
  },
  {
    $project: {
      _id: 1,
      properties: 1,
      parentCountry: 1,
      forestPercentage: 1,
      heritages: 1,
      airtransportArrivals: 1,
      countryCode: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: 1,
      solotrip_foodie_score: 1,
      solotrip_budget_score: 1,
      solotrip_walkable_score: 1,
      solotrip_social_score: 1,
      solotrip_health_score: 1,
      solotrip_freedom_score: 1,
      solotrip_camper_score: 1,
      solotrip_family_score: 1,
      solotrip_sustainability_score: 1,
      solotrip_sustainability_short_score: 1,
      solotrip_culture_score: 1,
      solotrip_airtransport_score: 1,
      solotrip_forest_score: {
        $round: [{ $arrayElemAt: ["$forestPercentage.forrest_score", 0] }],
      },
    },
  },
  { $out: "projectedareas14" },
]);

//Getting the luxury score from luxuryIndex.
db.projectedareas14.aggregate([
  {
    $lookup: {
      from: "luxuryIndex",
      localField: "properties.wkd_id",
      foreignField: "wkd_id",
      as: "luxury",
    },
  },
  {
    $project: {
      _id: 1,
      properties: 1,
      parentCountry: 1,
      forestPercentage: 1,
      heritages: 1,
      airtransportArrivals: 1,
      countryCode: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: 1,
      solotrip_foodie_score: 1,
      solotrip_budget_score: 1,
      solotrip_walkable_score: 1,
      solotrip_social_score: 1,
      solotrip_health_score: 1,
      solotrip_freedom_score: 1,
      solotrip_camper_score: 1,
      solotrip_family_score: 1,
      solotrip_sustainability_score: 1,
      solotrip_sustainability_short_score: 1,
      solotrip_culture_score: 1,
      solotrip_airtransport_score: 1,
      solotrip_forest_score: 1,
      luxury: 1,
      solotrip_luxury_score: {
        $round: [{ $arrayElemAt: ["$luxury.luxury_score", 0] }],
      },
    },
  },
  { $out: "projectedareas15" },
]);

db.projectedareas15.aggregate([
  {
    $project: {
      _id: 1,
      properties: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: 1,
      solotrip_foodie_score: 1,
      solotrip_budget_score: 1,
      solotrip_walkable_score: 1,
      solotrip_social_score: 1,
      solotrip_health_score: 1,
      solotrip_freedom_score: 1,
      solotrip_camper_score: 1,
      solotrip_family_score: 1,
      solotrip_sustainability_score: 1,
      solotrip_sustainability_short_score: 1,
      solotrip_culture_score: 1,
      solotrip_airtransport_score: 1,
      solotrip_forest_score: 1,
      solotrip_luxury_score: 1,
    },
  },
]);

//Adding GeoJSON coordinates.

db.projectedareas15.aggregate([
  {
    $project: {
      _id: 1,
      properties: 1,
      parentCountry: 1,
      forestPercentage: 1,
      heritages: 1,
      airtransportArrivals: 1,
      countryCode: 1,
      luxury: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: 1,
      solotrip_foodie_score: 1,
      solotrip_budget_score: 1,
      solotrip_walkable_score: 1,
      solotrip_social_score: 1,
      solotrip_health_score: 1,
      solotrip_freedom_score: 1,
      solotrip_camper_score: 1,
      solotrip_family_score: 1,
      solotrip_sustainability_score: 1,
      solotrip_sustainability_short_score: 1,
      solotrip_culture_score: 1,
      solotrip_airtransport_score: 1,
      solotrip_forest_score: 1,
      solotrip_luxury_score: 1,
      solotrip_location: {
        type: "Point",
        coordinates: ["$properties.longitude", "$properties.latitude"],
      },
    },
  },
  { $out: "projectedareas16" },
]);

/*
coordinates: [
              { $arrayElemAt: ["$parentCountry.properties.longitude", 0] },
              { $arrayElemAt: ["$parentCountry.properties.latitude", 0] },
            ]


*/

//db.projectedareas10.updateMany({"parentCountry.properties.wkd_id":"Q35"},{$set: {"solotrip_sustainability_score": 82.5}})
db.projectedareas16.updateMany(
  { "solotrip_location.coordinates": [null, null] },
  [
    {
      $set: {
        "solotrip_location.coordinates": [
          {
            $toDouble: {
              $arrayElemAt: ["$parentCountry.properties.longitude", 0],
            },
          },
          {
            $toDouble: {
              $arrayElemAt: ["$parentCountry.properties.latitude", 0],
            },
          },
        ],
      },
    },
  ]
);

//Finding closest coastline to a particular point.

var long = 30.499097;
var lat = 39.765949;
var x = db.coastline50.findOne({
  geometry: {
    $geoNear: {
      $geometry: {
        type: "Point",
        coordinates: [long, lat],
      },
    },
  },
});

db.coastline50.find({ _id: x._id });

//

var longs = [22.323];
var lats = [100.0];

var y = db.coastline50.aggregate([
  {
    $geoNear: {
      near: { type: "Point", coordinates: [30.499097, 39.765949] },
      key: "geometry",
      distanceField: "distance",
    },
  },
  { $limit: 1 },
]);

//

var coordinateHolder;
var long;
var lat;
var wkdHolder;
var x;
db.projectedareas16.find().forEach(function (area) {
  coordinateHolder = area.solotrip_location.coordinates;
  wkdHolder = area.properties.wkd_id;

  long = coordinateHolder[0];
  lat = coordinateHolder[1];

  if (wkdHolder != null) {
    var lng = long;
    var lt = lat;

    db.coastline50.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lt] },
          key: "geometry",
          distanceField: "distance",
          includeLocs: "geometry",
        },
      },
      {
        $project: {
          distance: 1,
          distanceToSea: "$distance",
          coordinates: [lng, lt],
          wkd_id: wkdHolder,
          _id: 0,
        },
      },
      { $limit: 1 },
      { $merge: { into: "deleteit" } },
    ]);
  }
});

//projection to distance to sea.
db.projectedareas16.aggregate([
  {
    $lookup: {
      from: "distanceToSea",
      localField: "properties.wkd_id",
      foreignField: "wkd_id",
      as: "distanceToSea",
    },
  },
  {
    $project: {
      _id: 1,
      properties: 1,
      parentCountry: 1,
      forestPercentage: 1,
      heritages: 1,
      airtransportArrivals: 1,
      countryCode: 1,
      luxury: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: 1,
      solotrip_foodie_score: 1,
      solotrip_budget_score: 1,
      solotrip_walkable_score: 1,
      solotrip_social_score: 1,
      solotrip_health_score: 1,
      solotrip_freedom_score: 1,
      solotrip_camper_score: 1,
      solotrip_family_score: 1,
      solotrip_sustainability_score: 1,
      solotrip_sustainability_short_score: 1,
      solotrip_culture_score: 1,
      solotrip_airtransport_score: 1,
      solotrip_forest_score: 1,
      solotrip_luxury_score: 1,
      solotrip_location: 1,
      solotrip_distance_to_sea: {
        $divide: [
          {
            $arrayElemAt: ["$distanceToSea.distanceToSea", 0],
          },
          1000,
        ],
      },
    },
  },
  { $out: "projectedareas17" },
]);

//Adding sustainability score and overriding it.
db.transportandsustainability.aggregate([
  {
    $project: {
      _id: 1,
      "Transport and mobility": 1,
      wkd_id: 1,
      transport_score: 1,
      sustainability: {
        $add: [
          { $multiply: [{ $toDouble: "$Sustainability" }, 0.66666666666] },
          3.33333333333,
        ],
      },
      city: "$1",
      country: "$2",
    },
  },
  { $out: "transportandsustainability" },
]);

db.transportandsustainability.createIndex({ sustainability: -1 });
db.transportandsustainability.createIndex({ transport_score: -1 });

db.transportandsustainability.updateMany({}, [
  {
    $set: {
      mostSustainableCity: false,
    },
  },
]);

db.projectedareas17.aggregate([
  {
    $lookup: {
      from: "transportandsustainability",
      localField: "properties.wkd_id",
      foreignField: "wkd_id",
      as: "transportandsustainability",
    },
  },
  {
    $project: {
      _id: 1,
      properties: 1,
      parentCountry: 1,
      forestPercentage: 1,
      heritages: 1,
      airtransportArrivals: 1,
      countryCode: 1,
      luxury: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: 1,
      solotrip_foodie_score: 1,
      solotrip_budget_score: 1,
      solotrip_walkable_score: 1,
      solotrip_social_score: 1,
      solotrip_health_score: 1,
      solotrip_freedom_score: 1,
      solotrip_camper_score: 1,
      solotrip_family_score: 1,
      solotrip_sustainability_score: 1,
      solotrip_sustainability_short_score: 1,
      solotrip_culture_score: 1,
      solotrip_airtransport_score: 1,
      solotrip_forest_score: 1,
      solotrip_luxury_score: 1,
      solotrip_location: 1,
      solotrip_distance_to_sea: 1,
      transportandsustainability: 1,
      solotrip_city_transport_score: {
        $round: [
          {
            $arrayElemAt: ["$transportandsustainability.transport_score", 0],
          },
        ],
      },
    },
  },
  { $out: "projectedareas18" },
]);

db.projectedareas18.aggregate([
  {
    $project: {
      _id: 1,
      properties: 1,
      parentCountry: 1,
      forestPercentage: 1,
      heritages: 1,
      airtransportArrivals: 1,
      countryCode: 1,
      luxury: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: 1,
      solotrip_foodie_score: 1,
      solotrip_budget_score: 1,
      solotrip_walkable_score: 1,
      solotrip_social_score: 1,
      solotrip_health_score: 1,
      solotrip_freedom_score: 1,
      solotrip_camper_score: 1,
      solotrip_family_score: 1,
      solotrip_sustainability_score: 1,
      solotrip_sustainability_short_score: 1,
      solotrip_culture_score: 1,
      solotrip_airtransport_score: 1,
      solotrip_forest_score: 1,
      solotrip_luxury_score: 1,
      solotrip_location: 1,
      solotrip_distance_to_sea: 1,
      transportandsustainability: 1,
      solotrip_city_transport_score: 1,
      solotrip_city_sustainability_score: {
        $round: [
          {
            $arrayElemAt: ["$transportandsustainability.sustainability", 0],
          },
        ],
      },
    },
  },
  { $out: "projectedareas19" },
]);

//Adding adventure info and overriding it.
db.countryAdventures.aggregate([
  {
    $project: {
      _id: 1,
      "Country Codes": 1,
      Column1: 1,
      ISO3V10: 1,
      Country: 1,
      Regions: 1,
      GEO_subregion: 1,
      HDI: 1,
      GDP: 1,
      OCDE: 1,
      UNDP: 1,
      "Sustainable Development": 1,
      Safety: 1,
      Health: 1,
      "Natural Resources": 1,
      "Safe & Welcoming factor": 1,
      "Adventure Activity Resources": 1,
      Entrepreneurship: 1,
      "Adventure factor": 1,
      Humanitarian: 1,
      "Cultural Resources": 1,
      Infrastructure: 1,
      Image: 1,
      "Readiness factor": 1,
      "ADTI score": 1,
      RAW: 1,
      outdoor_activity_Resources: 1,
      natural_Resources: { $toDouble: "$natural_Resources" },
    },
  },
  { $out: "countryAdventures" },
]);

db.countryAdventures.updateMany({}, [
  {
    $set: {
      natural_Resources: {
        $replaceOne: {
          input: "$Natural Resources",
          find: ",",
          replacement: ".",
        },
      },
    },
  },
]);

db.countryAdventures.update({}, { $unset: { URL: 1 } }, false, true);

db.projectedareas20.aggregate([
  {
    $project: {
      popularcities: 1,
      solotrip_popularity_score: {
        $round: [
          {
            $arrayElemAt: ["$popularcities.popularity_score", 0],
          },
        ],
      },
      _id: 1,
      properties: 1,
      parentCountry: 1,
      forestPercentage: 1,
      heritages: 1,
      airtransportArrivals: 1,
      countryCode: 1,
      luxury: 1,
      solotrip_safety_score: 1,
      solotrip_overall_score: 1,
      solotrip_foodie_score: 1,
      solotrip_budget_score: 1,
      solotrip_walkable_score: 1,
      solotrip_social_score: 1,
      solotrip_health_score: 1,
      solotrip_freedom_score: 1,
      solotrip_camper_score: 1,
      solotrip_family_score: 1,
      solotrip_sustainability_score: 1,
      solotrip_sustainability_short_score: 1,
      solotrip_culture_score: 1,
      solotrip_airtransport_score: 1,
      solotrip_forest_score: 1,
      solotrip_luxury_score: 1,
      solotrip_location: 1,
      solotrip_distance_to_sea: 1,
      transportandsustainability: 1,
      solotrip_city_transport_score: 1,
      solotrip_city_sustainability_score: 1,
    },
  },
  { $out: "projectedareas21" },
]);

//Adding activities to areas.
var wkdsHolder;
var x;
db.activities.find().forEach(function (activity) {
  activityHolder = activity.name;
  bestHolder = activity.bestPlace;
  wkdsHolder = activity.places;

  for (const element of wkdsHolder) {
    x = db.areasv2.update(
      { "properties.wkd_id": element.wkd_id },
      { $addToSet: { activity_tags: activityHolder } }
    );
  }
});

//projecting areasv2 to see just wkd_ids.

db.areasv2.aggregate([
  {
    $project: {
      "properties.wkd_id": 1,
    },
  },
]);

////////////***********ONLY NEAREST METHOD BELOW WORKS!******************************************************************* */
//Nearest cities method 1

//Near cities works !

var coordinateHolder;
var long;
var lat;
var wkdHolder;
var x;
db.areasv3.find().forEach(function (area) {
  coordinateHolder = area.solotrip_location.coordinates;
  wkdHolder = area.properties.wkd_id;

  long = coordinateHolder[0];
  lat = coordinateHolder[1];

  if (wkdHolder != null) {
    var lng = long;
    var lt = lat;

    db.areasv3.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lt] },
          key: "solotrip_location",
          distanceField: "distance",
        },
      },
      {
        $project: {
          solotrip_location: 1,
          distance: 1,
          distanceToNearCity: "$distance",
          coordinates: [lng, lt],
          _id: 1,
          "properties.wkd_id": 1,
          "properties.asciiname": 1,
          nearestTo: 1,
          nearTo: wkdHolder,
        },
      },
      { $limit: 20 },
      {
        $group: {
          _id: "$nearTo",
          nearcities: {
            $push: {
              wkd_id: "$properties.wkd_id",
              distance: "$distance",
              location: "$solotrip_location",
            },
          },
        },
      },
      { $merge: { into: "topnearcities" } },
    ]);
  }
});

//copying areas(duplication without indexes)
//db.areasv2.aggregate([{ $match: {} }, { $out: "areasv5" }]);

//db.areasv3.update({"_id" :ObjectId("4e93037bbf6f1dd3a0a9541a") },{$set : {"new_field":1}})

//adding near cities to areas.
var cityIdHolder;
var nearcitiesHolder;
db.nearcities.find().forEach(function (city) {
  cityIdHolder = city._id;
  nearcitiesHolder = city.nearcities;

  x = db.areasv3.update(
    { "properties.wkd_id": cityIdHolder },
    { $set: { nearcities: nearcitiesHolder } }
  );
});

//Airports location to geospatial location.
//If there is no lat long we set it to 0 0. There is no airport near at 0 0 so that we can eliminate all 0 0 locations after that.
db.airports.aggregate([
  {
    $project: {
      _id: 1,
      iata: 1,
      country_code: 1,
      geonameid: 1,
      google_maps_customer_id: 1,
      id: 1,
      latitude: 1,
      longitude: 1,
      names: 1,
      places_served: 1,
      places_served_names: 1,
      timezone: 1,
      websites: 1,
      location: {
        $cond: {
          if: { $eq: ["$longitude", NaN] },
          then: {
            type: "Point",
            coordinates: [0, 0],
          },
          else: {
            type: "Point",
            coordinates: [
              { $toDouble: "$longitude" },
              { $toDouble: "$latitude" },
            ],
          },
        },
      },
    },
  },
  { $out: "airportsv2" },
]);

//Creating index on aiports location
db.airportsv2.createIndex({ location: "2dsphere" });

//Flights are duplicated from airfares.(Delete airfares later on.)
db.airfares.aggregate([{ $match: {} }, { $out: "flights" }]);

//adding airport (location) info to flights
db.airportsv2.find().forEach(function (airport) {
  iataHolder = airport.iata;
  locationHolder = airport.location;
  geonameidHolder = airport.geonameid;
  idHolder = airport.id;

  db.flights.updateMany(
    { from_iata: iataHolder },
    { $set: { from_location: locationHolder } }
  );

  db.flights.updateMany(
    { to_iata: iataHolder },
    { $set: { to_location: locationHolder } }
  );
});

db.flights.createIndex({ from_location: "2dsphere" });
db.flights.createIndex({ to_location: "2dsphere" });

//Calculating the distance between two airports.
/*
db.flights.aggregate([
  {
    $geoNear: {
      near: { },
      key: "from_location",
      distanceField: "distance",
    },
  },
  { $limit: 1 },
]);
*/

//duplicating flights
db.flights.aggregate([{ $match: {} }, { $out: "flightsv2" }]);

//Calculating the distance between two from airport and to airport.

db.flights.find().forEach(function (flight) {
  if (
    flight._id != null &&
    flight.from_location != null &&
    flight.to_location != null
  ) {
    var idHolder = flight._id;
    var lon1 = flight.from_location.coordinates[0];
    var lat1 = flight.from_location.coordinates[1];
    var lon2 = flight.to_location.coordinates[0];
    var lat2 = flight.to_location.coordinates[1];
    var p = 0.017453292519943295;
    var c = Math.cos;
    var a =
      0.5 -
      c((lat2 - lat1) * p) / 2 +
      (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

    var distance = 12742 * Math.asin(Math.sqrt(a));
    db.flightsv2.updateMany(
      { _id: idHolder },
      { $set: { distance: distance } }
    );
  }
});

//Adding units as kilometers and deleting the duplicated (Old) collection.
db.flightsv2.updateMany({}, { $set: { distanceUnit: "kilometers" } });
db.flights.drop();
db.flightsv2.renameCollection("flights");

db.areasv2.updateMany({}, { $set: { solotrip_distance_to_sea: "meters" } });

//time difference calculation
db.flights.find().forEach(function (flight) {
  if (
    flight._id != null &&
    flight.from_location != null &&
    flight.to_location != null
  ) {
    var idHolder = flight._id;
    var longfrom = flight.from_location.coordinates[0];
    var longto = flight.to_location.coordinates[0];
    var fromCity = flight.from_city;
    var toCity = flight.to_city;

    var difference = (longto - longfrom) / 15;

    var hourspart = Math.floor(difference);

    var minutespart = difference - Math.floor(difference);

    var minutes = Math.floor((Math.floor(minutespart * 100) * 6) / 10);
    var ahead;

    if (difference > 0) {
      ahead = "to";
    } else if (difference < 0) {
      ahead = "from";
    } else {
      ahead = "equal";
    }

    db.flights.updateMany(
      { _id: idHolder },
      {
        $set: {
          timeDifference: {
            full: difference,
            hours: hourspart,
            minutes: minutes,
            ahead: ahead,
          },
        },
      }
    );
  }
});

//If it is needed, unset the value.
//db.flights.update({}, { $unset: { timeDifference: 1 } }, false, true);

//Finding closest airports to cities.(max limit 5)
var coordinateHolder;
var long;
var lat;
var wkdHolder;
var x;
db.areasv3.find().forEach(function (area) {
  coordinateHolder = area.solotrip_location.coordinates;
  wkdHolder = area.properties.wkd_id;

  long = coordinateHolder[0];
  lat = coordinateHolder[1];

  if (wkdHolder != null) {
    var lng = long;
    var lt = lat;

    db.airportsv2.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lt] },
          key: "location",
          distanceField: "distance",
          maxDistance: 200000,
        },
      },
      {
        $project: {
          location: 1,
          distance: 1,
          city_coordinates: [lng, lt],
          _id: 1,
          id: 1,
          nearTo: wkdHolder,
        },
      },
      { $limit: 5 },
      {
        $group: {
          _id: "$nearTo",
          nearairports: {
            $push: {
              wkd_id: "$id",
              distance: "$distance",
              location: "$location",
            },
          },
        },
      },
      { $merge: { into: "nearairports" } },
    ]);
  }
});

//adding nearest airports to areas.
var cityIdHolder;
var nearcitiesHolder;
db.nearairports.find().forEach(function (city) {
  cityIdHolder = city._id;
  nearairportsHolder = city.nearairports;

  x = db.areasv3.update(
    { "properties.wkd_id": cityIdHolder },
    {
      $set: {
        nearairports: nearairportsHolder,
        nearairports_distance_unit: "meters",
      },
    }
  );
});

db.areasv3.aggregate([
  {
    $project: {
      _id: 1,
      "properties.wkd_id": 1,
    },
  },
]);

//Reorganizing scores.
var scoreHolder;
var wkdHolder;
db.areasv3.find().forEach(function (area) {
  scoreHolder = area.solotrip_popularity_score;
  wkdHolder = area.properties.wkd_id;

  db.areasv3.updateMany(
    { "properties.wkd_id": wkdHolder },
    {
      $push: {
        scores: {
          name: "Popularity Score",
          key: "popularity_score",
          value: scoreHolder || 5,
          type: "score",
          unit: "/10",
        },
      },
    }
  );
});

//Adding name field.

db.areasv3.find().forEach(function (area) {
  nameHolder =
    area.properties.name ||
    area.properties.asciiname ||
    area.properties.short_slug;

  wkdHolder = area.properties.wkd_id;

  db.areasv3.updateMany(
    { "properties.wkd_id": wkdHolder },
    {
      $set: {
        name: nameHolder,
      },
    }
  );
});

//Gathering electricity. If it is exists in the properties get it, else get from parent.

db.areasv3.find().forEach(function (area) {
  plugs =
    area.properties.power_plugs ||
    (area.parentCountry[0] && area.parentCountry[0].properties.power_plugs);
  voltage =
    area.properties.power_voltage ||
    (area.parentCountry[0] && area.parentCountry[0].properties.power_voltage);
  frequency =
    area.properties.power_frequency ||
    (area.parentCountry[0] && area.parentCountry[0].properties.power_frequency);
  wkdHolder = area.properties.wkd_id;

  db.areasv3.updateMany(
    { "properties.wkd_id": wkdHolder },
    {
      $set: {
        electricity: {
          plugs: plugs,
          voltage: voltage,
          frequency: frequency,
        },
      },
    }
  );
});

//Parsing tags from nomadlist.
db.areasv3.find().forEach(function (area) {
  var tagArray = [];
  tagsHolder = area.properties.tags || "";

  var tags = tagsHolder.split(",") || [];

  tags.forEach(function (tag) {
    if (tag != "") {
      tagArray.push(tag);
    }
  });
  wkdHolder = area.properties.wkd_id;
  db.areasv3.updateMany(
    { "properties.wkd_id": wkdHolder },
    {
      $set: {
        tags: tagArray,
      },
    }
  );
});

//Near cities new schema.
db.areasv3.find().forEach(function (area) {
  var nearArray = [];
  nearcitiesHolder = area.nearcities || [];

  nearcitiesHolder.forEach(function (city) {
    if (city.distance != 0) {
      //Find near city by wkd_id and get the name.
      if (city.wkd_id) {
        x = db.areasv3.findOne({ "properties.wkd_id": city.wkd_id });
        city.name = x.properties.name;
      }

      city.unit = "meters";
      nearArray.push(city);
    }
  });
  wkdHolder = area.properties.wkd_id;

  db.areasv3.updateMany(
    { "properties.wkd_id": wkdHolder },
    {
      $set: {
        near_cities: nearArray,
      },
    }
  );
});

// Near airports new schema.
db.areasv3.find().forEach(function (area) {
  var nearArray = [];
  nearairportsHolder = area.nearairports || [];

  nearairportsHolder.forEach(function (airport) {
    if (airport.distance != 0) {
      //Find near city by wkd_id and get the name.
      if (airport.location) {
        x = db.airports.findOne({ location: airport.location });
        airport.iata = x.iata;
        airport.names = x.names;
      }

      airport.unit = "meters";
      nearArray.push(airport);
    }
  });
  wkdHolder = area.properties.wkd_id;

  db.areasv3.updateMany(
    { "properties.wkd_id": wkdHolder },
    {
      $set: {
        near_airports: nearArray,
      },
    }
  );
});

//Adding percentages.
var percentageHolder;
var wkdHolder;
db.areasv3.find().forEach(function (area) {
  percentageHolder =
    (area.forestPercentage[0] &&
      parseInt(area.forestPercentage[0].Value, 10)) ||
    null;
  wkdHolder = area.properties.wkd_id;

  db.areasv3.updateMany(
    { "properties.wkd_id": wkdHolder },
    {
      $push: {
        percentages: {
          name: "Forest Percentage",
          key: "country_forest_percentage",
          value: percentageHolder,
          type: "percentage",
          unit: "%",
        },
      },
    }
  );
});

//Adding distances.
var distanceHolder;
var wkdHolder;
db.areasv3.find().forEach(function (area) {
  distanceHolder = area.solotrip_distance_to_sea || null;

  wkdHolder = area.properties.wkd_id;

  db.areasv3.updateMany(
    { "properties.wkd_id": wkdHolder },
    {
      $push: {
        distances: {
          name: "Nearest Coast",
          key: "distance_to_nearest_coast",
          value: distanceHolder,
          type: "distance",
          unit: "meters",
        },
      },
    }
  );
});

//Areasv2 and  areas are removed. Areasv3 renamed to areas.

//SKYPICKING BEGIIIIINNNSSSS !!!!

//Merging skypicker names with name_properties.
db.areas.find().forEach(function (area) {
  slugHolder = area.properties.long_slug || area.properties.nl_slug;

  wkdHolder = area.properties.wkd_id;

  nameNomad = area.name;

  countrySlug =
    (area.parentCountry[0] && area.parentCountry[0].properties.long_slug) || "";

  concatSlug =
    ((nameNomad && nameNomad.toLowerCase().replace(/\s/g, "-")) || "") +
    "-" +
    countrySlug;

  if (slugHolder) {
    x = db.skypickerApi.findOne({ slug: slugHolder });
    if (x != null) {
      nameHolder = x.name;
      popularityHolder = x.dst_popularity_score;
    }
  }

  db.areas.updateMany(
    { "properties.wkd_id": wkdHolder },
    {
      $set: {
        name_properties: {
          name: nameHolder || nameNomad || null,
          name_skypicker: (nameHolder && nameHolder) || null,
          name_nomad: nameNomad || null,
          slug: slugHolder || concatSlug,
        },
      },
    }
  );

  nameHolder = null;
  slugHolder = null;
});

// Skypicker normalizing popularity score and adding it to scores array as a different popularity score.
db.areas.find().forEach(function (area) {
  slugHolder = area.properties.long_slug || area.properties.nl_slug;

  wkdHolder = area.properties.wkd_id;

  if (slugHolder) {
    x = db.skypickerApi.findOne({ slug: slugHolder });
    if (x != null) {
      popularityHolder = x.dst_popularity_score;
      maxPopularity = 6093902;
      minPopularity = 0;

      popularityScore = Math.ceil(
        (10 * (popularityHolder - minPopularity)) /
          (maxPopularity - minPopularity)
      );
    }

    db.areas.updateMany(
      { "properties.wkd_id": wkdHolder },
      {
        $push: {
          scores: {
            name: "Popularity Score",
            key: "skypicker_popularity_score",
            value: popularityScore || null,
            type: "score",
            unit: "/10",
          },
        },
      }
    );
    popularityScore = null;
  }
});

//Adding skypicker airports, stations, hotels, and bus stations to count array.

db.areas.find().forEach(function (area) {
  slugHolder = area.properties.long_slug || area.properties.nl_slug;
  wkdHolder = area.properties.wkd_id;

  if (slugHolder) {
    x = db.skypickerApi.findOne({ slug: slugHolder });
    if (x != null) {
      airportsCount = x.bus_stations;

      db.areas.updateMany(
        { "properties.wkd_id": wkdHolder },
        {
          $push: {
            counts: {
              name: "Number of Bus Stations",
              key: "skypicker_bus_stations_count",
              value: airportsCount,
              type: "count",
              unit: "",
            },
          },
        }
      );

      airportsCount = null;
      slugHolder = null;
      wkdHolder = null;
    }
  }
});

//Merging skypicker tags with Solotrip tags.

db.areas.find().forEach(function (area) {
  slugHolder = area.properties.long_slug || area.properties.nl_slug;
  wkdHolder = area.properties.wkd_id;

  if (slugHolder) {
    x = db.skypickerApi.findOne({ slug: slugHolder });
    if (x != null) {
      tagArray = [];
      tags = x.tags;

      tags.forEach(function (tag) {
        tagArray.push(tag.tag);
        db.areas.updateMany(
          { "properties.wkd_id": wkdHolder },
          {
            $push: {
              tags: tag.tag,
            },
          }
        );
      });

      tagArray = [];
      tags = [];
      slugHolder = null;
      wkdHolder = null;
    }
  }
});

//Skypickers Alternative departure points merged into solotrip. Note that we are not appending into near_airports. We could compare and use both.
db.areas.find().forEach(function (area) {
  slugHolder = area.properties.long_slug || area.properties.nl_slug;
  wkdHolder = area.properties.wkd_id;

  if (slugHolder) {
    x = db.skypickerApi.findOne({ slug: slugHolder });
    if (x != null) {
      departureArray = [];
      departures = x.alternative_departure_points;

      departures.forEach(function (departure) {
        departureArray.push({
          iata: departure.id,
          distance: departure.distance,
          "distance-unit": "kilometers",
          duration: departure.duration,
          "duration-unit": "seconds",
        });
      });

      db.areas.updateMany(
        { "properties.wkd_id": wkdHolder },
        {
          $set: {
            alternative_departure_points: departureArray,
          },
        }
      );

      departureArray = [];
      departures = [];
      slugHolder = null;
      wkdHolder = null;
    }
  }
});

//unsetting the old fields. Remove.
db.areas.update({}, { $unset: { nearairports: 1 } }, { multi: true });

//Adding UNESCO World Heritages into counts.

db.areas.find().forEach(function (area) {
  wkdHolder = area.properties.wkd_id;

  worldHeritages =
    (area.heritages[0] && area.heritages[0].total_heritages) || 0;

  db.areas.updateMany(
    { "properties.wkd_id": wkdHolder },
    {
      $push: {
        counts: {
          name: "Number of Total Heritages In Country",
          key: "unesco_world_heritages_total_count_country",
          value: worldHeritages,
          type: "count",
          unit: "",
        },
      },
    }
  );

  worldHeritages = null;
});

//Air transport Arrivals
db.areas.find().forEach(function (area) {
  wkdHolder = area.properties.wkd_id;

  worldHeritages =
    area.popularcities[0] &&
    parseInt(area.popularcities[0]["Rank(Mastercard)"]);

  if (area.popularcities[0]) {
    db.areas.updateMany(
      { "properties.wkd_id": wkdHolder },
      {
        $push: {
          counts: {
            name: "Popular Cities Rank",
            key: "popular_cities_rank",
            value: worldHeritages,
            type: "count",
            unit: "/100",
          },
        },
      }
    );
  }

  worldHeritages = null;
});

//Citynames..
db.areas.aggregate([
  {
    $project: {
      wkd_id: 1,
      name_properties: 1,
      "properties.wkd_id": 1,
    },
  },
  { $out: "citynames" },
]);

//creating id for citynames.
db.citynames.find().forEach(function (city) {
  wkdHolder = city.properties.wkd_id;
  slugHolder = city.name_properties.slug;

  db.citynames.updateMany(
    { "properties.wkd_id": wkdHolder },
    {
      $set: {
        name: slugHolder + "_" + wkdHolder,
      },
    }
  );
});
