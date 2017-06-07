import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import Paper from 'material-ui/Paper';
import {validate} from 'email-validator';

import State from '../model/state.js';
import load from '../util/api-load.js';

const styles = {
  root: {
    width: '100%',
    maxWidth: '400px',
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
    flexDirection: 'column',
  },
  actions: {
    margin: '24px 0px',
    display: '-webkit-box',
    display: '-moz-box',
    display: '-ms-flexbox',
    display: '-webkit-flex',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderPicker: {
    height: '100px',
    width: '300px',
    margin: '12px 0px',
  },
};

class Wizard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      startEnabled: true,
      email: '',
      folder: '',
      emailError: '',
      validate: false,
    };

    this.pickerPromise = load('picker');
  };

  handleStart() {
    // Cause validation
    this.setState({
      validate: true,
    });

    const valid = this.validateEmailNow(this.state.email);

    // If successful, make callback
    if (valid) {
      console.log('Handling callback.')

    }
  };

  test(data) {
    console.log('TESSSSSST123');
    console.log(data);
  }

  selectFolder() {
    console.log('OPENING FOLDER PICKER');
    this.pickerPromise.then(() => {
      const token = client.credentials.access_token;

      let picker = new google.picker.PickerBuilder()
        .addView(google.picker.ViewId.FOLDERS)
        .setOAuthToken(token)
        .setCallback(this.test.bind(this))
        .build();
      picker.setVisible(true);
    });
  }

  validateEmailNow(address) {
    console.log('validating ' + address);
    if (!validate(address)) {
      this.setState({
        emailError: `${address} is not a valid email`,
      });
      return false;
    }
    else {
      this.setState({
        emailError: '',
      });
      return true;
    }
  }

  validateEmail(e) {
    const address = e.target.value;

    this.setState({
      email: address,
    });

    if (this.state.validate) {
      this.validateEmailNow(address);
    }
    else {
      console.log('not validating');
      return true;
    }
  }

  render() {
    return (
      <div style={styles.root} className={this.props.className}>
        <div style={styles.content}>

          <FlatButton style={styles.folderPicker} onClick={this.selectFolder.bind(this)}>
            <FontIcon style={styles.icon} className="material-icons">folder</FontIcon>
            <div>Select folder</div>
          </FlatButton>

          <TextField
            hintText='New Owner'
            errorText={this.state.emailError}
            onChange={this.validateEmail.bind(this)}/>
        </div>
        <div >
          <div style={styles.actions}>
            <RaisedButton
              disabled={!this.state.startEnabled}
              label={'Start'}
              primary={true}
              onTouchTap={this.handleStart.bind(this)}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Wizard;
