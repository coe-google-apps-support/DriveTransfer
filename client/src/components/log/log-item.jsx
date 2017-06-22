import React from 'react';
import PropTypes from 'prop-types';
import {ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import {blue500, yellow600} from 'material-ui/styles/colors';
import MIMEInfo from '../../services/mime-info.jsx';
import Moment from 'moment';

// Icons
import EditorInsertChart from 'material-ui/svg-icons/editor/insert-chart';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';
import ActionInfo from 'material-ui/svg-icons/action/info';
import FileFolder from 'material-ui/svg-icons/file/folder';

const maxLength = 26;

class LogItem extends React.Component {
  constructor(props) {
    super(props);
  }

  openURL() {
    window.open(this.props.file.webViewLink);
  }

  formatDate(dateString) {
    const months = [
      'January', 'February', 'March',
      'April', 'May', 'June',
      'July', 'August', 'September',
      'October', 'November', 'December'
    ];
    let date = new Date(dateString);

    return Moment(dateString).format('MMMM Do, YYYY');
  }

  render() {
    let icon = MIMEInfo.getIcon(this.props.file.mimeType);

    return (
      <ListItem
        leftAvatar={icon}
        rightIcon={<ActionInfo />}
        primaryText={this.props.file.name.substring(0, maxLength) + '...'}
        secondaryText={this.formatDate(this.props.file.createdTime)}
        onTouchTap={this.openURL.bind(this)}
      />
    );
  }
}

LogItem.propTypes = {
  file: PropTypes.object.isRequired,
};

export default LogItem;
