

#PLANS STRUCTURE

##USERS
```
{
  "_id": "5c841292acf2dd2308d89af0",
  "deviceID": "4389freo292a34ui5yrfh2308d84395"
  "userName": 'jackqiu2016@gmail.com',

}
```

#API ENDPOINTS

```
POST /schedule/new
POST /schedule
GET /scaffold
GET /scaffold?=scaffold_id
POST /activity/new
GET /activity/all
POST /activity/activity_id
POST /plan/generate
GET /plan/user_id

GET /goal/all
POST /goal/new
POST /goal/goal_id
```

### create schedule scaffold
POST /scaffold/new/:email
```
{
  "scaffolds": {
    "name": "standard work",
    "scaffold_blocks": [
        {
        "open": true,
        "type": null,
        "name": "morning home",
        "locationId": 30,
        "timeStart": "7:15 AM",
        "timeEnd": "10:00 AM",
        "days": "1,2,3,4,5"
        },
        {
        "open": false,
        "type": null,
        "name": "work",
        "locationId": 31,
        "timeStart": "10:30 AM",
        "timeEnd": "6:00 PM",
        "days": "1,2,3,4,5"
        },
        {
        "open": true,
        "type": null,
        "name": "afternoon",
        "locationId": null,
        "timeStart": "6:30 PM",
        "timeEnd": "10:00 PM",
        "days": "1,2,3,4,5"
        },
        {
        "open": false,
        "type": null,
        "name": "night",
        "locationId": 30,
        "timeStart": "10:30 PM",
        "timeEnd": "7:00 AM",
        "days": "1,2,3,4,5,6,7"
        }
    ]
  }
}
```

### add scaffold_block
POST /scaffold/:scaffold_id/block/new
```
  {
    "name": "night",
    "type": null,
    "location_id": 30,
    "start": "10:30 PM",
    "end": "7:00 AM",
    "user_id": "5c841292acf2dd2308d89af0",
    "scaffold_id": 25,
    "day": "1,2,3,4,5,6,7"
  }
```
### get schedule scaffold list
GET /scaffold/all
response body
```
{
  scaffolds: [
    123,
    223,
    323,
  ]
}
```
### get schedule scaffold
GET /scaffold/:scaffold_id

response body
```
{
  id: 123,
  name: 'standard work',
  schedule: {
    sunday: [
      {
        open: true,
        type: 'morning home',
        location: [123.231, 432.234],
        locationName: 'home',
      },
      {
        open: false,
        type: 'work',
        location: [123.321, 123.123],
        locationName: 'office',
      },
      {
        open: true,
        type: 'afternoon',
        location: null,
        locationName: null,
      },
      {
        open: false,
        type: 'night',
        location: [123.321, 321.123],
        locationName: home,
      }
    ],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  }
}
```
### delete schedule scaffold
POST /scaffold/:scaffold_id/delete
```

```

### generate calendar
POST /plan/new
request body
```
{
  name: 'project all-in',
  priority: {
    health: 8,
    progress: 9,
    social: 6,
  },
  scaffoldId: 1,
}
```
response body
```
{
  cards: [
    sunday: [],
    monday: [
      {
        id: 1231,
        name: 'swimming',
        location: [122.123, 334.123],
        address: '427 Stockton St San Francisco, CA 94103',
        duration: 45,
        type: 'exercise',
        sort: 1,
      },
      {
        id: 12,
        name: 'work',
        location: [122.123, 334.123],
        address: '115 Tenom St San Francisco, CA 94102',
        duration: 240,
        type: 'work',
        sort: 2,
      },
      {
        id: 13,
        name: 'plans project',
        location: [122.123, 334.123],
        address: '234 Folsom St San Francisco, CA 94104',
        duration: 240,
        type: 'project',
        sort: 3,
      }
    ],
    tuesday: [

    ],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  ]
}
```

### generated calendar 1 week
GET /plan/user_id
response body
```
{
  cards: [
    sunday: [],
    monday: [
      {
        id: 1231,
        name: 'swimming',
        location: [122.123, 334.123],
        address: '427 Stockton St San Francisco, CA 94103',
        duration: 45,
        type: 'exercise',
        sort: 1,
      },
      {
        id: 12,
        name: 'work',
        location: [122.123, 334.123],
        address: '115 Tenom St San Francisco, CA 94102',
        duration: 4,
        type: 'work',
        sort: 2,
      },
      {
        id: 13,
        name: 'plans project',
        location: [122.123, 334.123],
        address: '234 Folsom St San Francisco, CA 94104',
        duration: 240,
        type: 'project',
        sort: 3,
      }
    ],
    tuesday: [

    ],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  ]
}
```

### create activity
POST /activity/new/:email
request body
```
{
  name: 'plans project',
  locationId: 30,
  address: '234 Folsom St San Francisco, CA 94104',
  duration: 240,
  type: 'project',
  categories:
    [
      {
        categoryId: 1,
        value: 10,
      },
    ]
}
```
### look at activity list
GET /activity/all
response body
```
{
  data: {
    [
      {
        id: 1,
        name: 'swim',
        duration: 45,
        type: 'exercise',
      },
      {
        id: 2,
        name: 'run',
        duration: 45,
        type: 'exercise',
      },
      {
        id: 3,
        name: 'work',
        duration: 240,
      },
      {
        id: 4,
        name: 'paint',
        duration: 180,
      }
    ]
  }
}
```
### edit activity
POST /activity/activity_id
```
{
  name: 'plans project',
  location: [122.123, 334.123],
  address: '234 Folsom St San Francisco, CA 94104',
  duration: 240,
  type: 'project',
}
```

### new activity category
Add a category value to an activity for prioritizing
POST /activity/activity_id/category
```
{
  category: 81,
  value: 9,
}
```

### edit activity category
PUT /activity/activity_id/category
```
{
  category: 81,
  value: 9,
}
```

### get goals
GET /goal/all
```
{
  goals: [
    {
      name: '50 hrs Plans Project/complete plans mvp',
      recurring: false,
      contributing_activities: {
        actvities: [
          {
            activity: 13,
          },
        ],
        contribution: {

        }

      }
    },
    {
      name: '5 hrs exercise/week',
      recurring: true,
      contributing_activities: {

      }
    }
  ]
}
```
### create goal
POST /goal/new
```
{
  name: '50 hrs Plans Project/complete plans mvp',
  recurring: false,
  contributing_activities: {
    activity: 13,
    contributing_factor: 'duration',  // or count
  }
}
```
### edit goal
POST /goal/:goal_id
```
{
  name: '50 hrs Plans Project/complete plans mvp',
  recurring: false,
  contributing_activities: {
    activity: 13,
    type: null, // or goal for activities of type 'project' if that's the goal
    contributing_factor: 'duration'  // or count
  }
}
```
