export default [
  {
    "name":"Author",
    "root":"/Users/nickshelswell/Projects/frameworkstein/packages/frameworkstein-cli/api-test",
    "modelType":"Author",
    "fields":[
      {
        "name":"firstName",
        "type":"Text"
      },
      {
        "name":"lastName",
        "type":"Text"
      },
      {
        "name":"posts"
      }
    ],
    "relations":[
      {
        "name":"posts",
        "modelType":"Post",
        "relationType":"hasMany"
      }
    ]
  },
  {
    "name":"Post",
    "root":"/Users/nickshelswell/Projects/frameworkstein/packages/frameworkstein-cli/api-test",
    "modelType":"Post",
    "fields":[
      {
        "name":"title",
        "type":"Text"
      },
      {
        "name":"author"
      },
      {
        "name":"votes",
        "type":"Integer"
      }
    ],
    "relations":[
      {
        "name":"authors",
        "modelType":"Author",
        "relationType":"hasMany"
      },
      {
        "name":"comments",
        "modelType":"Comment",
        "relationType":"hasMany"
      }
    ]
  },
  {
    "name":"Comment",
    "root":"/Users/nickshelswell/Projects/frameworkstein/packages/frameworkstein-cli/api-test",
    "modelType":"Comment",
    "fields":[
      {
        "name":"title",
        "type":"Text"
      },
      {
        "name":"name"
      }
    ],
    "relations":[
      {
        "name":"post",
        "modelType":"Post",
        "relationType":"belongsTo"
      }
    ]
  }
]