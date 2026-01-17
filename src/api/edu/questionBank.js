import request from '@/utils/request'

// Query Question Bank List
export function listBank(query) {
  return request({
    url: '/system/bank/list',
    method: 'get',
    params: query
  })
}

// Query Question Bank Detail
export function getBank(id) {
  return request({
    url: '/system/bank/' + id,
    method: 'get'
  })
}

// Add Question Bank
export function addBank(data) {
  return request({
    url: '/system/bank',
    method: 'post',
    data: data
  })
}

// Update Question Bank
export function updateBank(data) {
  return request({
    url: '/system/bank',
    method: 'put',
    data: data
  })
}

// Delete Question Bank
export function delBank(id) {
  return request({
    url: '/system/bank/' + id,
    method: 'delete'
  })
}

// Export Question Bank
export function exportBank(query) {
  return request({
    url: '/system/bank/export',
    method: 'post',
    params: query
  })
}
