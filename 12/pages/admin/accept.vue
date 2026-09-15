<template>
	<view class="admin-accept-page">
		<view class="page-header">
			<text class="page-title">订单确认</text>
		</view>

		<!-- 状态筛选 -->
		<view class="status-tabs">
			<view
				v-for="tab in tabs"
				:key="tab.value"
				class="tab-item"
				:class="{ active: activeTab === tab.value }"
				@click="switchTab(tab.value)"
			>
				<text class="tab-text">{{ tab.label }}</text>
			</view>
		</view>

		<!-- 订单列表 -->
		<view
			v-for="(order, index) in orders"
			:key="order.orderId"
			class="order-card"
			:style="{ animationDelay: index * 0.06 + 's' }"
		>
			<view class="order-header">
				<view>
					<text class="order-id">{{ order.orderId }}</text>
					<text class="order-time">{{ formatTime(order.createdAt) }}</text>
					<text class="order-user" v-if="order.nickname">{{ order.nickname }}</text>
				</view>
				<view class="status-badge" :style="{ backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status) }">
					{{ getStatusText(order.status) }}
				</view>
			</view>

			<view class="order-items">
				<view v-for="item in order.items" :key="item.itemId" class="order-item-row">
					<text class="item-name" :class="{ done: item.status === 'completed' }">{{ item.dishName }} x{{ item.quantity }}</text>
					<view v-if="order.status === 'preparing' && item.status !== 'completed'" class="mark-done-btn" @click="markItemDone(order.orderId, item.itemId)">
						<text class="mark-text">出餐</text>
					</view>
					<text v-else-if="item.status === 'completed'" class="done-text">✓</text>
				</view>
			</view>

			<view class="order-footer">
				<text class="order-total">{{ order.totalPoints }} 积分</text>
				<view v-if="order.status === 'created'" class="accept-btn" @click="acceptOrder(order.orderId, order.totalPoints)">
					<text class="accept-text">接单 (扣{{ order.totalPoints }}积分)</text>
				</view>
				<view v-else-if="order.status === 'preparing'" class="complete-btn" @click="completeOrder(order.orderId)">
					<text class="complete-text">整单完成</text>
				</view>
				<text v-else-if="order.status === 'completed'" class="waiting-text">等待顾客确认</text>
			</view>
		</view>

		<EmptyState v-if="orders.length === 0 && !loading" icon="📋" text="暂无订单" />

		<AdminTabBar current="/pages/admin/accept" />
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue'
	import { getAdminOrders, updateOrderStatus, updateItemStatus } from '../../api/order'
	import { ORDER_STATUS_MAP } from '../../utils/config'
	import EmptyState from '../../components/EmptyState.vue'
	import AdminTabBar from '../../components/AdminTabBar.vue'

	const tabs = [
		{ label: '待接单', value: 'created' },
		{ label: '制作中', value: 'preparing' },
		{ label: '已完成', value: 'completed' }
	]

	const activeTab = ref('created')
	const orders = ref([])
	const loading = ref(false)

	onMounted(() => {
		loadOrders()
	})

	const switchTab = (value) => {
		activeTab.value = value
		loadOrders()
	}

	const loadOrders = async () => {
		loading.value = true
		try {
			const params = { page: 1, size: 50 }
			if (activeTab.value) params.status = activeTab.value
			const data = await getAdminOrders(params)
			orders.value = data.list || []
		} catch (e) {
			console.error('加载订单失败', e)
		} finally {
			loading.value = false
		}
	}

	const acceptOrder = async (orderId, totalPoints) => {
		uni.showModal({
			title: '确认接单',
			content: `接单后将扣除顾客 ${totalPoints} 积分，确定吗？`,
			success: async (res) => {
				if (res.confirm) {
					try {
						await updateOrderStatus(orderId, 'preparing')
						uni.showToast({ title: '已接单，已扣积分', icon: 'success' })
						loadOrders()
					} catch (e) {
						uni.showToast({ title: e.message || '操作失败', icon: 'none' })
					}
				}
			}
		})
	}

	const markItemDone = async (orderId, itemId) => {
		try {
			await updateItemStatus(orderId, itemId, 'completed')
			uni.showToast({ title: '已出餐', icon: 'success' })
			loadOrders()
		} catch (e) {
			uni.showToast({ title: e.message || '操作失败', icon: 'none' })
		}
	}

	const completeOrder = async (orderId) => {
		uni.showModal({
			title: '整单完成',
			content: '确认所有菜品已完成？完成后将获得积分奖励',
			success: async (res) => {
				if (res.confirm) {
					try {
						await updateOrderStatus(orderId, 'completed')
						uni.showToast({ title: '已完成，积分已到账', icon: 'success' })
						loadOrders()
					} catch (e) {
						uni.showToast({ title: e.message || '操作失败', icon: 'none' })
					}
				}
			}
		})
	}

	const getStatusText = (status) => ORDER_STATUS_MAP[status]?.text || status
	const getStatusColor = (status) => ORDER_STATUS_MAP[status]?.color || '#8C786E'

	const formatTime = (dateStr) => {
		if (!dateStr) return ''
		const d = new Date(dateStr)
		return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
	}
