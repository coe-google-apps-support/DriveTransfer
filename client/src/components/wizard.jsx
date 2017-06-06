import React from 'react';
import {
  Step,
  Stepper,
  StepLabel,
} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

const styles = {
  root: {
    width: '100%',
    maxWidth: 700,
  },
  content: {
    margin: '0 16px',
  },
  actions: {
    marginTop: 12,
  },
  backButton: {
    marginRight: 12,
  },
};

class Wizard extends React.Component {

  constructor(props) {
    super(props);

    this.handleNext = this.handleNext.bind(this);
    this.handlePrev = this.handlePrev.bind(this);

    this.state = {
      finished: false,
      stepIndex: 0,
    };
  };

  handleNext() {
    const {stepIndex} = this.state;

    this.setState({
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 2,
    });
  };

  handlePrev() {
    const {stepIndex} = this.state;

    if (stepIndex > 0) {
      this.setState({
        stepIndex: stepIndex - 1,
      });
    }
  };

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
      return 'Select campaign settings...';

      case 1:
      return 'What is an ad group anyways?';

      case 2:
      return 'This is the bit I really care about!';

      default:
      return 'You\'re a long way from home sonny jim!';
    }
  }

  render() {
    const {finished, stepIndex} = this.state;
    const contentStyle = {margin: '0 16px'};

    return (
      <div style={styles.root} className={this.props.className}>
        <Stepper activeStep={stepIndex}>
          <Step>
            <StepLabel>Select campaign settings</StepLabel>
          </Step>
          <Step>
            <StepLabel>Create an ad group</StepLabel>
          </Step>
          <Step>
            <StepLabel>Create an ad</StepLabel>
          </Step>
        </Stepper>
        <div style={contentStyle}>
          <div>
            <p>{this.getStepContent(stepIndex)}</p>
            <div style={{marginTop: 12}}>
              <FlatButton
                label="Back"
                disabled={stepIndex === 0}
                onTouchTap={this.handlePrev}
                style={{marginRight: 12}}
              />
              <RaisedButton
                label={stepIndex === 2 ? 'Finish' : 'Next'}
                primary={true}
                onTouchTap={this.handleNext}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Wizard;
