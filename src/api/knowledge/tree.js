import request from '@/utils/request'

// 知识图谱树形数据API - 使用模拟数据

/**
 * 获取知识点树形结构
 * @param {Object} query 查询参数 { courseId, parentId, keyword }
 * @returns Promise
 */
export function treeSelect(query = {}) {
    console.log('调用treeSelect API，参数:', query)

    const { courseId = 1, parentId = 0, keyword = '' } = query

    // 模拟完整的知识点树形数据（按课程分类）
    const knowledgeTrees = {
        1: [ // 数据结构课程
            {
                knowledgeId: 101,
                knowledgeName: '数据结构基础',
                knowledgeCode: 'DS_BASIC',
                difficultyLevel: 'easy',
                status: '0',
                level: 1,
                children: [
                    {
                        knowledgeId: 102,
                        knowledgeName: '数据结构定义',
                        knowledgeCode: 'DS_DEF',
                        difficultyLevel: 'easy',
                        status: '0',
                        level: 2
                    },
                    {
                        knowledgeId: 103,
                        knowledgeName: '算法复杂度',
                        knowledgeCode: 'ALGO_COMPLEXITY',
                        difficultyLevel: 'medium',
                        status: '0',
                        level: 2,
                        children: [
                            {
                                knowledgeId: 104,
                                knowledgeName: '时间复杂度',
                                knowledgeCode: 'TIME_COMPLEXITY',
                                difficultyLevel: 'medium',
                                status: '0',
                                level: 3
                            },
                            {
                                knowledgeId: 105,
                                knowledgeName: '空间复杂度',
                                knowledgeCode: 'SPACE_COMPLEXITY',
                                difficultyLevel: 'medium',
                                status: '0',
                                level: 3
                            }
                        ]
                    }
                ]
            },
            {
                knowledgeId: 201,
                knowledgeName: '线性表',
                knowledgeCode: 'LINEAR_LIST',
                difficultyLevel: 'medium',
                status: '0',
                level: 1,
                children: [
                    {
                        knowledgeId: 202,
                        knowledgeName: '顺序表',
                        knowledgeCode: 'SEQUENCE_LIST',
                        difficultyLevel: 'medium',
                        status: '0',
                        level: 2,
                        children: [
                            {
                                knowledgeId: 203,
                                knowledgeName: '顺序表插入',
                                knowledgeCode: 'SEQ_INSERT',
                                difficultyLevel: 'medium',
                                status: '0',
                                level: 3
                            },
                            {
                                knowledgeId: 204,
                                knowledgeName: '顺序表删除',
                                knowledgeCode: 'SEQ_DELETE',
                                difficultyLevel: 'medium',
                                status: '0',
                                level: 3
                            }
                        ]
                    },
                    {
                        knowledgeId: 205,
                        knowledgeName: '链表',
                        knowledgeCode: 'LINKED_LIST',
                        difficultyLevel: 'hard',
                        status: '0',
                        level: 2,
                        children: [
                            {
                                knowledgeId: 206,
                                knowledgeName: '单链表',
                                knowledgeCode: 'SINGLE_LINKED',
                                difficultyLevel: 'hard',
                                status: '0',
                                level: 3
                            },
                            {
                                knowledgeId: 207,
                                knowledgeName: '双向链表',
                                knowledgeCode: 'DOUBLE_LINKED',
                                difficultyLevel: 'hard',
                                status: '0',
                                level: 3
                            }
                        ]
                    }
                ]
            },
            {
                knowledgeId: 301,
                knowledgeName: '树与二叉树',
                knowledgeCode: 'TREE_BINARY',
                difficultyLevel: 'hard',
                status: '0',
                level: 1,
                children: [
                    {
                        knowledgeId: 302,
                        knowledgeName: '二叉树遍历',
                        knowledgeCode: 'BINARY_TRAVERSE',
                        difficultyLevel: 'hard',
                        status: '0',
                        level: 2,
                        children: [
                            {
                                knowledgeId: 303,
                                knowledgeName: '先序遍历',
                                knowledgeCode: 'PREORDER',
                                difficultyLevel: 'medium',
                                status: '0',
                                level: 3
                            },
                            {
                                knowledgeId: 304,
                                knowledgeName: '中序遍历',
                                knowledgeCode: 'INORDER',
                                difficultyLevel: 'medium',
                                status: '0',
                                level: 3
                            },
                            {
                                knowledgeId: 305,
                                knowledgeName: '后序遍历',
                                knowledgeCode: 'POSTORDER',
                                difficultyLevel: 'medium',
                                status: '0',
                                level: 3
                            }
                        ]
                    }
                ]
            }
        ],
        2: [ // 操作系统课程
            {
                knowledgeId: 401,
                knowledgeName: '进程管理',
                knowledgeCode: 'PROCESS_MGMT',
                difficultyLevel: 'hard',
                status: '0',
                level: 1,
                children: [
                    {
                        knowledgeId: 402,
                        knowledgeName: '进程调度',
                        knowledgeCode: 'PROCESS_SCHEDULE',
                        difficultyLevel: 'hard',
                        status: '0',
                        level: 2
                    }
                ]
            }
        ],
        3: [ // 数据库系统课程
            {
                knowledgeId: 501,
                knowledgeName: 'SQL语言',
                knowledgeCode: 'SQL_LANG',
                difficultyLevel: 'medium',
                status: '0',
                level: 1,
                children: []
            }
        ]
    }

    // 获取指定课程的知识点树
    let treeData = knowledgeTrees[courseId] || knowledgeTrees[1]

    // 如果有关键词，过滤树
    if (keyword) {
        const filterTree = (nodes) => {
            return nodes.filter(node => {
                const match = node.knowledgeName.includes(keyword) ||
                    node.knowledgeCode.includes(keyword)
                if (match) return true

                if (node.children && node.children.length > 0) {
                    node.children = filterTree(node.children)
                    return node.children.length > 0
                }
                return false
            })
        }
        treeData = filterTree([...treeData])
    }

    // 如果指定了parentId，只返回该父节点的子节点
    if (parentId > 0) {
        const findNode = (nodes, pid) => {
            for (const node of nodes) {
                if (node.knowledgeId === pid) {
                    return node.children || []
                }
                if (node.children && node.children.length > 0) {
                    const result = findNode(node.children, pid)
                    if (result) return result
                }
            }
            return []
        }
        treeData = findNode(treeData, parentId)
    }

    // 如果没有children属性，添加空数组
    const ensureChildren = (nodes) => {
        return nodes.map(node => ({
            ...node,
            children: node.children ? ensureChildren(node.children) : []
        }))
    }

    treeData = ensureChildren(treeData)

    // 模拟网络延迟
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                code: 200,
                msg: 'success',
                data: treeData,
                rows: treeData // 为了兼容性
            })
        }, 500)
    })
}

