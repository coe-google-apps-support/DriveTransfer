import React from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import ReactCSSTransitionReplace from 'react-css-transition-replace';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import TransferService from '../services/transfer.js';
import TaskService from '../services/task.js';
import {grey600} from 'material-ui/styles/colors';
import State from '../model/state.js';
import Wizard from './wizard.jsx';
import TransferLog from './log/transfer-log.jsx';
import styles from './main.css';
import crossfade from './crossfade.css';
import PubSub from 'pubsub-js';

const baseDisplay = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  flex: '1 0 auto',
};

const buttonStyle = {
  margin: 12,
};

const textStyle = {
  fontFamily: 'Roboto, sans-serif',
  fontSize: '48px',
  color: grey600
}

const states = {
  START: 'START',
  CANCEL: 'CANCEL',
}

class Main extends React.Component {

  constructor(props) {
    super(props);

    State.subscribe(this);
    this.state = {
      folder: {
        id: '',
        title: '',
      },
      email: '',
      buttonText: states.START,
      buttonDisabled: false,
      wizardClass: `${styles.hideable} ${styles.show}`,
      logClass: `${styles.hideable} ${styles.hidden}`,
    };

    this.showWizard = true;
  }

  onClick() {
    if (this.state.buttonText === states.START) {
      if (this.wizard.validate()) {
        TransferService.createTransfer(this.state.folder.id, this.state.email)
        .then((taskID) => {
          State.setState({taskID});
          return TaskService.startTask(taskID);
        }).then((result) => {
          this.setState({
            buttonText: states.CANCEL,
          });
        });
      }
    }
    else if (this.state.buttonText === states.CANCEL) {
      TaskService.cancelTask(this.state.taskID).then(() => {
        // Reset to the wizard
        this.setState({
          buttonText: states.START,
        });
      });
    }
    else {
      console.log(`Unknown state ${this.state.buttonText}.`);
    }
  }

  setWizard(instance) {
    this.wizard = instance
  }

  getPane() {
    if (this.state.buttonText === states.START) {
      return <Wizard
        ref={this.setWizard.bind(this)}
        key='wizard'/>
    }
    else {
      return <TransferLog pollTime={4000} taskID={this.state.taskID} key='log'/>
    }
  }

  render () {
    let pane = this.getPane();

    return (
      <Paper zDepth={0} style={baseDisplay}>
        <img width='200px' height='200px' src='icon.png'/>
        <h1 style={textStyle} className={styles.hideable}>Drive Transfer</h1>

        <ReactCSSTransitionReplace
          transitionName={crossfade}
          changeWidth={true}
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={1000}>
          {pane}
        </ReactCSSTransitionReplace>

        <RaisedButton
          label={this.state.buttonText}
          primary={true}
          onTouchTap={this.onClick.bind(this)}
          style={buttonStyle}
          disabled={this.state.buttonDisabled}
        />
      </Paper>
    );
  }
}

export default Main;
