import request from '@/utils/request'

export function listCourse(query) {
  return request({ url: '/edu/course/list', method: 'get', params: query })
}

export function updateCourse(data) {
  return request({ url: '/edu/course', method: 'put', data })
}

export function delCourse(id) {
  return request({ url: `/edu/course/${id}`, method: 'delete' })
}

export function getJoinedCourseIds() {
  return request({ url: '/edu/course/joined', method: 'get' })
}

export function inviteCourse(id, hours) {
  return request({ url: `/edu/course/${id}/invite`, method: 'post', params: { hours } })
}

export function joinCourse(id) {
  return request({ url: `/edu/course/${id}/join`, method: 'post' })
}

export function joinCourseByCode(code) {
  return request({ url: `/edu/course/join/by-code`, method: 'post', params: { code } })
}

export function quitCourse(id) {
  return request({ url: `/edu/course/${id}/quit`, method: 'post' })
}

export function getCourse(id) {
  return request({ url: `/edu/course/${id}`, method: 'get' })
}

export function getMyCourses(query) {
  return request({ url: '/edu/course/my', method: 'get', params: query })
}

export function getMineCourses() {
  return request({ url: '/edu/course/mine', method: 'get' })
}

export function addCourse(data) {
  return request({ url: '/edu/course', method: 'post', data })
}

export function getCourseNotices(courseId) {
  return request({ url: `/edu/course/${courseId}/notices`, method: 'get' })
}

export function addCourseNotice(courseId, data) {
  return request({ url: `/edu/course/${courseId}/notice`, method: 'post', data })
}

export function delCourseNotice(courseId, noticeId) {
  return request({ url: `/edu/course/${courseId}/notice/${noticeId}`, method: 'delete' })
}

export function getCourseStudents(courseId, query) {
  return request({ url: `/edu/course/${courseId}/students`, method: 'get', params: query })
}

export function addCourseStudents(courseId, studentIds) {
  return request({ url: `/edu/course/${courseId}/students`, method: 'post', data: studentIds })
}

export function removeCourseStudent(courseId, studentId) {
  return request({ url: `/edu/course/${courseId}/students/${studentId}`, method: 'delete' })
}

export function addCourseStudentsFromClass(courseId, classId) {
  return request({ url: `/edu/course/${courseId}/students/class/${classId}`, method: 'post' })
}

export function importCourseStudents(courseId, file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({ url: `/edu/course/${courseId}/students/import`, method: 'post', data: formData })
}

export function approveJoin(data) {
  return request({ url: '/edu/course/approve', method: 'post', data })
}

export function getApplicants(courseId) {
  return request({ url: `/edu/course/${courseId}/applicants`, method: 'get' })
}
