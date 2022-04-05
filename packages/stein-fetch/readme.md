# Fetch cursor


```
import fetch from 'stein-fetch'

// Create cursor using the same options as `fetch`
const fetchCursor = fetch(url, {
  headers: {
    'Content-Type': 'application/json',
  }
})

// Modify the request if desired
fetchCursor.setHeaders({
  ['x-some-header']: 'yep',  
})

// Call toJS to get the fetch result
const res = await fetchCursor.toJS()
```
