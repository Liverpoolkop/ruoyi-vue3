import request from '@/utils/request'

export function listPortalCourse(query) {
  return request({
    url: '/portal/course/list',
    method: 'get',
    params: query
  })
}

export function getHotCourses() {
  return request({
    url: '/portal/course/hot',
    method: 'get'
  })
}

export function getNewCourses() {
  return request({
    url: '/portal/course/new',
    method: 'get'
  })
}
