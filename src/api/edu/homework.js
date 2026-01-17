import request from '@/utils/request'

// Query Homework List
export function listHomework(query) {
    return request({
        url: '/system/homework/list',
        method: 'get',
        params: query
    })
}

// Query Homework Detailed
export function getHomework(id) {
    return request({
        url: '/system/homework/' + id,
        method: 'get'
    })
}

// Add Homework
export function addHomework(data) {
    return request({
        url: '/system/homework',
        method: 'post',
        data: data
    })
}

// Update Homework
export function updateHomework(data) {
    return request({
        url: '/system/homework',
        method: 'put',
        data: data
    })
}

// Delete Homework
export function delHomework(id) {
    return request({
        url: '/system/homework/' + id,
        method: 'delete'
    })
}
