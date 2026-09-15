import request from '../utils/request'
import { BASE_URL } from '../utils/config'

export const getPointsFlow = (params) => request({ url: '/users/points/flow', data: params })

// 更新个人资料
export const updateProfile = (data) => request({ url: '/users/profile', method: 'PUT', data })

// 上传头像（使用 uni.uploadFile）
export const uploadAvatar = (filePath) => {
	return new Promise((resolve, reject) => {
		const token = uni.getStorageSync('token')
		uni.uploadFile({
			url: BASE_URL + '/users/avatar',
			filePath,
			name: 'file',
			header: {
				'Authorization': token ? `Bearer ${token}` : ''
			},
			success: (res) => {
				if (res.statusCode === 200 || res.statusCode === 201) {
					try {
						const data = JSON.parse(res.data)
						if (data.code === 0) {
							resolve(data.data)
						} else {
							uni.showToast({ title: data.message || '上传失败', icon: 'none' })
							reject(new Error(data.message))
						}
					} catch (e) {
						reject(new Error('解析响应失败'))
					}
				} else if (res.statusCode === 401) {
					uni.reLaunch({ url: '/pages/login/login' })
					reject(new Error('登录已过期'))
				} else {
					reject(new Error('上传失败'))
				}
			},
			fail: (err) => {
				reject(new Error(err.errMsg || '上传失败'))
			}
		})
	})
}

// 管理员
export const getUsers = (params) => request({ url: '/admin/users', data: params })
export const adjustPoints = (uid, data) => request({ url: `/admin/users/${uid}/points`, method: 'PUT', data })
export const deleteCustomer = (uid) => request({ url: `/admin/users/${uid}`, method: 'DELETE' })
export const banCustomer = (uid) => request({ url: `/admin/users/${uid}/ban`, method: 'PUT' })
export const unbanCustomer = (uid) => request({ url: `/admin/users/${uid}/unban`, method: 'PUT' })

// 修改登录账号
export const changeAccount = (account, password) =>
	request({ url: '/users/account', method: 'PUT', data: { account, password } })

// 修改密码
export const changePassword = (oldPassword, newPassword) =>
	request({ url: '/users/password', method: 'PUT', data: { oldPassword, newPassword } })

// 管理员设置/修改分组口令
export const setGroupCode = (groupCode) =>
	request({ url: '/users/group-code', method: 'POST', data: { groupCode } })
