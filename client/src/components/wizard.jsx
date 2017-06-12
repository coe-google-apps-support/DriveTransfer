import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
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
  error: {
    color: 'rgb(244, 67, 54)',
  }
};

class Wizard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      startEnabled: true,
      email: '',
      folder: {
        title: 'Select folder',
      },
      emailError: '',
      folderError: false,
      validate: false,
    };

    this.pickerPromise = load('picker');
  };

  /**
   * Occurs when a transfer is initiated. Input is validate here.
   *
   */
  handleStart() {
    // Cause validation
    this.setState({
      validate: true,
    });

    const validEmail = this.validateEmailNow(this.state.email);
    const validFolder = this.validateFolder();
    // If successful, make callback
    if (validEmail && validFolder) {
      console.log('Handling callback.');
    }
  };

  /**
   * Called when the user has selected a folder.
   *
   * @param {Object} data An Object containing information related to the selection.
   */
  folderSelected(data) {
    const action = data[google.picker.Response.ACTION];

    if(action === google.picker.Action.PICKED) {
      const document = data.docs[0];
      const id = document.id;
      const title = document.name;

      this.setState({
        folder: {
          id,
          title,
        },
        folderError: false,
      })
    }
    else {
      console.log('Unknown type: ' + action);
    }
  }

  /**
   * This is called when the folder picker is needed.
   *
   */
  buildPicker() {
    this.pickerPromise.then(() => {
      const token = client.credentials.access_token;

      let view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
        .setIncludeFolders(true)
        .setSelectFolderEnabled(true);

      let picker = new google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(token)
        .setCallback(this.folderSelected.bind(this))
        .setOrigin(window.location.protocol + '//' + window.location.host)
        .setMaxItems(1)
        .build();
      picker.setVisible(true);
    });
  }

  /**
   * Ensures the user has selected a folder to transfer.
   *
   * @return {boolean} True if the folder has been selected.
   */
  validateFolder() {
    if (this.state.folder.id == null) {
      console.log('Please select a folder');
      this.setState({
        folderError: true,
      })
      return false;
    }

    return true;
  }

  /**
   * A non-event driven way to validate the new owner's email.
   *
   * @param {string} address The email address of the new owner.
   * @return {boolean} True if the address is valid.
   */
  validateEmailNow(address) {
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

  /**
   * Validates an input's text as an email.
   *
   * @param {Event} e The event object.
   */
  validateEmail(e) {
    const address = e.target.value;

    this.setState({
      email: address,
    });

    if (this.state.validate) {
      this.validateEmailNow(address);
    }
  }

  render() {
    return (
      <div style={styles.root} className={this.props.className}>
        <div style={styles.content}>

          <FlatButton style={styles.folderPicker} onClick={this.selectFolder.bind(this)}>
            <FontIcon style={styles.icon} className="material-icons">folder</FontIcon>
            <div style={this.state.folderError ? styles.error : {}}>{this.state.folder.title}</div>
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
