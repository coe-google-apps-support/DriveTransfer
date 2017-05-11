import React from 'react';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import {grey600} from 'material-ui/styles/colors';

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

const textStyle = {
  fontFamily: 'Roboto, sans-serif',
  fontSize: '48px',
  color: grey600
}

class Main extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
      folderID: ''
    };
  }

  startTransfer() {
    this.setState({disabled: true});
    console.log('Value: ' + this.state.folderID);
  }

  setFolderID(event) {
    this.setState({folderID: event.target.value})
  }

  render () {
    return (
      <Paper zDepth={0} style={baseDisplay}>
        <img width='200px' height='200px' src='icon.png'/>
        <h1 style={textStyle}>Drive Transfer</h1>
        <TextField hintText='Folder ID' value={this.state.folderID} onChange={(e) => this.setFolderID(e)}/>
        <RaisedButton disabled={this.state.disabled} label='Start' primary={true} style={buttonStyle} onTouchTap={(e) => this.startTransfer(e)}/>
      </Paper>
    );
  }
}

export default Main;
