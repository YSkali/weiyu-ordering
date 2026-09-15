import { reactive } from 'vue'

const state = reactive({
  items: uni.getStorageSync('cart') || []
})

// 持久化
const persist = () => {
  uni.setStorageSync('cart', state.items)
}

// 添加商品
export const addItem = (dish) => {
  const existing = state.items.find(item => item.dishId === dish.dishId)
  if (existing) {
    existing.quantity += 1
  } else {
    state.items.push({
      dishId: dish.dishId,
      name: dish.name,
      price: dish.isActivity ? dish.activityPrice : dish.price,
      imageUrl: dish.imageUrl,
      quantity: 1
    })
  }
  persist()
  uni.showToast({ title: '已加入购物车', icon: 'success' })
}

// 减少数量
export const decreaseItem = (dishId) => {
  const existing = state.items.find(item => item.dishId === dishId)
  if (existing) {
    if (existing.quantity > 1) {
      existing.quantity -= 1
    } else {
      removeItem(dishId)
      return
    }
    persist()
  }
}

// 删除商品
export const removeItem = (dishId) => {
  state.items = state.items.filter(item => item.dishId !== dishId)
  persist()
}

// 清空购物车
export const clearCart = () => {
  state.items = []
  persist()
}

// 总积分
export const totalPoints = () => {
  return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// 总数量
export const totalCount = () => {
  return state.items.reduce((sum, item) => sum + item.quantity, 0)
}

export const useCartStore = () => ({
  state,
  addItem,
  decreaseItem,
  removeItem,
  clearCart,
  totalPoints,
  totalCount
})
