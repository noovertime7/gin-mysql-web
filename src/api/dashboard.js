import request from '@/utils/request'

export function panelGroupData() {
  return request({
    url: 'dashboard/panel_group_data',
    method: 'get'
  })
}
