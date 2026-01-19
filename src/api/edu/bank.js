import request from '@/utils/request'

// Query Question Bank List
export function listEduQuestionBank(query) {
  return request({
    url: '/system/bank/list',
    method: 'get',
    params: query
  })
}

// Query Question Bank Detailed Info
export function getEduQuestionBank(id) {
  return request({
    url: '/system/bank/' + id,
    method: 'get'
  })
}

// Add Question Bank
export function addEduQuestionBank(data) {
  return request({
    url: '/system/bank',
    method: 'post',
    data: data
  })
}

// Update Question Bank
export function updateEduQuestionBank(data) {
  return request({
    url: '/system/bank',
    method: 'put',
    data: data
  })
}

// Delete Question Bank
export function delEduQuestionBank(id) {
  return request({
    url: '/system/bank/' + id,
    method: 'delete'
  })
}

// Export Question Bank
export function exportEduQuestionBank(query) {
  return request({
    url: '/system/bank/export',
    method: 'post',
    params: query
  })
}
