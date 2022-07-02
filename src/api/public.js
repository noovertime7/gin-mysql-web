import request from '@/utils/request'

export function downloadBakFile(id) {
  return request({
    url: '/public/check_file_exists',
    method: 'get',
    params: { id }
  })
}
