import React from 'react';
import LoginService from '../services/login.js';
import RaisedButton from 'material-ui/RaisedButton';

const buttonStyle = {
  margin: 12,
};

class Login extends React.Component {
  constructor(props) {
    super(props);
  }

  login() {
    console.log('Logging in');
    LoginService.login();
  }

  render() {
    return (
      <div>
        <RaisedButton
          label='Login'
          primary={true}
          style={buttonStyle}
          onTouchTap={this.login.bind(this)}/>
      </div>
    );
  }
}

export default Login
