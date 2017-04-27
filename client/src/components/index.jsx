import React from 'react';
import {render} from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AwesomeComponent from './awesome-component.jsx';

import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

class App extends React.Component {
  render () {
    return (
      <MuiThemeProvider>
        <AwesomeComponent />
      </MuiThemeProvider>
    );
  }
}

render(<App/>, document.getElementById('app'));
