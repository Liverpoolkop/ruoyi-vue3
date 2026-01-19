import request from '@/utils/request'

// Query Submission List
export function listSubmission(query) {
    return request({
        url: '/system/submission/list',
        method: 'get',
        params: query
    })
}

// Query Submission Detailed
export function getSubmission(id) {
    return request({
        url: '/system/submission/' + id,
        method: 'get'
    })
}

// Add Submission
export function addSubmission(data) {
    return request({
        url: '/system/submission',
        method: 'post',
        data: data
    })
}

// Update Submission (Grade)
export function updateSubmission(data) {
    return request({
        url: '/system/submission',
        method: 'put',
        data: data
    })
}

// Delete Submission
export function delSubmission(id) {
    return request({
        url: '/system/submission/' + id,
        method: 'delete'
    })
}

// Export Submission
export function exportSubmission(query) {
    return request({
        url: '/system/submission/export',
        method: 'post',
        params: query,
        responseType: 'blob'
    })
}
