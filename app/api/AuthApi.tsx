import request from './ApiCentral'

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
