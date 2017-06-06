import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import Paper from 'material-ui/Paper';

import State from '../model/state.js';

const styles = {
  root: {
    width: '100%',
    maxWidth: '400px',
    height: '200px',
    display: '-webkit-box',
    display: '-moz-box',
    display: '-ms-flexbox',
    display: '-webkit-flex',
    display: 'flex',
    flexDirection: 'column',
  },
  icon: {
    fontSize: '48px',
    color: 'rgb(66, 66, 66)',
    margin: '12px',
  },
  content: {
    margin: '0 16px',
    display: '-webkit-box',
    display: '-moz-box',
    display: '-ms-flexbox',
    display: '-webkit-flex',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actions: {
    marginTop: '12px',
    display: '-webkit-box',
    display: '-moz-box',
    display: '-ms-flexbox',
    display: '-webkit-flex',
    display: 'flex',
    alignItems: 'center',
  },
  folderPicker: {
    display: '-webkit-box',
    display: '-moz-box',
    display: '-ms-flexbox',
    display: '-webkit-flex',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '12px',
    cursor: 'pointer',
  },
  backButton: {
    marginRight: '12px',
  },
};

class Wizard extends React.Component {

  constructor(props) {
    super(props);

    this.handleNext = this.handleNext.bind(this);
    this.handlePrev = this.handlePrev.bind(this);

    this.state = {
      stepIndex: 0,
      stepDisabled: false,
      finished: false,
      newOwner: '',
      folder: '',
    };
  };

  handleNext() {
    const {stepIndex} = this.state;

    if (stepIndex + 1 >= 2) {
      this.setState({
        stepDisabled: true,
        finished: true,
      });
    }
    else {
      this.setState({
        stepIndex: stepIndex + 1,
      });
    }
  };

  handlePrev() {
    const {stepIndex} = this.state;

    if (stepIndex > 0) {
      this.setState({
        stepIndex: stepIndex - 1,
      });
    }
  };

  setNewOwner(event) {
    State.setState({newOwner: event.target.value});
  }

  selectFolder() {
    console.log('OPENING FOLDER PICKER');
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
      return (
        <TextField hintText='New Owner' />
      );

      case 1:
      return (
        <FlatButton style={{
          height: '100px',
          width: '300px',
        }} onClick={this.selectFolder.bind(this)}>
          <FontIcon style={styles.icon} className="material-icons">folder</FontIcon>
          <div>Select folder</div>
        </FlatButton>
      );

      default:
      return (
        <Paper style={styles.folderPicker} zDepth={1} onClick={this.selectFolder.bind(this)}>
          <FontIcon style={styles.icon} className="material-icons">folder</FontIcon>
          <div>Select folder</div>
        </Paper>
      );
    }
  }

  render() {
    const {stepIndex, stepDisabled} = this.state;

    return (
      <div style={styles.root} className={this.props.className}>
        <div style={styles.content}>
          {this.getStepContent(stepIndex)}
        </div>
        <div >
          <div style={styles.actions}>
            <FlatButton
              label="Back"
              disabled={stepIndex === 0 || stepDisabled}
              onTouchTap={this.handlePrev}
              style={{marginRight: 12}}
            />
            <RaisedButton
              disabled={stepDisabled}
              label={stepIndex === 1 ? 'Start' : 'Next'}
              primary={true}
              onTouchTap={this.handleNext}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Wizard;
