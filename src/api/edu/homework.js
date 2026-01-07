import request from '@/utils/request'

// 查询作业列表（按课程）
export function listHomework(params) {
  return request({
    url: '/edu/homework/list',
    method: 'get',
    params
  })
}
// 教师：查看某作业的提交列表
export function listHomeworkSubmits(params) {
  return request({
    url: '/edu/homework/submits',
    method: 'get',
    params
  })
}


// 教师：评分
export function gradeHomeworkSubmit(submitId, score, teacherComment) {
  return request({
    url: '/edu/homework/grade',
    method: 'post',
    data: {
      submitId,
      score,
      teacherComment
    }
  })
}


// 新增作业
export function addHomework(data) {
  return request({
    url: '/edu/homework',
    method: 'post',
    data
  })
}

// 学生提交作业
export function submitHomework(data) {
  return request({
    url: '/edu/homework/submit',
    method: 'post',
    data
  })
}

// 我的提交列表（按课程）
export function listMySubmits(query) {
  return request({
    url: '/edu/homework/mySubmits',
    method: 'get',
    params: query
  })
}

