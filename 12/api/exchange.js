import request from '../utils/request'

// 顾客
export const getRewards = (params) => request({ url: '/exchange/rewards', data: params })
export const createReward = (data) => request({ url: '/exchange/rewards', method: 'POST', data })
export const getMyRewards = (params) => request({ url: '/exchange/my-rewards', data: params })
export const updateReward = (id, data) => request({ url: `/exchange/rewards/${id}`, method: 'PUT', data })
export const deleteReward = (id) => request({ url: `/exchange/rewards/${id}`, method: 'DELETE' })
export const createRequest = (data) => request({ url: '/exchange/requests', method: 'POST', data })
export const getMyRequests = (params) => request({ url: '/exchange/requests', data: params })

// 管理员
export const getAdminRewards = (params) => request({ url: '/admin/exchange/rewards', data: params })
export const approveReward = (id) => request({ url: `/admin/exchange/rewards/${id}/approve`, method: 'POST' })
export const rejectReward = (id) => request({ url: `/admin/exchange/rewards/${id}/reject`, method: 'POST' })
export const claimReward = (id) => request({ url: `/admin/exchange/rewards/${id}/claim`, method: 'POST' })
export const getAllRequests = (params) => request({ url: '/admin/exchange/requests', data: params })
export const reviewRequest = (id, data) => request({ url: `/admin/exchange/requests/${id}`, method: 'PUT', data })
