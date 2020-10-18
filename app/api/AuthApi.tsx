import request from './ApiCentral'

/**
 * Permet de recuperer le token d'un utilistateur
 * @param username 
 * @param password 
 */
function auth(username: any, password: any) {
  const params = new URLSearchParams();
  params.append('login', username);
  params.append('password', password);
  return request({
    params: params,
    url: '/logins',
    method: 'GET',
  });
}

export const AuthApi = {
  auth
}
