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

export function bakList(data) {
  console.log(data)
  return request({
    url: '/bak/historylist',
    method: 'get',
    params: data
  })
}

export function getBakHistoryList() {
  return request({
    url: '/bak/findallhistory',
    method: 'get'
  })
}

