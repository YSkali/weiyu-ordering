<template>
	<view class="order-detail-page">
		<!-- 状态时间线 -->
		<view class="status-timeline">
			<view
				v-for="(step, index) in statusSteps"
				:key="step.key"
				class="step"
				:class="{ active: isStepActive(step.key), done: isStepDone(step.key) }"
			>
				<view class="step-dot">
					<text class="step-icon">{{ isStepDone(step.key) ? '✓' : step.icon }}</text>
				</view>
				<text class="step-text">{{ step.label }}</text>
				<view v-if="index < statusSteps.length - 1" class="step-line" :class="{ done: isStepDone(step.key) }"></view>
			</view>
		</view>

		<!-- 订单信息 -->
		<view class="info-card">
			<text class="info-title">订单信息</text>
			<view class="info-row">
				<text class="info-label">订单号</text>
				<text class="info-value">{{ order.orderId }}</text>
			</view>
			<view class="info-row">
				<text class="info-label">下单时间</text>
				<text class="info-value">{{ formatTime(order.createdAt) }}</text>
			</view>
			<view class="info-row" v-if="order.remark">
				<text class="info-label">备注</text>
				<text class="info-value">{{ order.remark }}</text>
			</view>
		</view>

		<!-- 菜品列表 -->
		<view class="items-card">
			<text class="info-title">菜品详情</text>
			<view v-for="item in order.items" :key="item.itemId" class="item-row">
				<image class="item-image" :src="item.dishImage || '/static/images/dish-default.png'" mode="aspectFill" />
				<view class="item-info">
					<text class="item-name">{{ item.dishName }}</text>
					<text class="item-qty">x{{ item.quantity }}</text>
				</view>
				<text class="item-price">{{ item.unitPrice * item.quantity }} 积分</text>
			</view>
		</view>

		<!-- 合计 -->
		<view class="total-card">
			<text class="total-label">合计</text>
			<text class="total-value">{{ order.totalPoints }} <text class="total-unit">积分</text></text>
		</view>

		<!-- 操作按钮 -->
		<view v-if="order.status === 'completed'" class="action-bar safe-bottom">
			<view class="confirm-btn" @click="handleConfirm">
				<text class="confirm-text">确认收货</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, computed, onMounted } from 'vue'
	import { getOrderDetail, confirmOrder } from '../../api/order'
	import { refreshProfile } from '../../store/user'

	const order = ref({})

	const statusSteps = [
		{ key: 'created', label: '待接单', icon: '📝' },
		{ key: 'preparing', label: '制作中', icon: '👨‍🍳' },
		{ key: 'completed', label: '已完成', icon: '✅' },
		{ key: 'confirmed', label: '已确认', icon: '🎉' }
	]

	const statusOrder = ['created', 'preparing', 'completed', 'confirmed']

	const isStepActive = (key) => order.value.status === key
	const isStepDone = (key) => {
		const currentIdx = statusOrder.indexOf(order.value.status)
		const stepIdx = statusOrder.indexOf(key)
		return stepIdx < currentIdx
	}

	onMounted(() => {
		const pages = getCurrentPages()
		const currentPage = pages[pages.length - 1]
		const orderId = currentPage.options?.id || currentPage.$page?.options?.id
		if (orderId) {
			loadOrder(orderId)
		}
	})

	const loadOrder = async (orderId) => {
		try {
			order.value = await getOrderDetail(orderId)
		} catch (e) {
			uni.showToast({ title: '加载失败', icon: 'none' })
		}
	}

	const handleConfirm = async () => {
		uni.showModal({
			title: '确认收货',
			content: '确认已收到所有菜品？',
			success: async (res) => {
				if (res.confirm) {
					try {
						await confirmOrder(order.value.orderId)
						await refreshProfile()
						order.value.status = 'confirmed'
						uni.showToast({ title: '确认成功！', icon: 'success' })
					} catch (e) {
						uni.showToast({ title: e.message || '确认失败', icon: 'none' })
					}
				}
			}
		})
	}

	const formatTime = (dateStr) => {
		if (!dateStr) return ''
		const d = new Date(dateStr)
		return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
	}
</script>

