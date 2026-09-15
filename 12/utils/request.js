import { BASE_URL } from './config'

const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      timeout: 60000,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const responseData = res.data
          if (responseData.code === 0 || responseData.code === '0') {
            resolve(responseData.data)
          } else {
            const msg = responseData.message || '请求失败'
            console.error('业务错误:', responseData.code, msg)
            uni.showToast({ title: msg, icon: 'none' })
            reject(new Error(msg))
          }
        } else if (res.statusCode === 401) {
          const msg = res.data?.message || ''
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')
          if (msg.includes('GROUP_CODE_CHANGED')) {
            uni.showModal({
              title: '口令已变更',
              content: '管理员修改了口令，请重新登录',
              showCancel: false,
              success: () => {
                uni.reLaunch({ url: '/pages/login/login' })
              }
            })
          } else {
            uni.reLaunch({ url: '/pages/login/login' })
          }
          reject(new Error('登录已过期'))
        } else {
          const msg = res.data?.message || '网络错误'
          console.error('HTTP错误:', res.statusCode, msg)
          uni.showToast({ title: msg, icon: 'none' })
          reject(new Error(msg))
        }
      },
      fail: (err) => {
        console.error('请求失败:', options.url, JSON.stringify(err))
        uni.showToast({ title: '网络连接失败', icon: 'none' })
        reject(new Error('网络连接失败'))
      }
    })
  })
}

export default request
