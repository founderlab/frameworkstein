# Boilerplate and helper functions for react/redux that can be shared amongst FounderLab apps

Sidebar
-------
Wrapper for react-sidebar with some useful defaults.

```javascript
...
import {Sidebar} from 'fl-react-utils'

class SomeComponent extends React.Component {
  render() {
    const {model} = this.props

    return (
      <Sidebar
        sidebar: <SidebarContent />,    // Required, component to be rendered inside the sidebar
        changeKey: model.id,           // Sidebar will close when this key changes (useful for closing on navigation)
        disableToggle: false,          // Hide the open/close toggle button when not in docket mode (< 768px)
      >
        <div>App content goes here</div>
      </Sidebar>
    )
  }
}
```
