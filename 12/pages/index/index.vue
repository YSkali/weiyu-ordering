<template>
	<view class="home-page">
		<!-- 头部横幅 -->
		<view class="hero-banner">
			<view class="hero-deco hero-deco-1"></view>
			<view class="hero-deco hero-deco-2"></view>
			<view class="hero-particle particle-1"></view>
			<view class="hero-particle particle-2"></view>
			<view class="hero-particle particle-3"></view>
			<view class="hero-content">
				<text class="hero-greeting">今天想吃点什么？</text>
				<text class="hero-sub">用积分兑换你喜爱的美食</text>
			</view>
		</view>

		<!-- 搜索栏 -->
		<view class="search-wrap">
			<SearchBar v-model="keyword" @search="onSearch" />
		</view>

		<!-- 分类栏 -->
		<CategoryBar :categories="dishStore.state.categories" :activeId="dishStore.state.activeCategory" @select="onCategorySelect" />

		<!-- 菜品网格 -->
		<view class="dish-grid" v-if="dishStore.state.dishes.length > 0">
			<view
				v-for="(dish, index) in dishStore.state.dishes"
				:key="dish.dishId"
				class="dish-grid-item"
				:style="{ animationDelay: (index % 6) * 0.08 + 's' }"
			>
				<DishCard :dish="dish" @add="onAddToCart" />
			</view>
		</view>

		<!-- 空状态 -->
		<EmptyState v-else-if="!dishStore.state.loading" icon="🍽️" text="这个分类下还没有吃的哦~" />

		<!-- 加载更多 -->
		<view class="load-more" v-if="dishStore.state.loading">
			<view class="loading-spinner"></view>
			<text class="load-text">加载中...</text>
		</view>
		<view class="load-more" v-else-if="!dishStore.state.hasMore && dishStore.state.dishes.length > 0">
			<text class="load-text">没有更多了~</text>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue'
	import { onPullDownRefresh as onPullDown, onReachBottom as onReach } from '@dcloudio/uni-app'
	import { useDishStore } from '../../store/dish'
	import { useCartStore } from '../../store/cart'
	import { initUserState } from '../../store/user'
	import DishCard from '../../components/DishCard.vue'
	import CategoryBar from '../../components/CategoryBar.vue'
	import SearchBar from '../../components/SearchBar.vue'
	import EmptyState from '../../components/EmptyState.vue'

	const dishStore = useDishStore()
	const cartStore = useCartStore()
	const keyword = ref('')

	onMounted(() => {
		initUserState()
		dishStore.fetchCategories()
		dishStore.fetchDishes(true)
	})

	const onCategorySelect = (cateId) => {
		dishStore.setActiveCategory(cateId)
	}

	const onSearch = () => {
		dishStore.setKeyword(keyword.value)
	}

	const onAddToCart = (dish) => {
		cartStore.addItem(dish)
	}

	// 下拉刷新
	onPullDown(() => {
		dishStore.fetchDishes(true).finally(() => {
			uni.stopPullDownRefresh()
		})
	})

	// 触底加载更多
	onReach(() => {
		dishStore.fetchDishes(false)
	})
</script>

<style scoped>
	.home-page {
		padding: 0 0 180rpx;
		background-color: #FFFAF5;
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(16rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	/* ========== 头部区域 ========== */
	.hero-banner {
		background: linear-gradient(145deg, var(--color-primary) 0%, var(--color-primary-light) 50%, #D4B89C 100%);
		padding: 40rpx 32rpx 48rpx;
		position: relative;
		overflow: hidden;
	}

	.hero-deco {
		position: absolute;
		border-radius: 50%;
	}

	.hero-deco-1 {
		top: -40rpx;
		right: -40rpx;
		width: 260rpx;
		height: 260rpx;
		background: rgba(255, 255, 255, 0.08);
		animation: heroFloat 6s ease-in-out infinite;
	}

	.hero-deco-2 {
		bottom: -60rpx;
		left: -40rpx;
		width: 200rpx;
		height: 200rpx;
		background: rgba(255, 255, 255, 0.05);
		animation: heroFloat 8s ease-in-out infinite reverse;
	}

	@keyframes heroFloat {
		0%, 100% { transform: translateY(0) rotate(0deg); }
		50% { transform: translateY(-20rpx) rotate(5deg); }
	}

	/* 粒子效果 */
	.hero-particle {
		position: absolute;
		width: 10rpx;
		height: 10rpx;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 50%;
	}

	.particle-1 {
		top: 25%;
		left: 15%;
		animation: particleDrift 4s ease-in-out infinite;
	}

	.particle-2 {
		top: 60%;
		right: 20%;
		animation: particleDrift 5s ease-in-out infinite 1s;
	}

	.particle-3 {
		bottom: 20%;
		left: 55%;
		animation: particleDrift 6s ease-in-out infinite 2s;
	}

	@keyframes particleDrift {
		0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
		50% { transform: translateY(-24rpx) scale(1.4); opacity: 0.7; }
	}

	.hero-content {
		position: relative;
		z-index: 1;
		animation: slideUp 0.6s ease-out;
	}

	@keyframes slideUp {
		from { opacity: 0; transform: translateY(24rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.hero-greeting {
		font-size: 38rpx;
		font-weight: 800;
		color: #FFFFFF;
		display: block;
		letter-spacing: 2rpx;
		text-shadow: 0 2rpx 8rpx rgba(90, 60, 40, 0.1);
	}

	.hero-sub {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.7);
		margin-top: 8rpx;
		display: block;
	}

	/* ========== 搜索和分类 ========== */
	.search-wrap {
		padding: 0 24rpx;
		margin-top: -24rpx;
		position: relative;
		z-index: 2;
		margin-bottom: 4rpx;
		animation: searchSlide 0.4s ease-out 0.2s both;
	}

	@keyframes searchSlide {
		from { opacity: 0; transform: translateY(12rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	/* ========== 菜品网格 ========== */
	.dish-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16rpx;
		padding: 12rpx 24rpx 0;
	}

	.dish-grid-item {
		animation: dishFadeIn 0.4s ease-out both;
	}

	@keyframes dishFadeIn {
		from { opacity: 0; transform: translateY(20rpx) scale(0.96); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	.load-more {
		text-align: center;
		padding: 32rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
	}

	.loading-spinner {
		width: 28rpx;
		height: 28rpx;
		border: 4rpx solid #F5EBE1;
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.load-text {
		font-size: 24rpx;
		color: #B8A89A;
	}
</style>
