import React from 'react';
import PropTypes from 'prop-types';

class LogItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>{this.props.title}</div>
    );
  }
}

LogItem.propTypes = {
  title: PropTypes.string.isRequired,
};

export default LogItem;