/**
 * 获取知识点的子节点
 * @param {Number} knowledgeId 知识点ID
 * @returns Promise
 */
export function getChildren(knowledgeId) {
    console.log('获取子节点，知识ID:', knowledgeId)

    // 模拟数据
    const childrenMap = {
        101: [ // 数据结构基础的子节点
            { knowledgeId: 102, knowledgeName: '数据结构定义', level: 2 },
            { knowledgeId: 103, knowledgeName: '算法复杂度', level: 2 }
        ],
        103: [ // 算法复杂度的子节点
            { knowledgeId: 104, knowledgeName: '时间复杂度', level: 3 },
            { knowledgeId: 105, knowledgeName: '空间复杂度', level: 3 }
        ],
        201: [ // 线性表的子节点
            { knowledgeId: 202, knowledgeName: '顺序表', level: 2 },
            { knowledgeId: 205, knowledgeName: '链表', level: 2 }
        ],
        202: [ // 顺序表的子节点
            { knowledgeId: 203, knowledgeName: '顺序表插入', level: 3 },
            { knowledgeId: 204, knowledgeName: '顺序表删除', level: 3 }
        ]
    }

    const children = childrenMap[knowledgeId] || []

    return Promise.resolve({
        code: 200,
        msg: 'success',
        data: children
    })
}

