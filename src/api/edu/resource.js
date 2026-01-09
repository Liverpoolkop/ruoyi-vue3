import request from '@/utils/request'

// 查询教学资源列表
export function listResource(query) {
  return request({
    url: '/education/resource/list',
    method: 'get',
    params: query
  })
}

// 查询教学资源详细
export function getResource(resourceId) {
  return request({
    url: '/education/resource/' + resourceId,
    method: 'get'
  })
}

// 新增教学资源
export function addResource(data) {
  return request({
    url: '/education/resource',
    method: 'post',
    data: data
  })
}

// 修改教学资源
export function updateResource(data) {
  return request({
    url: '/education/resource',
    method: 'put',
    data: data
  })
}

// 删除教学资源
export function delResource(resourceId) {
  return request({
    url: '/education/resource/' + resourceId,
    method: 'delete'
  })
}

// 下载资源
export function downloadResource(resourceId) {
  return request({
    url: '/education/resource/download/' + resourceId,
    method: 'get',
    responseType: 'blob', // ⚠️重点：必须告诉浏览器这是二进制流
  })
}