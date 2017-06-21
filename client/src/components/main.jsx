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

const states = {
  START: 'START',
  PAUSE: 'PAUSE',
  RESUME: 'RESUME',
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
            buttonText: states.PAUSE,
          });
        });
      }
    }
    else if (this.state.buttonText === states.PAUSE) {
      TaskService.pauseTask(this.state.taskID).then(() => {
        this.setState({
          buttonText: states.RESUME,
        });
      });
    }
    else if (this.state.buttonText === states.RESUME) {
      TaskService.startTask(this.state.taskID).then(() => {
        this.setState({
          buttonText: states.PAUSE,
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
      return <TransferLog pollTime={1000} taskID={this.state.taskID} key='log'/>
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
        />
      </Paper>
    );
  }
}

export default Main;
