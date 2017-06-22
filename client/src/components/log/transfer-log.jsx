import React from 'react';
import PropTypes from 'prop-types';
import Task from '../../services/task.js';
import LogItem from './log-item.jsx';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import CircularProgress from 'material-ui/CircularProgress';

const style = {
  list: {
    width: '400px',
  },
  subheader: {
    display: 'flex',
    justifyContent: 'center',
    paddingLeft: '0px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }
}

class TransferLog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recent: [],
      displayState: 'Finding files...',
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
      if (result.data.message.state === 'FINISHED') {
        this.setState({displayState: 'Done!'});
        clearInterval(this.state.intervalId);
        // Make a callback.
      }
      else if (result.data.message.changes.length > 0) {
        this.setState({displayState: 'Transferring files...'});
      }

      this.setState({
        recent: result.data.message.changes,
        state: result.data.message.state,
      });
    });
  }

  render() {
    let display;
    let loading;
    if (this.state.state === 'FINISHED') {
      loading =
        <Subheader style={style.subheader}>
          {this.state.displayState}
        </Subheader>

      display = (
        this.state.recent.slice(5).map((value) => {
          return <LogItem file={value.file}/>;
        })
      );
    }
    else {
      loading =
      <Subheader style={style.subheader}>
        <CircularProgress />
        {this.state.displayState}
      </Subheader>

      display = (
        this.state.recent.slice(5).map((value) => {
          return <LogItem file={value.file}/>;
        })
      );
    }

    return (
      <List style={style.list}>
        {loading}
        {display}

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
