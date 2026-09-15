import request from './request'

// 账号密码登录（分组模式）
export const accountLogin = (account, password, groupCode) => {
  return request({
    url: '/auth/account-login',
    method: 'POST',
    data: { account, password, groupCode }
  }).then(data => {
    uni.setStorageSync('token', data.token)
    uni.setStorageSync('userInfo', {
      uid: data.uid,
      nickname: data.nickname,
      avatar: data.avatar,
      points: data.points,
      role: data.role
    })
    return data
  })
}
