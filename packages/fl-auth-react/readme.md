Ready made forms for use with fl-auth-redux and fl-auth-server
==============================================================

Part of fl-auth-*, an auth package for frameworkstein apps
----------------------------------------------------------

Usage: 

```javascript

    // Ensure that the auth reducer from fl-auth-redux is in place

    import {login, register} from 'fl-auth-redux'
    import {LoginForm, RegisterForm} from 'fl-auth-react'

    ...
    @connect(state => {auth: state.auth}, {login, register})
    class LoginExample extends React.Component {

      handleLogin = data => {
        // data here contains an email & password from LoginForm
        this.props.login('/login', data.email, data.password, err => {
          // Redirect somewhere once logged in
        })
      }

      handleRegister = data => {
        // data here contains an email & password from RegisterForm
        this.props.register('/register', data, err => {
          // Redirect somewhere after registration
        })
      }

      render() {
        const {auth, onSubmit} = this.props

        return (
          <div>
            <LoginForm auth={auth} onSubmit={handleLogin} />
            <RegisterForm auth={auth} onSubmit={handleRegister} />
          </div>
        )
      }
    }

```
