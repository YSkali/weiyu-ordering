<template>
	<view class="order-card" @click="goDetail">
		<view class="order-status-bar" :style="{ backgroundColor: statusInfo.color }"></view>
		<view class="order-header">
			<view class="order-info">
				<text class="order-id">{{ order.orderId }}</text>
				<text class="order-time">{{ formatTime(order.createdAt) }}</text>
			</view>
			<view class="status-badge" :style="{ backgroundColor: statusInfo.color + '18', color: statusInfo.color }">
				<view class="status-dot" :style="{ backgroundColor: statusInfo.color }"></view>
				<text class="status-text">{{ statusInfo.text }}</text>
			</view>
		</view>
		<view class="order-body">
			<text class="order-items-count">共 {{ order.itemCount || 0 }} 件商品</text>
			<text class="order-remark" v-if="order.remark">备注: {{ order.remark }}</text>
		</view>
		<view class="order-footer">
			<text class="order-total-label">合计</text>
			<text class="order-total">{{ order.totalPoints }} <text class="total-unit">积分</text></text>
		</view>
	</view>
</template>

<script setup>
	import { computed } from 'vue'
	import { ORDER_STATUS_MAP } from '../utils/config'

	const props = defineProps({
		order: {
			type: Object,
			default: () => ({})
		}
	})

	const statusInfo = computed(() => {
		return ORDER_STATUS_MAP[props.order.status] || { text: '未知', color: 'var(--color-text-muted)' }
	})

	const formatTime = (dateStr) => {
		if (!dateStr) return ''
		const d = new Date(dateStr)
		return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
	}

	const goDetail = () => {
		uni.navigateTo({
			url: `/pages/order/detail?id=${props.order.orderId}`
		})
	}
</script>

<style scoped>
	.order-card {
		background-color: #FFFFFF;
		border-radius: 32rpx;
		padding: 24rpx;
		margin-bottom: 16rpx;
		box-shadow: 0 4rpx 16rpx -2rpx rgba(212, 132, 90, 0.08);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		animation: orderCardIn 0.35s ease-out both;
		position: relative;
		overflow: hidden;
	}

	.order-status-bar {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		width: 6rpx;
		border-radius: 6rpx 0 0 6rpx;
	}

	.order-card:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 12rpx -2rpx rgba(212, 132, 90, 0.06);
	}

	@keyframes orderCardIn {
		from { opacity: 0; transform: translateY(16rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding-bottom: 16rpx;
		border-bottom: 2rpx solid rgba(235, 225, 215, 0.5);
	}

	.order-id {
		font-size: 22rpx;
		color: var(--color-text-muted);
	}

	.order-time {
		font-size: 20rpx;
		color: var(--color-text-hint);
		margin-top: 4rpx;
	}

	.status-badge {
		font-size: 22rpx;
		padding: 6rpx 16rpx;
		border-radius: 999rpx;
		font-weight: bold;
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.status-dot {
		width: 10rpx;
		height: 10rpx;
		border-radius: 50%;
		animation: dotPulse 2s ease-in-out infinite;
	}

	@keyframes dotPulse {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.5; transform: scale(0.8); }
	}

	.order-body {
		padding: 16rpx 0;
	}

	.order-items-count {
		font-size: 24rpx;
		color: var(--color-text-secondary);
	}

	.order-remark {
		font-size: 22rpx;
		color: var(--color-text-muted);
		margin-top: 8rpx;
		display: block;
	}

	.order-footer {
		display: flex;
		justify-content: flex-end;
		align-items: baseline;
		gap: 8rpx;
		padding-top: 16rpx;
		border-top: 2rpx solid rgba(235, 225, 215, 0.5);
	}

	.order-total-label {
		font-size: 22rpx;
		color: var(--color-text-muted);
	}

	.order-total {
		font-size: 32rpx;
		font-weight: bold;
		background: var(--gradient-text);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.total-unit {
		font-size: 22rpx;
		font-weight: normal;
	}
</style>
