import request from '@/utils/request'

/**
 * 获取实验列表
 */
export function listExperiment(query) {
    return request({
        url: '/edu/experiment/list',
        method: 'get',
        params: query
    })
}

/**
 * 获取实验详情
 */
export function getExperiment(id) {
    return request({
        url: `/edu/experiment/${id}`,
        method: 'get'
    })
}

/**
 * 新增实验
 */
export function addExperiment(data) {
    return request({
        url: '/edu/experiment',
        method: 'post',
        data
    })
}

/**
 * 修改实验
 */
export function updateExperiment(data) {
    return request({
        url: '/edu/experiment',
        method: 'put',
        data
    })
}

/**
 * 删除实验
 */
export function delExperiment(id) {
    return request({
        url: `/edu/experiment/${id}`,
        method: 'delete'
    })
}

/**
 * 运行代码（不判题）
 */
export function runCode(experimentId, code, stdin) {
    return request({
        url: `/edu/experiment/${experimentId}/run`,
        method: 'post',
        data: { code, stdin }
    })
}

/**
 * 提交代码（判题）
 */
export function submitCode(experimentId, code) {
    return request({
        url: `/edu/experiment/${experimentId}/submit`,
        method: 'post',
        data: { code }
    })
}

/**
 * 获取提交历史
 */
export function getSubmissions(experimentId) {
    return request({
        url: `/edu/experiment/${experimentId}/submissions`,
        method: 'get'
    })
}

/**
 * 教师获取所有学生提交记录
 */
export function getAllSubmissions(experimentId) {
    return request({
        url: `/edu/experiment/${experimentId}/all-submissions`,
        method: 'get'
    })
}
