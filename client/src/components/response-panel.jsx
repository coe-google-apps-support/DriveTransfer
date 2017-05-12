import React from 'react';
import Dock from 'react-dock';
import FlatButton from 'material-ui/FlatButton';
import State from '../model/state.js';
import {grey600, grey900} from 'material-ui/styles/colors';

const dockStyle = {
  padding: '16px',
}

const bigTextStyle = {
  fontFamily: 'Roboto, sans-serif',
  fontSize: '48px',
  color: grey600
}

class ResponsePanel extends React.Component {
  constructor(props) {
    super(props);
    State.subscribe(this);
    this.state = {
      responseVisible: false,
      response: 'Waiting...'
    };
  }

  open() {
    State.setState({responseVisible: true});
  }

  close() {
    State.setState({
      responseVisible: false,
      selectedIndex: -1
    });
  }

  render() {
    return (
      <Dock position='right' isVisible={this.state.responseVisible} dimMode='none'>
        <div style={dockStyle}>
          <FlatButton label="X" secondary={true} onClick={this.close} />
          <h1 style={bigTextStyle}>Response Data</h1>
          <pre>{JSON.stringify(this.state.response, null, 2)}</pre>
        </div>
      </Dock>
    )
  }
}

export default ResponsePanel;
