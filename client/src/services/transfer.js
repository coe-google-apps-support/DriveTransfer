import Axios from 'axios';
import State from '../model/state.js';
import TaskService from './task.js';

class TransferService {

  static createTransfer(id, to) {
    return Axios.get('/api/transfer', {
      params: {id, to},
      withCredentials: true
    }).then((result) => {
      let taskID = result.data.message;
      State.setState({
        response: result,
        taskID: taskID,
      });

      return taskID;
    }).catch((err) => {
      console.log(err);
      State.setState({
        response: err.toString()
      });
    });
  }
}

export default TransferService;
