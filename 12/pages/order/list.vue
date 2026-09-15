<template>
	<view class="order-list-page">
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
		<view v-if="orders.length > 0">
			<OrderCard v-for="order in orders" :key="order.orderId" :order="order" />
		</view>

		<Skeleton v-else-if="loading" type="list" :count="5" />

		<EmptyState v-else-if="!loading" icon="📋" text="暂无订单记录" />

		<view class="load-more" v-if="loading">
			<text class="load-text">加载中...</text>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue'
	import { getOrders } from '../../api/order'
	import OrderCard from '../../components/OrderCard.vue'
	import EmptyState from '../../components/EmptyState.vue'
	import Skeleton from '../../components/Skeleton.vue'

	const tabs = [
		{ label: '全部', value: '' },
		{ label: '待接单', value: 'created' },
		{ label: '制作中', value: 'preparing' },
		{ label: '已完成', value: 'completed' }
	]

	const activeTab = ref('')
	const orders = ref([])
	const loading = ref(false)
	const page = ref(1)

	onMounted(() => {
		loadOrders(true)
	})

	const switchTab = (value) => {
		activeTab.value = value
		loadOrders(true)
	}

	const loadOrders = async (refresh = false) => {
		if (refresh) {
			page.value = 1
			orders.value = []
		}

		loading.value = true
		try {
			const params = { page: page.value, size: 10 }
			if (activeTab.value) params.status = activeTab.value
			const data = await getOrders(params)
			if (refresh) {
				orders.value = data.list
			} else {
				orders.value = [...orders.value, ...data.list]
			}
			page.value++
		} catch (e) {
			console.error('加载订单失败', e)
		} finally {
			loading.value = false
		}
	}
</script>

<style scoped>
	.order-list-page {
		padding: 16rpx 24rpx;
		padding-bottom: 40rpx;
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
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
		from { opacity: 0; transform: translateY(-16rpx); }
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

	.load-more {
		text-align: center;
		padding: 32rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		animation: fadeIn 0.3s ease-out;
	}

	.load-text {
		font-size: 24rpx;
		color: #B8A89A;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 0.5; }
		50% { opacity: 1; }
	}
</style>
