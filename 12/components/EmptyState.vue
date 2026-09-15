<template>
	<view class="empty-state">
		<view class="empty-icon-wrap">
			<view class="empty-ring"></view>
			<view class="empty-dot dot-1"></view>
			<view class="empty-dot dot-2"></view>
			<view class="empty-dot dot-3"></view>
			<view class="empty-dot dot-4"></view>
			<text class="empty-icon">{{ icon }}</text>
		</view>
		<text class="empty-text">{{ text }}</text>
		<slot />
	</view>
</template>

<script setup>
	defineProps({
		icon: {
			type: String,
			default: '📦'
		},
		text: {
			type: String,
			default: '暂无数据'
		}
	})
</script>

<style scoped>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 40rpx;
		animation: emptyIn 0.5s ease-out;
	}

	@keyframes emptyIn {
		from { opacity: 0; transform: translateY(24rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.empty-icon-wrap {
		width: 160rpx;
		height: 160rpx;
		background: linear-gradient(135deg, rgba(255, 240, 204, 0.4), rgba(255, 240, 204, 0.2));
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 24rpx;
		animation: emptyBounce 2s ease-in-out infinite;
		position: relative;
	}

	.empty-ring {
		position: absolute;
		inset: -16rpx;
		border: 2rpx dashed rgba(212, 132, 90, 0.15);
		border-radius: 50%;
		animation: ringSpin 12s linear infinite;
	}

	@keyframes ringSpin {
		to { transform: rotate(360deg); }
	}

	.empty-dot {
		position: absolute;
		width: 10rpx;
		height: 10rpx;
		border-radius: 50%;
		background: rgba(212, 132, 90, 0.2);
	}

	.dot-1 {
		top: -8rpx;
		left: 50%;
		animation: dotFloat 3s ease-in-out infinite;
	}

	.dot-2 {
		right: -8rpx;
		top: 50%;
		animation: dotFloat 3s ease-in-out infinite 0.75s;
	}

	.dot-3 {
		bottom: -8rpx;
		left: 50%;
		animation: dotFloat 3s ease-in-out infinite 1.5s;
	}

	.dot-4 {
		left: -8rpx;
		top: 50%;
		animation: dotFloat 3s ease-in-out infinite 2.25s;
	}

	@keyframes dotFloat {
		0%, 100% { transform: scale(1); opacity: 0.3; }
		50% { transform: scale(1.8); opacity: 0.7; }
	}

	@keyframes emptyBounce {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.06); }
	}

	.empty-icon {
		font-size: 64rpx;
		animation: emptyFloat 3s ease-in-out infinite;
	}

	@keyframes emptyFloat {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10rpx); }
	}

	.empty-text {
		font-size: 26rpx;
		color: var(--color-text-hint);
		text-align: center;
		letter-spacing: 1rpx;
	}
</style>
