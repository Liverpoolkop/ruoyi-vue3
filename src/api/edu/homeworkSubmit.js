import request from '@/utils/request'

// 学生提交作业
export function submitHomework(data) {
  return request({
    url: '/edu/homeworkSubmit/submit',
    method: 'post',
    data
  })
}

// 学生查询自己在本课程下的提交记录
export function listMySubmits(courseId) {
  return request({
    url: '/edu/homeworkSubmit/my',
    method: 'get',
    params: { courseId }
  })
}
