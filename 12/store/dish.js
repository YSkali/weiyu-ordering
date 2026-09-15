import { reactive } from 'vue'
import { getDishes, getCategories } from '../api/dish'

const state = reactive({
  categories: [],
  dishes: [],
  activeCategory: 0,
  keyword: '',
  page: 1,
  size: 10,
  total: 0,
  loading: false,
  hasMore: true
})

// 获取分类
export const fetchCategories = async () => {
  try {
    const data = await getCategories()
    if (Array.isArray(data) && data.length > 0) {
      state.categories = [{ cateId: 0, name: '推荐' }, ...data]
    } else {
      state.categories = [{ cateId: 0, name: '推荐' }]
    }
  } catch (e) {
    state.categories = [{ cateId: 0, name: '推荐' }]
  }
}

// 获取菜品列表
export const fetchDishes = async (refresh = false) => {
  if (state.loading) return
  if (refresh) {
    state.page = 1
    state.hasMore = true
    state.dishes = []
  }

  if (!state.hasMore) return

  state.loading = true
  try {
    const params = {
      page: state.page,
      size: state.size
    }
    if (state.activeCategory > 0) {
      params['cate_id'] = state.activeCategory
    }
    if (state.keyword) {
      params.keyword = state.keyword
    }

    const data = await getDishes(params)
    if (refresh) {
      state.dishes = data.list
    } else {
      state.dishes = [...state.dishes, ...data.list]
    }
    state.total = data.total
    state.hasMore = state.dishes.length < data.total
    state.page++
  } catch (e) {
    console.error('获取菜品失败', e)
  } finally {
    state.loading = false
  }
}

// 切换分类
export const setActiveCategory = (cateId) => {
  state.activeCategory = cateId
  state.keyword = ''
  fetchDishes(true)
}

// 设置搜索关键词
export const setKeyword = (kw) => {
  state.keyword = kw
  state.activeCategory = 0
  fetchDishes(true)
}

export const useDishStore = () => ({
  state,
  fetchCategories,
  fetchDishes,
  setActiveCategory,
  setKeyword
})
