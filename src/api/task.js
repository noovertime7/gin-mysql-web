import request from '@/utils/request'

export function taskList(data) {
  console.log(data)
  return request({
    url: '/task/tasklist',
    method: 'get',
    params: data
  })
}

export function taskDelete(query) {
  return request({
    url: '/task/taskdelete',
    method: 'delete',
    params: query
  })
}
