import request from '@/utils/request'

export function getNestedList(courseId) {
  return request({
    url: '/system/chapter/tree/' + courseId,
    method: 'get'
  })
}

export function listChapter(query) {
  return request({
    url: '/system/chapter/list',
    method: 'get',
    params: query
  })
}

export function getChapter(chapterId) {
  return request({
    url: '/system/chapter/' + chapterId,
    method: 'get'
  })
}

export function addChapter(data) {
  return request({
    url: '/system/chapter',
    method: 'post',
    data: data
  })
}

export function updateChapter(data) {
  return request({
    url: '/system/chapter',
    method: 'put',
    data: data
  })
}

export function delChapter(chapterId) {
  return request({
    url: '/system/chapter/' + chapterId,
    method: 'delete'
  })
}
