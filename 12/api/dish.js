import request from '../utils/request'

export const getDishes = (params) => request({ url: '/dishes', data: params })
export const getDishDetail = (id) => request({ url: `/dishes/${id}` })
export const getCategories = () => request({ url: '/dishes/categories' })

// 管理员
export const createDish = (data) => request({ url: '/admin/dishes', method: 'POST', data })
export const updateDish = (id, data) => request({ url: `/admin/dishes/${id}`, method: 'PUT', data })
export const deleteDish = (id) => request({ url: `/admin/dishes/${id}`, method: 'DELETE' })
export const restoreDish = (id) => request({ url: `/admin/dishes/${id}/restore`, method: 'PUT' })
export const getAdminDishes = (params) => request({ url: '/admin/dishes', data: params })
