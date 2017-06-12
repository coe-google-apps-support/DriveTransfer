import React from 'react';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import TransferService from '../services/transfer.js';
import {grey600} from 'material-ui/styles/colors';
import State from '../model/state.js'
import Wizard from './wizard.jsx';
import styles from './main.css';

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
      newOwner: '',
      transferService: new TransferService(),
      showWizard: false,
    };
  }

  startTransfer(folderID, newOwner) {
    State.setState({
      responseVisible: true,
      selectedIndex: 1
    });
    this.setState({disabled: true});
    this.state.transferService.doTransfer(folderID, newOwner);
  }

  setFolderID(event) {
    State.setState({folderID: event.target.value})
  }

  setNewOwner(event) {
    State.setState({newOwner: event.target.value})
  }

  startWizard() {
    this.setState({showWizard: true});
  }

  render () {
    const {showWizard} = this.state;

    return (
      <Paper zDepth={0} style={baseDisplay}>
        <img width='200px' height='200px' src='icon.png'/>
        <h1 style={textStyle}>Drive Transfer</h1>

        <Wizard
          className={styles.hideable + ' ' + (showWizard ? styles.show : styles.hidden)}
          onStart={this.startTransfer.bind(this)}/>

        <RaisedButton
          className={styles.hideable + ' ' + (showWizard ? styles.hidden : styles.show)}
          disabled={this.state.disabled}
          label='Start'
          primary={true}
          style={buttonStyle}
          onTouchTap={this.startWizard.bind(this)}/>

      </Paper>
    );
  }
}

export default Main;