</script>

<style scoped>
	.admin-accept-page {
		padding: 16rpx 24rpx;
		padding-bottom: 160rpx;
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.page-header {
		margin-bottom: 24rpx;
	}

	.page-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #D4845A;
	}

	.status-tabs {
		display: flex;
		background-color: #FFFFFF;
		border-radius: 999rpx;
		padding: 6rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx -2rpx rgba(212, 132, 90, 0.08);
		animation: slideDown 0.4s ease-out;
	}

	@keyframes slideDown {
		from { opacity: 0; transform: translateY(-12rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 14rpx 0;
		border-radius: 999rpx;
		font-size: 24rpx;
		color: #8C786E;
		font-weight: 500;
		transition: all 0.25s ease;
	}

	.tab-item.active {
		background-color: #D4845A;
		color: #FFFFFF;
		font-weight: bold;
		box-shadow: 0 4rpx 12rpx rgba(212, 132, 90, 0.3);
		animation: tabPop 0.3s ease-out;
	}

	@keyframes tabPop {
		from { transform: scale(0.95); }
		to { transform: scale(1); }
	}

	.order-card {
		background-color: #FFFFFF;
		border-radius: 32rpx;
		padding: 24rpx;
		margin-bottom: 16rpx;
		box-shadow: 0 4rpx 16rpx -2rpx rgba(212, 132, 90, 0.08);
		animation: cardIn 0.35s ease-out both;
	}

	@keyframes cardIn {
		from { opacity: 0; transform: translateY(16rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding-bottom: 16rpx;
		border-bottom: 2rpx solid rgba(235, 225, 215, 0.5);
		margin-bottom: 16rpx;
	}

	.order-id {
		font-size: 22rpx;
		color: #8C786E;
		display: block;
	}

	.order-time {
		font-size: 20rpx;
		color: #B8A89A;
		margin-top: 4rpx;
		display: block;
	}

	.order-user {
		font-size: 22rpx;
		color: #D4845A;
		margin-top: 4rpx;
		display: block;
	}

	.status-badge {
		font-size: 22rpx;
		padding: 6rpx 16rpx;
		border-radius: 999rpx;
		font-weight: bold;
	}

	.order-items {
		margin-bottom: 16rpx;
	}

	.order-item-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8rpx 0;
	}

	.item-name {
		font-size: 26rpx;
		color: #5C4033;
	}

	.item-name.done {
		text-decoration: line-through;
		opacity: 0.5;
	}

	.mark-done-btn {
		border: 2rpx solid #E8A87C;
		padding: 4rpx 16rpx;
		border-radius: 999rpx;
		transition: transform 0.2s ease;
	}

	.mark-done-btn:active {
		transform: scale(0.95);
	}

	.mark-text {
		font-size: 22rpx;
		color: #E8A87C;
	}

	.done-text {
		font-size: 22rpx;
		color: #E8A87C;
		font-weight: bold;
	}

	.order-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 16rpx;
		border-top: 2rpx solid rgba(235, 225, 215, 0.5);
	}

	.order-total {
		font-size: 30rpx;
		font-weight: bold;
		color: #D4845A;
	}

	.accept-btn {
		background: linear-gradient(135deg, #E8A87C, #F0C4A8);
		padding: 12rpx 24rpx;
		border-radius: 999rpx;
		box-shadow: 0 4rpx 12rpx rgba(232, 168, 124, 0.3);
		transition: transform 0.2s ease;
	}

	.accept-btn:active {
		transform: scale(0.95);
	}

	.accept-text {
		font-size: 24rpx;
		color: #FFFFFF;
		font-weight: bold;
	}

	.complete-btn {
		background-color: #FFF2E3;
		padding: 12rpx 24rpx;
		border-radius: 999rpx;
		transition: transform 0.2s ease;
	}

	.complete-btn:active {
		transform: scale(0.95);
	}

	.complete-text {
		font-size: 24rpx;
		color: #D4845A;
		font-weight: bold;
	}

	.waiting-text {
		font-size: 22rpx;
		color: #B8A89A;
	}
</style>
