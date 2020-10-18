import request from './ApiCentral'
import { AsyncStorage } from 'react-native';
import { AUTH_KEY } from '../utils/Constants';

/**
 * Permet de recuperer le contenue d'un formulaire
 */
async function getContent() {
  const token = await AsyncStorage.getItem(AUTH_KEY)
  return request({
    url: '/' + token,
    method: 'GET'
  });
}


export const DetailsApi = {
  getContent
}
