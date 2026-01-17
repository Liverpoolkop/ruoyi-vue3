import request from '@/utils/request'

// List Exams
export function listExam(query) {
  return request({
    url: '/edu/portal/exam/list',
    method: 'get',
    params: query
  })
}

// Get Exam Detail
export function getExam(examId) {
  return request({
    url: '/edu/portal/exam/' + examId,
    method: 'get'
  })
}

// Submit Exam
export function submitExam(data) {
  return request({
    url: '/edu/portal/exam/submit',
    method: 'post',
    data: data
  })
}
