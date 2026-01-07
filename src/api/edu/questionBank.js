import request from '@/utils/request'

// 列表
export function getQuestionBank(params) {
  return request({
    url: '/edu/question/list',
    method: 'get',
    params
  })
}

// 新增
export function addQuestion(data) {
  return request({
    url: '/edu/question',
    method: 'post',
    data
  })
}

// 修改
export function editQuestion(data) {
  return request({
    url: '/edu/question',
    method: 'put',
    data
  })
}

// 删除
export function deleteQuestion(questionId) {
  return request({
    url: `/edu/question/${questionId}`,
    method: 'delete'
  })
}
