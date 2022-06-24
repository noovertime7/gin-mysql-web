import request from '@/utils/request'

export function startBak(query) {
  return request({
    url: '/bak/start',
    method: 'get',
    params: query
  })
}

export function stopBak(query) {
  return request({
    url: '/bak/stop',
    method: 'get',
    params: query
  })
}