<style scoped>
	.order-detail-page {
		padding: 24rpx;
		padding-bottom: 180rpx;
		animation: fadeIn 0.4s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.status-timeline {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		background-color: #FFFFFF;
		border-radius: 32rpx;
		padding: 32rpx 24rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx -2rpx rgba(212, 132, 90, 0.08);
		position: relative;
		animation: cardSlideDown 0.4s ease-out;
	}

	@keyframes cardSlideDown {
		from { opacity: 0; transform: translateY(-16rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		flex: 1;
		z-index: 1;
		animation: stepIn 0.3s ease-out both;
	}

	.step:nth-child(1) { animation-delay: 0.1s; }
	.step:nth-child(2) { animation-delay: 0.2s; }
	.step:nth-child(3) { animation-delay: 0.3s; }
	.step:nth-child(4) { animation-delay: 0.4s; }

	@keyframes stepIn {
		from { opacity: 0; transform: scale(0.8); }
		to { opacity: 1; transform: scale(1); }
	}

	.step-dot {
		width: 48rpx;
		height: 48rpx;
		background-color: #FAF3ED;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 8rpx;
		transition: all 0.3s ease;
	}

	.step.active .step-dot,
	.step.done .step-dot {
		background: linear-gradient(135deg, #E8A87C, #F0C4A8);
		box-shadow: 0 2rpx 8rpx rgba(232, 168, 124, 0.3);
	}

	.step-icon {
		font-size: 22rpx;
	}

	.step-text {
		font-size: 20rpx;
		color: #B8A89A;
	}

	.step.active .step-text,
	.step.done .step-text {
		color: #5C4033;
		font-weight: bold;
	}

	.step-line {
		position: absolute;
		top: 24rpx;
		left: 60%;
		width: 80%;
		height: 4rpx;
		background-color: #FAF3ED;
		transition: background-color 0.3s ease;
	}

	.step-line.done {
		background: linear-gradient(90deg, #E8A87C, #F0C4A8);
	}

	.info-card,
	.items-card,
	.total-card {
		background-color: #FFFFFF;
		border-radius: 32rpx;
		padding: 24rpx;
		margin-bottom: 16rpx;
		box-shadow: 0 4rpx 16rpx -2rpx rgba(212, 132, 90, 0.08);
		animation: cardSlideUp 0.35s ease-out both;
	}

	.info-card { animation-delay: 0.1s; }
	.items-card { animation-delay: 0.18s; }
	.total-card { animation-delay: 0.26s; }

	@keyframes cardSlideUp {
		from { opacity: 0; transform: translateY(16rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.info-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #5C4033;
		margin-bottom: 16rpx;
		padding-bottom: 16rpx;
		border-bottom: 2rpx solid rgba(235, 225, 215, 0.5);
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 12rpx;
	}

	.info-label {
		font-size: 24rpx;
		color: #8C786E;
	}

	.info-value {
		font-size: 24rpx;
		color: #5C4033;
	}

	.item-row {
		display: flex;
		align-items: center;
		padding: 12rpx 0;
		border-bottom: 2rpx solid rgba(235, 225, 215, 0.3);
	}

	.item-row:last-child {
		border-bottom: none;
	}

	.item-image {
		width: 80rpx;
		height: 80rpx;
		border-radius: 16rpx;
		background-color: #FAF3ED;
		margin-right: 16rpx;
	}

	.item-info {
		flex: 1;
	}

	.item-name {
		font-size: 24rpx;
		color: #5C4033;
		font-weight: 500;
	}

	.item-qty {
		font-size: 22rpx;
		color: #8C786E;
	}

	.item-price {
		font-size: 26rpx;
		font-weight: bold;
		background: linear-gradient(135deg, #D4845A, #E8A87C);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.total-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.total-label {
		font-size: 28rpx;
		color: #8C786E;
	}

	.total-value {
		font-size: 36rpx;
		font-weight: bold;
		background: linear-gradient(135deg, #D4845A, #E8A87C);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.total-unit {
		font-size: 24rpx;
		font-weight: normal;
	}

	.action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 16rpx 32rpx;
		background-color: #FFFFFF;
		box-shadow: 0 -4rpx 24rpx rgba(212, 132, 90, 0.08);
		animation: barSlideUp 0.3s ease-out 0.4s both;
	}

	@keyframes barSlideUp {
		from { opacity: 0; transform: translateY(100%); }
		to { opacity: 1; transform: translateY(0); }
	}

	.confirm-btn {
		background: linear-gradient(135deg, #E8A87C, #F0C4A8);
		padding: 24rpx 0;
		border-radius: 999rpx;
		text-align: center;
		box-shadow: 0 4rpx 16rpx rgba(232, 168, 124, 0.4);
		transition: transform 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.confirm-btn::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.3);
		transform: translate(-50%, -50%);
		transition: width 0.6s ease, height 0.6s ease, opacity 0.6s ease;
		opacity: 0;
	}

	.confirm-btn:active::after {
		width: 300%;
		height: 300%;
		opacity: 1;
		transition: width 0s, height 0s, opacity 0s;
	}

	.confirm-btn:active {
		transform: scale(0.97);
	}

	.confirm-text {
		font-size: 30rpx;
		color: #FFFFFF;
		font-weight: bold;
	}
</style>
