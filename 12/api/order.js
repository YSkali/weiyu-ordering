import request from '../utils/request'

export const createOrder = (data) => request({ url: '/orders', method: 'POST', data })
export const getOrders = (params) => request({ url: '/orders', data: params })
export const getOrderDetail = (id) => request({ url: `/orders/${id}` })
export const confirmOrder = (id) => request({ url: `/orders/${id}/confirm`, method: 'POST' })

// 管理员
export const getAdminOrders = (params) => request({ url: '/admin/orders', data: params })
export const updateOrderStatus = (id, status) => request({ url: `/admin/orders/${id}/status`, method: 'PUT', data: { status } })
export const updateItemStatus = (orderId, itemId, status) => request({ url: `/admin/orders/${orderId}/items/${itemId}/status`, method: 'PUT', data: { status } })
