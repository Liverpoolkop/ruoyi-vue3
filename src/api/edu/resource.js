import request from '@/utils/request'

// 查询资源列表
export function listResource(query) {
  return request({
    url: '/edu/resource/list',
    method: 'get',
    params: query
  })
}

// 查询资源详细
export function getResource(resourceId) {
  return request({
    url: '/edu/resource/' + resourceId,
    method: 'get'
  })
}

// 新增资源
export function addResource(data) {
  return request({
    url: '/edu/resource',
    method: 'post',
    data: data
  })
}

// 修改资源
export function updateResource(data) {
  return request({
    url: '/edu/resource',
    method: 'put',
    data: data
  })
}

// 删除资源
export function delResource(resourceId) {
  return request({
    url: '/edu/resource/' + resourceId,
    method: 'delete'
  })
}

// 下载资源
export function downloadResource(resourceId) {
  return request({
    url: '/edu/resource/download/' + resourceId,
    method: 'get',
    responseType: 'blob', // ⚠️重点：必须告诉浏览器这是二进制流
  })
}
