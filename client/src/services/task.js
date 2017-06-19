import Axios from 'axios';

class TaskService {
  static getTaskResult(taskID) {
    return Axios.get('/api/task/getResult', {
      params: {id},
      withCredentials: true
    });
  }

  static startTask(taskID) {
    return Axios.get('/api/task/run', {
      params: {id},
      withCredentials: true
    });
  }

  static pauseTask(taskID) {
    return Axios.get('/api/task/pause', {
      params: {id},
      withCredentials: true
    });
  }
}

export default TaskService;
