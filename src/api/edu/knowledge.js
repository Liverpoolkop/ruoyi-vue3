import request from '@/utils/request.js'

// 知识点管理API
export function listKnowledge(query) {
    return request({
        url: '/edu/knowledge/list',
        method: 'get',
        params: query
    })
}

export function getKnowledge(knowledgeId) {
    return request({
        url: '/edu/knowledge/' + knowledgeId,
        method: 'get'
    })
}

export function addKnowledge(data) {
    return request({
        url: '/edu/knowledge',
        method: 'post',
        data: data
    })
}

export function updateKnowledge(data) {
    return request({
        url: '/edu/knowledge',
        method: 'put',
        data: data
    })
}

export function delKnowledge(knowledgeId) {
    return request({
        url: '/edu/knowledge/' + knowledgeId,
        method: 'delete'
    })
}

export function searchKnowledge(keyword) {
    return request({
        url: '/edu/knowledge/search',
        method: 'get',
        params: { keyword }
    })
}

export function getKnowledgeGraphByCourseId(courseId) {
    return request({
        url: '/edu/knowledge/knowledgeGraphByCourseId',
        method: 'get',
        params: { courseId }
    })
}

export function getRelatedKnowledge(resourceType, resourceId) {
    return request({
        url: '/edu/knowledge/related',
        method: 'get',
        params: { resourceType, resourceId }
    })
}

export function associateKnowledge(resourceType, resourceId, knowledgeIds) {
    return request({
        url: '/edu/knowledge/associate',
        method: 'post',
        data: { resourceType, resourceId, knowledgeIds }
    })
}

export function importKnowledge(data) {
    return request({
        url: '/edu/knowledge/importData',
        method: 'post',
        data: data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}