import request from '@/utils/request'

export function listClass(query) {
  return request({ url: '/edu/class/list', method: 'get', params: query })
}

export function getClass(id) {
  return request({ url: `/edu/class/${id}`, method: 'get' })
}

export function addClass(data) {
  return request({ url: '/edu/class', method: 'post', data })
}

export function updateClass(data) {
  return request({ url: '/edu/class', method: 'put', data })
}

export function delClass(id) {
  return request({ url: `/edu/class/${id}`, method: 'delete' })
}

export function addStudent(classId, data) {
  return request({ url: `/edu/class/${classId}/students`, method: 'post', data })
}

export function removeStudent(classId, studentId) {
  return request({ url: `/edu/class/${classId}/students/${studentId}`, method: 'delete' })
}

export function addCourse(classId, data) {
  return request({ url: `/edu/class/${classId}/courses`, method: 'post', data })
}

export function removeCourse(classId, courseId) {
  return request({ url: `/edu/class/${classId}/courses/${courseId}`, method: 'delete' })
}

export function importStudents(classId, file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({ url: `/edu/import/class/${classId}/students`, method: 'post', data: formData })
}

export function batchAddStudents(classId, studentIds) {
  return request({ url: `/edu/class/${classId}/students/batch`, method: 'post', data: studentIds })
}

export function getUserBrief(query) {
  return request({ url: `/system/user/search`, method: 'get', params: { query } })
}

export function inviteClass(classId, params) {
  return request({ url: `/edu/class/${classId}/invite`, method: 'post', params })
}

export function joinClass(classId) {
  return request({ url: `/edu/class/${classId}/join`, method: 'post' })
}

export function joinByCode(code) {
  return request({ url: `/edu/class/join/by-code`, method: 'post', params: { code } })
}

export function getJoinedClassIds() {
  return request({ url: '/edu/class/joined', method: 'get' })
}

export function getMyClasses() {
  return request({ url: '/edu/class/mine', method: 'get' })
}
