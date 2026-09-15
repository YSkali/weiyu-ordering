<template>
	<view class="admin-home-page">
		<view class="page-header">
			<text class="page-title">菜品管理</text>
			<view class="add-btn" @click="goAdd">
				<text class="add-text">+ 新增</text>
			</view>
		</view>

		<!-- 搜索 -->
		<view class="search-wrap">
			<input class="search-input" placeholder="搜索菜品..." v-model="keyword" @confirm="loadDishes" />
		</view>

		<!-- 加载骨架屏 -->
		<Skeleton v-if="loading && dishes.length === 0" type="list" :count="5" />

		<!-- 菜品列表 -->
		<view
			v-for="(dish, index) in dishes"
			:key="dish.dishId"
			class="dish-item"
			:class="{ 'dish-deleted': dish.isDeleted }"
			:style="{ animationDelay: index * 0.06 + 's' }"
		>
			<image class="dish-image" :src="dish.imageUrl || '/static/images/dish-default.png'" mode="aspectFill" />
			<view class="dish-info">
				<view class="dish-name-row">
					<text class="dish-name">{{ dish.name }}</text>
					<text v-if="dish.isDeleted" class="deleted-tag">已下架</text>
					<text v-if="dish.isActivity" class="activity-tag">活动中</text>
				</view>
				<text class="dish-desc" v-if="dish.description">{{ dish.description }}</text>
				<view class="dish-price-row">
					<text class="dish-price" :class="{ 'price-activity': dish.isActivity }">{{ dish.isActivity ? dish.activityPrice : dish.price }} 积分</text>
					<text v-if="dish.isActivity" class="dish-original-price">{{ dish.price }} 积分</text>
				</view>
			</view>
			<view class="dish-actions">
				<view v-if="dish.commentEnabled && !dish.isDeleted" class="action-btn action-comment" @click="goDetail(dish.dishId)">
					<text class="action-text-comment">评论</text>
				</view>
				<view class="action-btn" @click="goEdit(dish.dishId)">
					<text class="action-text">编辑</text>
				</view>
				<view v-if="!dish.isDeleted" class="action-btn action-delete" @click="handleDelete(dish.dishId)">
					<text class="action-text-delete">下架</text>
				</view>
				<view v-else class="action-btn action-restore" @click="handleRestore(dish.dishId)">
					<text class="action-text-restore">上架</text>
				</view>
			</view>
		</view>

		<EmptyState v-if="dishes.length === 0 && !loading" icon="🍜" text="暂无菜品，点击右上角新增" />

		<AdminTabBar current="/pages/admin/home" />
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue'
	import { getAdminDishes, deleteDish, restoreDish } from '../../api/dish'
	import EmptyState from '../../components/EmptyState.vue'
	import AdminTabBar from '../../components/AdminTabBar.vue'
	import Skeleton from '../../components/Skeleton.vue'

	const keyword = ref('')
	const dishes = ref([])
	const loading = ref(false)

	onMounted(() => {
		loadDishes()
	})

	const loadDishes = async () => {
		loading.value = true
		try {
			const params = { page: 1, size: 50 }
			if (keyword.value) params.keyword = keyword.value
			const data = await getAdminDishes(params)
			dishes.value = data.list || []
		} catch (e) {
			console.error('加载菜品失败', e)
		} finally {
			loading.value = false
		}
	}

	const goAdd = () => {
		uni.navigateTo({ url: '/pages/admin/dish-edit' })
	}

	const goEdit = (id) => {
		uni.navigateTo({ url: `/pages/admin/dish-edit?id=${id}` })
	}

	const goDetail = (id) => {
		uni.navigateTo({ url: `/pages/dish/detail?id=${id}` })
	}

	const handleDelete = (id) => {
		uni.showModal({
			title: '下架菜品',
			content: '确定要下架这个菜品吗？下架后顾客将无法看到此菜品。',
			success: async (res) => {
				if (res.confirm) {
					try {
						await deleteDish(id)
						uni.showToast({ title: '已下架', icon: 'success' })
						loadDishes()
					} catch (e) {
						uni.showToast({ title: e.message || '操作失败', icon: 'none' })
					}
				}
			}
		})
	}

	const handleRestore = (id) => {
		uni.showModal({
			title: '重新上架',
			content: '确定要重新上架这个菜品吗？上架后顾客将可以看到此菜品。',
			success: async (res) => {
				if (res.confirm) {
					try {
						await restoreDish(id)
						uni.showToast({ title: '已上架', icon: 'success' })
						loadDishes()
					} catch (e) {
						uni.showToast({ title: e.message || '操作失败', icon: 'none' })
					}
				}
			}
		})
	}
