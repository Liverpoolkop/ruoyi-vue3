import request from '@/utils/request'

// 章节管理API - 使用模拟数据
export function listChapter(query) {
    console.log('调用章节API，参数:', query)

    // 获取数据
    // const courseId = query?.courseId || 1
    // let data = mockData[courseId] || mockData[1]

    // 如果有搜索条件，进行过滤
    // if (query?.chapterName) {
    //     data = data.filter(item => item.chapterName.includes(query.chapterName))
    // }
    if(query.courseId=10){
        return Promise.resolve({
            code: 200,
            msg: 'success',
            rows: [
                { chapterId: 102, chapterName: '第一章：操作系统概述', chapterOrder: 1, courseId: 10, parentId: 0, level: 1 },
                { chapterId: 103, chapterName: '第二章：进程管理', chapterOrder: 2, courseId: 10, parentId: 0, level: 1 },
                { chapterId: 103, chapterName: '2.1 进程概念', chapterOrder: 1, courseId: 10, parentId: 9, level: 2 },
                { chapterId: 104, chapterName: '2.2 进程调度', chapterOrder: 2, courseId: 10, parentId: 9, level: 2 },
                { chapterId: 101, chapterName: '第三章：内存管理', chapterOrder: 3, courseId: 10, parentId: 0, level: 1 }
            ]
        })
    }else{
        return Promise.resolve({
            code: 304,
            msg: 'fail',
            rows: []
        })
    }

}

export function getChapter(chapterId) {
    console.log('获取章节详情，ID:', chapterId)

    // 模拟所有章节数据
    const allChapters = [
        { chapterId: 1, chapterName: '第一章：绪论', courseId: 1, description: '数据结构基本概念介绍' },
        { chapterId: 2, chapterName: '第二章：线性表', courseId: 1, description: '线性表的概念和实现' },
        { chapterId: 3, chapterName: '2.1 顺序表', courseId: 1, parentId: 2, description: '顺序表的定义和操作' }
    ]

    const chapter = allChapters.find(item => item.chapterId === chapterId) || allChapters[0]

    return Promise.resolve({
        code: 200,
        msg: 'success',
        data: chapter
    })
}

export function addChapter(data) {
    console.log('添加章节:', data)

    return Promise.resolve({
        code: 200,
        msg: '添加成功',
        data: { chapterId: Date.now(), ...data }
    })
}

export function updateChapter(data) {
    console.log('更新章节:', data)

    return Promise.resolve({
        code: 200,
        msg: '更新成功',
        data: data
    })
}

export function delChapter(chapterId) {
    console.log('删除章节，ID:', chapterId)

    return Promise.resolve({
        code: 200,
        msg: '删除成功'
    })
}

// 获取章节树形结构
export function getChapterTree(courseId) {
    console.log('获取章节树，课程ID:', courseId)

    const chapterTree = [
        {
            chapterId: 1,
            chapterName: '第一章：绪论',
            children: []
        },
        {
            chapterId: 2,
            chapterName: '第二章：线性表',
            children: [
                {
                    chapterId: 3,
                    chapterName: '2.1 顺序表',
                    children: []
                },
                {
                    chapterId: 4,
                    chapterName: '2.2 链表',
                    children: []
                }
            ]
        },
        {
            chapterId: 5,
            chapterName: '第三章：栈和队列',
            children: [
                {
                    chapterId: 6,
                    chapterName: '3.1 栈',
                    children: []
                },
                {
                    chapterId: 7,
                    chapterName: '3.2 队列',
                    children: []
                }
            ]
        }
    ]

    return Promise.resolve({
        code: 200,
        msg: 'success',
        data: chapterTree
    })
}

// 获取课程的章节列表（扁平化）
// export function getChapterListByCourse(courseId) {
//     return listChapter({ courseId })
// }