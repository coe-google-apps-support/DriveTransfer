import React from 'react';
import TextField from 'material-ui/TextField';


class Wizard extends React.Component {
  constructor(props) {
    super(props);
  }

  onChange() {

  }

  onSelect() {
    
  }

  render() {
    return (
      <TextField
        hintText={props.hintText}
        errorText={props.errorText}
        onChange={props.onChange}/>
    )
  }
}
