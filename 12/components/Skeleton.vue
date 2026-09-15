<template>
	<view class="skeleton" :class="type">
		<view v-if="type === 'card'" class="skeleton-card">
			<view class="skeleton-image shimmer"></view>
			<view class="skeleton-body">
				<view class="skeleton-line skeleton-line-title shimmer"></view>
				<view class="skeleton-line skeleton-line-desc shimmer"></view>
				<view class="skeleton-line skeleton-line-short shimmer"></view>
			</view>
		</view>
		<view v-else-if="type === 'list'" class="skeleton-list">
			<view v-for="i in count" :key="i" class="skeleton-list-item" :style="{ animationDelay: i * 0.05 + 's' }">
				<view class="skeleton-avatar shimmer"></view>
				<view class="skeleton-list-body">
					<view class="skeleton-line skeleton-line-title shimmer"></view>
					<view class="skeleton-line skeleton-line-desc shimmer"></view>
				</view>
			</view>
		</view>
		<view v-else-if="type === 'grid'" class="skeleton-grid">
			<view v-for="i in count" :key="i" class="skeleton-grid-item" :style="{ animationDelay: i * 0.06 + 's' }">
				<view class="skeleton-image shimmer"></view>
				<view class="skeleton-grid-body">
					<view class="skeleton-line skeleton-line-title shimmer"></view>
					<view class="skeleton-line skeleton-line-short shimmer"></view>
				</view>
			</view>
		</view>
		<view v-else class="skeleton-block shimmer"></view>
	</view>
</template>

<script setup>
	defineProps({
		type: { type: String, default: 'block' },
		count: { type: Number, default: 3 }
	})
</script>

<style scoped>
	.skeleton {
		width: 100%;
	}

	.shimmer {
		background: linear-gradient(90deg, #F5EBE1 25%, #FFF8F0 50%, #F5EBE1 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	/* Card skeleton */
	.skeleton-card {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 16rpx -2rpx rgba(212, 132, 90, 0.08);
	}

	.skeleton-image {
		width: 100%;
		height: 300rpx;
		border-radius: 16rpx;
	}

	.skeleton-body {
		padding: 20rpx;
	}

	.skeleton-line {
		height: 24rpx;
		border-radius: 12rpx;
		margin-bottom: 16rpx;
	}

	.skeleton-line-title {
		width: 60%;
		height: 32rpx;
	}

	.skeleton-line-desc {
		width: 80%;
	}

	.skeleton-line-short {
		width: 40%;
	}

	/* List skeleton */
	.skeleton-list-item {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 20rpx;
		background-color: #FFFFFF;
		border-radius: 16rpx;
		margin-bottom: 12rpx;
		animation: fadeIn 0.3s ease-out both;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(8rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.skeleton-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.skeleton-list-body {
		flex: 1;
	}

	/* Grid skeleton */
	.skeleton-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16rpx;
	}

	.skeleton-grid-item {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 16rpx -2rpx rgba(212, 132, 90, 0.08);
		animation: fadeIn 0.3s ease-out both;
	}

	.skeleton-grid-body {
		padding: 16rpx;
	}

	/* Block skeleton */
	.skeleton-block {
		width: 100%;
		height: 200rpx;
		border-radius: 16rpx;
	}
</style>
