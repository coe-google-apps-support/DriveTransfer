import React from 'react';
import PropTypes from 'prop-types';
import Task from '../../services/task.js';
import LogItem from './log-item.jsx';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';

const style = {
  list: {
    width: '400px',
  }
}

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
      this.setState({
        recent: result.data.message.changes,
        state: result.data.message.state,
      });
    });
  }

  render() {
    return (
      <List style={style.list}>
        {
          this.state.recent.slice(5).map((value) => {
            return <LogItem file={value.file}/>;
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
