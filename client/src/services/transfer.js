import Axios from 'axios';

class TransferService {

  constructor() {

  }

  getList(id) {
    Axios.get('/api/list', {
      params: {id},
      withCredentials: true
    }).then((result) => {
      console.log(result);
    }).catch((err) => {
      console.log(err);
    });
  }
}

export default TransferService;