/**
 * 获取知识点路径（从根节点到当前节点）
 * @param {Number} knowledgeId 知识点ID
 * @returns Promise
 */
export function getKnowledgePath(knowledgeId) {
    console.log('获取知识点路径，ID:', knowledgeId)

    // 模拟路径数据
    const pathMap = {
        104: [ // 时间复杂度的路径
            { knowledgeId: 101, knowledgeName: '数据结构基础' },
            { knowledgeId: 103, knowledgeName: '算法复杂度' },
            { knowledgeId: 104, knowledgeName: '时间复杂度' }
        ],
        206: [ // 单链表的路径
            { knowledgeId: 201, knowledgeName: '线性表' },
            { knowledgeId: 205, knowledgeName: '链表' },
            { knowledgeId: 206, knowledgeName: '单链表' }
        ],
        303: [ // 先序遍历的路径
            { knowledgeId: 301, knowledgeName: '树与二叉树' },
            { knowledgeId: 302, knowledgeName: '二叉树遍历' },
            { knowledgeId: 303, knowledgeName: '先序遍历' }
        ]
    }

    const path = pathMap[knowledgeId] || [
        { knowledgeId: 101, knowledgeName: '数据结构基础' }
    ]

    return Promise.resolve({
        code: 200,
        msg: 'success',
        data: path
    })
}

/**
 * 搜索知识点树
 * @param {String} keyword 搜索关键词
 * @returns Promise
 */
export function searchKnowledgeTree(keyword) {
    console.log('搜索知识点树，关键词:', keyword)

    // 模拟搜索结果
    const searchResults = [
        {
            knowledgeId: 102,
            knowledgeName: '数据结构定义',
            fullPath: '数据结构基础 > 数据结构定义',
            courseName: '数据结构'
        },
        {
            knowledgeId: 104,
            knowledgeName: '时间复杂度',
            fullPath: '数据结构基础 > 算法复杂度 > 时间复杂度',
            courseName: '数据结构'
        },
        {
            knowledgeId: 206,
            knowledgeName: '单链表',
            fullPath: '线性表 > 链表 > 单链表',
            courseName: '数据结构'
        }
    ].filter(item =>
        item.knowledgeName.includes(keyword) ||
        item.fullPath.includes(keyword)
    )

    return Promise.resolve({
        code: 200,
        msg: 'success',
        data: searchResults,
        total: searchResults.length
    })
}

/**
 * 获取知识点的完整树（包含所有层级）
 * @param {Object} query 查询参数
 * @returns Promise
 */
export function getFullKnowledgeTree(query = {}) {
    return treeSelect(query)
}

/**
 * 获取扁平化的知识点列表（用于选择器）
 * @param {Object} query 查询参数
 * @returns Promise
 */
export function getKnowledgeOptions(query = {}) {
    console.log('获取知识点选项，参数:', query)

    // 扁平化树形数据
    const flattenTree = (nodes, level = 1, prefix = '') => {
        let result = []
        nodes.forEach(node => {
            const indent = '  '.repeat(level - 1)
            result.push({
                value: node.knowledgeId,
                label: prefix + indent + node.knowledgeName,
                knowledgeId: node.knowledgeId,
                knowledgeName: node.knowledgeName,
                difficultyLevel: node.difficultyLevel,
                level: level,
                hasChildren: node.children && node.children.length > 0
            })
            if (node.children && node.children.length > 0) {
                result = result.concat(flattenTree(node.children, level + 1, prefix))
            }
        })
        return result
    }

    return treeSelect(query).then(response => {
        if (response.code === 200) {
            const flatData = flattenTree(response.data)
            return {
                code: 200,
                msg: 'success',
                data: flatData,
                rows: flatData
            }
        }
        return response
    })
}