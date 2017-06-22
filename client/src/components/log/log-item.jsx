import React from 'react';
import PropTypes from 'prop-types';
import {ListItem} from 'material-ui/List';
import MIMEInfo from '../../services/mime-info.jsx';
import Moment from 'moment';
import ActionInfo from 'material-ui/svg-icons/action/info';

const maxLength = 26;

class LogItem extends React.Component {
  constructor(props) {
    super(props);
  }

  openURL() {
    window.open(this.props.file.webViewLink);
  }

  formatDate(dateString) {
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
