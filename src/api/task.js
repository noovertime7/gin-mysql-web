import request from '@/utils/request'

export function taskList(data) {
  console.log(data)
  return request({
    url: '/task/tasklist',
    method: 'get',
    params: data
  })
}
