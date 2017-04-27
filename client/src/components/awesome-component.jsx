import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';

const styles = {
  incrementButton: {
    margin: 16
  }
}

class AwesomeComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {likesCount : 0};
    this.onLike = this.onLike.bind(this);
  }

  onLike () {
    console.log('Liked');
    let newLikesCount = this.state.likesCount + 1;
    this.setState({likesCount: newLikesCount});
  }

  render() {
    return (
      <div>
        Likes : <span>{this.state.likesCount}</span>
        <div>
          <RaisedButton onTouchTap={this.onLike} label="Like Me" style={styles.incrementButton}/>
        </div>
      </div>
    );
  }

}

export default AwesomeComponent;
