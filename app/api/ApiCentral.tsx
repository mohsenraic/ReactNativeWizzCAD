import axios from 'axios';
import { API_ENDPOINT } from '../utils/Constants';


const request = async function (options: any) {


  const client = axios.create({
    baseURL: API_ENDPOINT
  });

  const onSuccess = function (response: any) {
    return response.data;
  }

  const onError = function (error: any) {
    return Promise.reject(error.response || error.message);
  }


  return client(options)
    .then(onSuccess)
    .catch(onError);
}

export default request;
