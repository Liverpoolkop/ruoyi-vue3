import request from '@/utils/request.js'

// 知识点管理API
export function listKnowledge(query) {
    return request({
        url: '/knowledge/knowledge/list',
        method: 'get',
        params: query
    })
}

export function getKnowledge(knowledgeId) {
    return request({
        url: '/knowledge/knowledge/' + knowledgeId,
        method: 'get'
    })
}

export function addKnowledge(data) {
    return request({
        url: '/knowledge/knowledge',
        method: 'post',
        data: data
    })
}

export function updateKnowledge(data) {
    return request({
        url: '/knowledge/knowledge',
        method: 'put',
        data: data
    })
}

export function delKnowledge(knowledgeId) {
    return request({
        url: '/knowledge/knowledge/' + knowledgeId,
        method: 'delete'
    })
}

export function searchKnowledge(keyword) {
    return request({
        url: '/knowledge/knowledge/search',
        method: 'get',
        params: { keyword }
    })
}

export function getKnowledgeGraphByCourseId(courseId) {
    return request({
        url: '/knowledge/knowledge/knowledgeGraphByCourseId',
        method: 'get',
        params: { courseId }
    })
}

export function getRelatedKnowledge(resourceType, resourceId) {
    return request({
        url: '/knowledge/knowledge/related',
        method: 'get',
        params: { resourceType, resourceId }
    })
}

export function associateKnowledge(resourceType, resourceId, knowledgeIds) {
    return request({
        url: '/knowledge/knowledge/associate',
        method: 'post',
        data: { resourceType, resourceId, knowledgeIds }
    })
}