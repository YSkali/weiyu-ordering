import request from '../utils/request'

export const getComments = (dishId, params) => request({ url: `/dishes/${dishId}/comments`, data: params })
export const createComment = (data) => request({ url: '/comments', method: 'POST', data })

// 管理员
export const deleteComment = (id) => request({ url: `/admin/comments/${id}/delete`, method: 'POST' })
export const topComment = (id, isTop) => request({ url: `/admin/comments/${id}/top`, method: 'POST', data: { is_top: isTop } })
