import request from '@/utils/request'

// Query Question List
export function listQuestion(query) {
    return request({
        url: '/system/question/list',
        method: 'get',
        params: query
    })
}

// Query Question Detail
export function getQuestion(id) {
    return request({
        url: '/system/question/' + id,
        method: 'get'
    })
}

// Add Question
export function addQuestion(data) {
    return request({
        url: '/system/question',
        method: 'post',
        data: data
    })
}

// Update Question
export function updateQuestion(data) {
    return request({
        url: '/system/question',
        method: 'put',
        data: data
    })
}

// Delete Question
export function delQuestion(id) {
    return request({
        url: '/system/question/' + id,
        method: 'delete'
    })
}

// Export Question
export function exportQuestion(query) {
    return request({
        url: '/system/question/export',
        method: 'post',
        params: query
    })
}

// Download Import Template
export function importTemplate() {
    return request({
        url: '/system/question/importTemplate',
        method: 'post'
    })
}