</script>

<style scoped>
	.admin-home-page {
		padding: 0 0 160rpx;
		background-color: #FFFAF5;
		min-height: 100vh;
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* ========== 页面头部 ========== */
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: linear-gradient(145deg, #D4845A, #E8A87C);
		padding: 32rpx 24rpx 28rpx;
	}

	.page-title {
		font-size: 38rpx;
		font-weight: 800;
		color: #FFFFFF;
		letter-spacing: 2rpx;
	}

	.add-btn {
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
		padding: 12rpx 28rpx;
		border-radius: 12rpx;
		transition: transform 0.2s ease;
	}

	.add-btn:active {
		transform: scale(0.95);
	}

	.add-text {
		font-size: 26rpx;
		color: #FFFFFF;
		font-weight: 600;
	}

	/* ========== 搜索栏 ========== */
	.search-wrap {
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding: 12rpx 20rpx;
		margin: -16rpx 24rpx 16rpx;
		box-shadow: 0 8rpx 24rpx rgba(90, 60, 40, 0.08);
		position: relative;
		z-index: 2;
		animation: slideUp 0.4s ease-out;
	}

	@keyframes slideUp {
		from { opacity: 0; transform: translateY(12rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.search-input {
		font-size: 26rpx;
		width: 100%;
	}

	/* ========== 菜品列表 ========== */
	.dish-item {
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding: 16rpx;
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin: 0 24rpx 12rpx;
		box-shadow: 0 2rpx 12rpx rgba(90, 60, 40, 0.05);
		animation: itemIn 0.35s ease-out both;
	}

	@keyframes itemIn {
		from { opacity: 0; transform: translateX(-16rpx); }
		to { opacity: 1; transform: translateX(0); }
	}

	.dish-image {
		width: 110rpx;
		height: 110rpx;
		border-radius: 14rpx;
		background: linear-gradient(135deg, #FFF2E3, #F5EBE1);
		flex-shrink: 0;
	}

	.dish-info {
		flex: 1;
		min-width: 0;
	}

	.dish-name {
		font-size: 28rpx;
		font-weight: 600;
		color: #4A3328;
		display: block;
	}

	.dish-desc {
		font-size: 22rpx;
		color: #B8A89A;
		margin-top: 4rpx;
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.dish-price-row {
		display: flex;
		gap: 12rpx;
		align-items: center;
		margin-top: 8rpx;
	}

	.dish-price {
		font-size: 26rpx;
		font-weight: 700;
		background: linear-gradient(135deg, #D4845A, #E8A87C);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.dish-activity {
		font-size: 20rpx;
		color: #FFFFFF;
		background: linear-gradient(135deg, #E8A87C, #F0C4A8);
		padding: 2rpx 12rpx;
		border-radius: 8rpx;
		font-weight: 600;
	}

	.dish-actions {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.action-btn {
		padding: 8rpx 20rpx;
		background-color: #FFF8F0;
		border-radius: 10rpx;
		text-align: center;
		transition: transform 0.2s ease;
	}

	.action-btn:active {
		transform: scale(0.95);
	}

	.action-text {
		font-size: 22rpx;
		color: #D4845A;
		font-weight: 500;
	}

	.action-delete {
		background-color: #FFF5F4;
	}

	.action-text-delete {
		font-size: 22rpx;
		color: #E8706A;
		font-weight: 500;
	}

	.action-comment {
		background-color: #FFF2E3;
	}

	.action-text-comment {
		font-size: 22rpx;
		color: #D4845A;
		font-weight: 500;
	}

	.action-restore {
		background-color: #F0FFF0;
	}

	.action-text-restore {
		font-size: 22rpx;
		color: #6BBF59;
		font-weight: 500;
	}

	.dish-deleted {
		opacity: 0.6;
		background-color: #FAF3ED;
	}

	.dish-name-row {
		display: flex;
		align-items: center;
		gap: 8rpx;
		flex-wrap: wrap;
	}

	.deleted-tag {
		font-size: 18rpx;
		color: #E8706A;
		background-color: rgba(232, 112, 106, 0.12);
		padding: 2rpx 10rpx;
		border-radius: 8rpx;
		font-weight: 600;
	}

	.activity-tag {
		font-size: 18rpx;
		color: #6BBF59;
		background-color: rgba(107, 191, 89, 0.12);
		padding: 2rpx 10rpx;
		border-radius: 8rpx;
		font-weight: 600;
	}

	.price-activity {
		color: #E8706A;
		font-weight: bold;
	}

	.dish-original-price {
		font-size: 20rpx;
		color: #B8A89A;
		text-decoration: line-through;
		margin-left: 8rpx;
	}
</style>
