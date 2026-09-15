import request from '../utils/request'

export const getProfile = () => request({ url: '/auth/me' })
