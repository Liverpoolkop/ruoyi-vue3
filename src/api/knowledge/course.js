import request from '@/utils/request'

// 课程管理API
// export function listCourse(query) {
//     return request({
//         url: '/knowledge/course/list',
//         method: 'get',
//         params: query
//     })
// }
export function listCourse() {
    return Promise.resolve({
        code: 200,
        msg: 'success',
        rows: [
            { courseId: 10, courseName: '高等数学（上）', courseCode: 'CS101' },
            { courseId: 2, courseName: '操作系统', courseCode: 'CS102' },
            { courseId: 3, courseName: '数据库系统', courseCode: 'CS103' }
        ]
    })
}

export function getCourse(courseId) {
    return request({
        url: '/knowledge/course/' + courseId,
        method: 'get'
    })
}

// 如果没有对应的后端接口，可以先返回模拟数据
