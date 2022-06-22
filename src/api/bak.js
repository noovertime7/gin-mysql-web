import request from '@/utils/request';

export function startBak(query) {
  return request({
    url: '/bak/start',
    method: 'get',
    params: query
  })
}
