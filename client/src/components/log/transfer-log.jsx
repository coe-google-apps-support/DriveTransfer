import React from 'react';
import PropTypes from 'prop-types';
import Task from '../../services/task.js';
import LogItem from './log-item.jsx';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import {blue500, yellow600} from 'material-ui/styles/colors';

// Icons
import EditorInsertChart from 'material-ui/svg-icons/editor/insert-chart';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';
import ActionInfo from 'material-ui/svg-icons/action/info';

class TransferLog extends React.Component {
  constructor(props) {
    super(props);

    //this.setInterval(this.updateLog.bind(this), this.props.pollTime);
  }

  updateLog() {
    Task.getRecent(this.props.taskID);
  }

  render() {
    return (
      <List>
        <Subheader inset={true}>Transfers</Subheader>
        <ListItem
          leftAvatar={<Avatar icon={<ActionAssignment />} backgroundColor={blue500} />}
          rightIcon={<ActionInfo />}
          primaryText="Vacation itinerary"
          secondaryText="Jan 20, 2014"
        />
        <ListItem
          leftAvatar={<Avatar icon={<EditorInsertChart />} backgroundColor={yellow600} />}
          rightIcon={<ActionInfo />}
          primaryText="Kitchen remodel"
          secondaryText="Jan 10, 2014"
        />
      </List>
    );
  }
}

TransferLog.defaultProps = {
  pollTime: 3000,
};

TransferLog.propTypes = {
  taskID: PropTypes.string.isRequired,
  pollTime: PropTypes.number,
};

export default TransferLog;
