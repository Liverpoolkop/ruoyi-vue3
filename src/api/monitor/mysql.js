import request from '@/utils/request'

// 查询MySQL详细
export function getMysql() {
  return request({
    url: '/monitor/mysql',
    method: 'get'
  })
}
