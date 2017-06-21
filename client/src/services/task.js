import Axios from 'axios';

class TaskService {
  static getTaskResult(taskID) {
    return Axios.get('/api/task/getResult', {
      params: {taskID},
      withCredentials: true
    });
  }

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

  static getRecent(taskID) {
    return Axios.get('/api/task/getRecent', {
      params: {taskID},
      withCredentials: true
    });
  }
}

export default TaskService;
