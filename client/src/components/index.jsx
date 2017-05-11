import React from 'react';
import {render} from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {grey800} from 'material-ui/styles/colors';
import BottomBar from './bottom-bar.jsx';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Main from './main.jsx';

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

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

class App extends React.Component {
  render () {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={fillScreenStyle}>
          <Main></Main>
          <BottomBar/>
        </div>
      </MuiThemeProvider>
    );
  }
}

render(<App/>, document.getElementById('app'));
