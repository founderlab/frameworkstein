# Boilerplate and helper functions for redux that can be shared amongst FounderLab apps

createGroupByReducer
--------------------
Use this to take an action parsed by responseParser and generate a map of lists of model ids grouped by a given key

e.g. here the byLesson property of the state will be a list of file ids that share a lessonId 

```javascript
const byLesson = createGroupByReducer([TYPES.FILE_LOAD + '_SUCCESS'], file => file.lessonId)

...

/*
  state will look like: 
  {
    ...
    byLesson: {
      123: {
        id: 1,
        lessonId: 123
      },
      456: {
        id: 2,
        lessonId: 456
      },
    },
  }
*/
export default function fileReducer(state=defaultState, action={}) {

  switch (action.type) {
    ...

    case TYPES.FILE_LOAD + '_SUCCESS':
      return = state.mergeDeep({
        loading: false,
        error: null,
        byLesson: byLesson(state.get('byLesson'), action),
      })

    ...
  }
}
```


createGroupByReducer
--------------------
Use this to take an action parsed by responseParser and generate a list of model ids grouped by a given key

e.g. here the byLesson property of the state will be a list of file ids that share a lessonId 

```javascript
const byLesson = createGroupByReducer([TYPES.FILE_LOAD + '_SUCCESS'], file => file.lessonId)

...

export default function fileReducer(state=defaultState, action={}) {

  switch (action.type) {
    ...

    case TYPES.FILE_LOAD + '_SUCCESS':
      return = state.mergeDeep({
        loading: false,
        error: null,
        byLesson: byLesson(state.get('byLesson'), action),
      })

    ...
  }
}
```
