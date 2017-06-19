import React from 'react';
import {render} from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {grey800, grey600} from 'material-ui/styles/colors';
import injectTapEventPlugin from 'react-tap-event-plugin';

import BottomBar from '../components/bottom-bar.jsx';

const muiTheme = getMuiTheme({
  bottomNavigation: {
    backgroundColor: grey800,
    unselectedColor: 'rgb(255, 255, 255)',
  }
})

const fillScreenStyle = {
  height: '100%',
  width: '100%',
  margin: '0px'
}

const textStyle = {
  fontFamily: 'Roboto, sans-serif',
  fontSize: '48px',
  color: grey600
}

const baseDisplay = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center'
};

const buttonStyle = {
  margin: 12,
};

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

class App extends React.Component {

  login() {
    console.log('Login');
    window.location.href = '/login';
  }

  render () {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={fillScreenStyle}>
          <Paper zDepth={0} style={baseDisplay}>
            <img width='200px' height='200px' src='icon.png'/>
            <h1 style={textStyle}>Drive Transfer</h1>
            <RaisedButton
              label='Login'
              primary={true}
              style={buttonStyle}
              onTouchTap={this.login.bind(this)}/>
          </Paper>
          <BottomBar/>
        </div>
      </MuiThemeProvider>
    );
  }
}

render(<App/>, document.getElementById('app'));
