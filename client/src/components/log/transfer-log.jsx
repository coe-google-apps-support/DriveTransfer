import React from 'react';
import PropTypes from 'prop-types';
import Task from '../../services/task.js';
import LogItem from './log-item.jsx';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import FileFolder from 'material-ui/svg-icons/file/folder';
import {blue500, yellow600} from 'material-ui/styles/colors';

// Icons
import EditorInsertChart from 'material-ui/svg-icons/editor/insert-chart';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';
import ActionInfo from 'material-ui/svg-icons/action/info';

class TransferLog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recent: [],
    };
  }

  componentDidMount() {
    let intervalId = setInterval(this.updateLog.bind(this), this.props.pollTime);
    this.setState({intervalId: intervalId});
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  updateLog() {
    Task.getRecent(this.props.taskID).then((result) => {
      console.log(result);
      this.setState({
        recent: result.data.message.changes,
        state: result.data.message.state,
      });
    });
  }

  getRandom() {
    let options = [
      <ListItem
        leftAvatar={<Avatar icon={<ActionAssignment />} backgroundColor={blue500} />}
        rightIcon={<ActionInfo />}
        primaryText="Vacation itinerary"
        secondaryText="Jan 20, 2014"
      />,
      <ListItem
        leftAvatar={<Avatar icon={<EditorInsertChart />} backgroundColor={yellow600} />}
        rightIcon={<ActionInfo />}
        primaryText="Kitchen remodel"
        secondaryText="Jan 10, 2014"
      />,
      <ListItem
        leftAvatar={<Avatar icon={<FileFolder />} />}
        rightIcon={<ActionInfo />}
        primaryText="Photos"
        secondaryText="Jan 9, 2014"
      />,
      <ListItem
        leftAvatar={<Avatar icon={<FileFolder />} />}
        rightIcon={<ActionInfo />}
        primaryText="Recipes"
        secondaryText="Jan 17, 2014"
      />,
      <ListItem
        leftAvatar={<Avatar icon={<FileFolder />} />}
        rightIcon={<ActionInfo />}
        primaryText="Work"
        secondaryText="Jan 28, 2014"
      />,
    ];

    return options[Math.floor(Math.random() * options.length)];
  }

  render() {
    return (
      <List>
        {
          this.state.recent.slice(5).map((value) => {
            return this.getRandom();
          })
        }
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
