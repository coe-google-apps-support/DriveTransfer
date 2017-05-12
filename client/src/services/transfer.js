import Axios from 'axios';
import State from '../model/state.js';

class TransferService {

  constructor() {

  }

  getList(id) {
    Axios.get('/api/list', {
      params: {id},
      withCredentials: true
    }).then((result) => {
      console.log('success');
      State.setState({
        response: result
      });
    }).catch((err) => {
      console.log(err);
      State.setState({
        response: err.toString()
      });
    });
  }
}

export default TransferService;
