import React from 'react';
import PropTypes from 'prop-types';
import Task from '../../services/task.js';
import TransferService from '../../services/transfer.js';
import LogItem from './log-item.jsx';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import CircularProgress from 'material-ui/CircularProgress';
import PubSub from 'pubsub-js';
import FlipMove from 'react-flip-move';

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

    PubSub.subscribe('main button click', this.buttonClicked.bind(this));

    this.state = {
      recent: [],
      displayState: 'Finding files...',
      intervalID: null,
    };
  }

  componentDidMount() {
    this.startUpdating();
  }

  componentWillUnmount() {
    this.stopUpdating();
  }

  startUpdating() {
    if (this.state.intervalID !== null) {
      console.log(`Interval ${this.state.intervalID} already exists.`);
      return;
    }

    let intervalID = setInterval(this.updateLog.bind(this), this.props.pollTime);
    this.setState({intervalID});
  }

  stopUpdating() {
    if (this.state.intervalID === null) {
      console.log(`No interval exists.`);
      return;
    }

    clearInterval(this.state.intervalID);
    this.setState({intervalID: null});
  }

  buttonClicked(topic, text) {
    if (text === 'RESUME') {
      this.stopUpdating();
    }
    else if (text === 'PAUSE') {
      this.startUpdating();
    }
  }

  updateLog() {
    TransferService.getSubstate(this.props.taskID).then((result) => {
      if (result.data.message === 'Done') {
        this.setState({displayState: 'Done!'});
        this.stopUpdating();
        this.setState({
          state: 'FINISHED'
        });
      }
      else {
        this.setState({displayState: result.data.message});
      }
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
          return <LogItem
            key={value.file.id}
            file={value.file}
          />;
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
          return <LogItem
            key={value.file.id}
            file={value.file}
          />;
        })
      );
    }

    return (
      <List style={style.list}>
        {loading}

        <FlipMove
          duration={700}
          easing='ease'
          delay={0}
          staggerDelayBy={20}
          staggerDurationBy={15}
          enterAnimation='fade'
          leaveAnimation='fade'
          >
          {display}
        </FlipMove>
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
