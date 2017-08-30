import React from 'react';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import State from '../model/state.js';
import {validate} from 'email-validator';
import load from '../util/api-load.js';
import Socket from '../services/socket.js';

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
  errorMargins: {
    marginBottom: '16px',
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

    State.subscribe(this);
    this.state = {
      emailError: '',
      folderError: false,
      validate: false,
      folder: {
        id: '',
        title: '',
      },
      email: '',
    };

    this.pickerPromise = load('picker');
    this.accessToken = null;
    //this.socketNotify = this.socketNotify;

    let socket = new Socket();
    socket.subscribe(this);
  };

  socketNotify(value) {
    console.log('Message received in wizard');
    if (value.accessToken) {
      this.accessToken = value.accessToken;
      console.log(`Setting access token to ${this.accessToken}`);
    }
  }

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

      this.onFolderChange({
        id,
        title
      });
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
      if (!this.accessToken) {
        throw new Error('No access token available. Is the server down?');
      }

      let view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
        .setIncludeFolders(true)
        .setSelectFolderEnabled(true);

      let picker = new google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(this.accessToken)
        .setCallback(this.folderSelected.bind(this))
        .setOrigin(window.location.protocol + '//' + window.location.host)
        .setMaxItems(1)
        .build();
      picker.setVisible(true);
    });
  }

  /**
   * Validates all input values.
   *
   */
  validate() {
    // Cause validation
    this.setState({
      validate: true,
    });

    const validEmail = this.validateEmail(this.state.email);
    const validFolder = this.validateFolder(this.state.folder.id);

    return validEmail && validFolder;
  };

  /**
   * Ensures the user has selected a folder to transfer.
   *
   * @param {string} id The ID of the folder to validate.
   * @return {boolean} True if the folder has been selected.
   */
  validateFolder(id) {
    if (id === '' || id == undefined) {
      console.log('Please select a folder');
      this.setState({
        folderError: true,
      })
      return false;
    }

    this.setState({
      folderError: false,
    })
    return true;
  }

  /**
   * A non-event driven way to validate the new owner's email.
   *
   * @param {string} address The email address of the new owner.
   * @return {boolean} True if the address is valid.
   */
  validateEmail(address) {
    if (!validate(address)) {
      this.setState({
        emailError: `Invalid email address`,
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

  onFolderChange(folder) {
    State.setState({folder});
  }

  onEmailChange(evt, value) {
    State.setState({
      email: value,
    });
  }

  render() {
    let rootStyle;
    if (this.state.emailError) {
      rootStyle = {...styles.root, ...styles.errorMargins};
    }
    else {
      rootStyle = styles.root;
    }

    return (
      <div style={rootStyle}>
        <div style={styles.content}>

          <FlatButton style={styles.folderPicker} onClick={this.buildPicker.bind(this)}>
            <FontIcon style={styles.icon} className="material-icons">folder</FontIcon>
            <div style={this.state.folderError ? styles.error : {}}>
              {this.state.folder.title != '' ? this.state.folder.title : 'Select folder'}
            </div>
          </FlatButton>

          <TextField
            hintText='New Owner'
            errorText={this.state.emailError}
            onChange={this.onEmailChange.bind(this)}
            value={this.state.email} />
        </div>

      </div>
    );
  }
}

export default Wizard;
