import React from 'react';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import TransferService from '../services/transfer.js';
import {grey600} from 'material-ui/styles/colors';
import State from '../model/state.js'

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

    State.subscribe(this);

    this.state = {
      disabled: false,
      folderID: '',
      transferService: new TransferService()
    };
  }

  startTransfer() {
    State.setState({
      responseVisible: true,
      selectedIndex: 1
    });
    this.setState({disabled: true});
    this.state.transferService.getList(this.state.folderID);
  }

  setFolderID(event) {
    State.setState({folderID: event.target.value})
  }

  render () {
    return (
      <Paper zDepth={0} style={baseDisplay}>
        <img width='200px' height='200px' src='icon.png'/>
        <h1 style={textStyle}>Drive Transfer</h1>
        <TextField hintText='Folder ID' value={this.state.folderID} onChange={this.setFolderID.bind(this)}/>
        <RaisedButton
          disabled={this.state.disabled}
          label='Start'
          primary={true}
          style={buttonStyle}
          onTouchTap={this.startTransfer.bind(this)}/>
      </Paper>
    );
  }
}

export default Main;
