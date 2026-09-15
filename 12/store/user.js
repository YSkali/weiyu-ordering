import { reactive } from 'vue'
import { getProfile } from '../api/auth'

const state = reactive({
  uid: 0,
  nickname: '',
  avatar: '',
  points: 0,
  role: '',
  token: ''
})

// 初始化状态
export const initUserState = () => {
  const userInfo = uni.getStorageSync('userInfo') || {}
  const token = uni.getStorageSync('token') || ''
  state.uid = userInfo.uid || 0
  state.nickname = userInfo.nickname || ''
  state.avatar = userInfo.avatar || ''
  state.points = userInfo.points || 0
  state.role = userInfo.role || ''
  state.token = token
}

// 设置用户信息
export const setUser = (data) => {
  state.uid = data.uid || 0
  state.nickname = data.nickname || ''
  state.avatar = data.avatar || ''
  state.points = data.points || 0
  state.role = data.role || ''
  state.token = data.token || ''
  uni.setStorageSync('userInfo', {
    uid: state.uid,
    nickname: state.nickname,
    avatar: state.avatar,
    points: state.points,
    role: state.role
  })
}

// 刷新用户信息
export const refreshProfile = async () => {
  try {
    const data = await getProfile()
    state.points = data.points
    state.nickname = data.nickname
    state.avatar = data.avatar
    const userInfo = uni.getStorageSync('userInfo') || {}
    userInfo.points = data.points
    userInfo.nickname = data.nickname
    userInfo.avatar = data.avatar
    uni.setStorageSync('userInfo', userInfo)
  } catch (e) {
    console.error('刷新用户信息失败', e)
  }
}

// 更新积分
export const updatePoints = (newPoints) => {
  state.points = newPoints
  const userInfo = uni.getStorageSync('userInfo') || {}
  userInfo.points = newPoints
  uni.setStorageSync('userInfo', userInfo)
}

// 清除用户
export const clearUser = () => {
  state.uid = 0
  state.nickname = ''
  state.avatar = ''
  state.points = 0
  state.role = ''
  state.token = ''
  uni.removeStorageSync('token')
  uni.removeStorageSync('userInfo')
}

export const useUserStore = () => ({
  state,
  setUser,
  refreshProfile,
  updatePoints,
  clearUser,
  initUserState
})
