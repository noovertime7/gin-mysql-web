import request from '@/utils/request'

export function GetServiceList() {
  return request({
    url: '/agent/agentlist',
    method: 'get',
  })
}

