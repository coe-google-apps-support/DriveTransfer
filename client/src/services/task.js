import Axios from 'axios';

class TaskService {

  static startTask(taskID) {
    return Axios.get('/api/task/run', {
      params: {taskID},
      withCredentials: true
    });
  }

  static pauseTask(taskID) {
    return Axios.get('/api/task/pause', {
      params: {taskID},
      withCredentials: true
    });
  }

  static getState(taskID) {
    return Axios.get('/api/task/state', {
      params: {taskID},
      withCredentials: true
    });
  }

}

export default TaskService;
