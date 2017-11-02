# Step header and content components with which to make a multi step form

Usage: 
-------------

```javascript
import {Step, Steps, StepHeader} from 'fl-react-steps'

// Check client/style.scss for variables you can override
import 'fl-react-steps/client/style.scss'

export default class SteppedForm extends React.Component {
  
  constructor() {
    super()
    this.state = {step: 1}
  }

  handleChangeStep = step => {
    this.setState({step})
  }

  render() {
    const {step} = this.state

    return (
      <div>
        <StepHeader headings={['First page', 'Second page']} step={step} onChangeStep={this.handleChangeStep} />

        <Steps step={step}>

          <Step>
            <form>
              {/* the first page of your form */}
            </form>
          </Step>

          <Step>
            <form>
              {/* the second page of your form, and so on */}
            </form>
          </Step>

        </Steps>
      </div>
    )
  }
}

```


StepHeader props: 
-----------------
```
step: The currenly active step 
headings: A list of titles for your steps
onChangeStep: Called when a step is clicked
className: Classes to give the step header wrapper node. Defaults to 'step-header clearfix'
stepClassName: Extra classes to give the individual header nodes
stepClass: Alias of stepClassName
```

Steps props: 
------------
```
step: The currenly active step 
```
