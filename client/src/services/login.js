import Axios from 'axios';

class LoginService {
  static login() {
    Axios.get('/api/login').then((result) => {
      console.log(result);
    });
  }
}

export default LoginService;
