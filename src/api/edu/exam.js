import request from '@/utils/request'

// ================== 考试管理相关 ==================

// 查询考试列表
export function listExam(query) {
  return request({
    url: '/edu/course/exam/list',
    method: 'get',
    params: query
  })
}

// 查询考试详细
export function getExam(id) {
  return request({
    url: '/edu/course/exam/' + id,
    method: 'get'
  })
}

// 新增考试
export function addExam(data) {
  return request({
    url: '/edu/course/exam',
    method: 'post',
    data: data
  })
}

// 修改考试
export function updateExam(data) {
  return request({
    url: '/edu/course/exam',
    method: 'put',
    data: data
  })
}

// 删除考试
export function delExam(id) {
  return request({
    url: '/edu/course/exam/' + id,
    method: 'delete'
  })
}

// 发布考试
export function publishExam(id) {
  return request({
    url: '/edu/course/exam/publish/' + id,
    method: 'put'
  })
}

// ================== 题库题目相关 (为了组卷) ==================

// 查询题目列表 (用于组卷弹窗)
export function listQuestion(query) {
  return request({
    url: '/system/question/list', // 假设题目管理的Controller路径是这个
    method: 'get',
    params: query
  })
}

// ================== 学生答题相关 ==================

// 1. 开始考试 (获取试卷内容 + 初始化记录)
export function startExam(examId) {
  return request({
    url: '/edu/course/exam/start/' + examId, // 对应后端的 @GetMapping("/start/{examId}")
    method: 'get'
  })
}

// 2. 提交试卷
export function submitExamPaper(data) {
  return request({
    url: '/edu/course/exam/submit', // 对应后端的提交接口
    method: 'post',
    data: data
  })
}

// 3. 记录作弊 (切屏)
export function recordCheat(data) {
  return request({
    url: '/edu/course/exam/cheat',
    method: 'post',
    data: data
  })
}

// 查询考试记录列表 (阅卷用)
export function listExamRecord(query) {
  return request({
    url: '/edu/course/exam/record/list',
    method: 'get',
    params: query
  })
}

// 获取答卷详情
export function getRecordDetail(recordId) {
  return request({
    url: '/edu/course/exam/record/detail/' + recordId,
    method: 'get'
  })
}

// 提交阅卷
export function gradeExam(data) {
  return request({
    url: '/edu/course/exam/grade',
    method: 'post',
    data: data
  })
}