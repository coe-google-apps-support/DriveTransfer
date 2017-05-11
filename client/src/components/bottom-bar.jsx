import React, {Component} from 'react';
import FontIcon from 'material-ui/FontIcon';
import FontAwesome from 'react-fontawesome';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';

const iconStyle = {
  fontSize: '24px',
  color: 'rgb(255, 255, 255)'
}

const sitAtBottom = {
  position: 'absolute',
  bottom: '0px',
  left: '0px',
  right: '0px'
}

const supportIcon = <FontIcon style={iconStyle} className="material-icons">help</FontIcon>;
const codeIcon = <FontIcon style={iconStyle} className="material-icons">code</FontIcon>;
const nearbyIcon = <FontIcon style={iconStyle} className="material-icons">location_on</FontIcon>;
const githubIcon = <FontAwesome style={iconStyle} name="github" />

/**
 * A simple example of `BottomNavigation`, with three labels and icons
 * provided. The selected `BottomNavigationItem` is determined by application
 * state (for instance, by the URL).
 */
class BottomNavigationExampleSimple extends Component {

  constructor(props) {
    super(props);
    this.state = {selectedIndex: -1};
  }

  select(index) {
    this.setState({selectedIndex: index});
  }

  render() {
    return (
      <Paper style={sitAtBottom} zDepth={0}>
        <BottomNavigation selectedIndex={this.state.selectedIndex}>
          <BottomNavigationItem
            label="Support"
            icon={supportIcon}
            onTouchTap={() => this.select(0)}
          />
          <BottomNavigationItem
            label="Code"
            icon={codeIcon}
            onTouchTap={() => this.select(1)}
          />
          <BottomNavigationItem
            label="Nearby"
            icon={nearbyIcon}
            onTouchTap={() => this.select(2)}
          />
          <BottomNavigationItem
            label="Github"
            icon={githubIcon}
            onTouchTap={() => this.select(3)}
          />
        </BottomNavigation>
      </Paper>
    );
  }
}

export default BottomNavigationExampleSimple;
