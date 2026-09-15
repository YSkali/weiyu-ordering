<template>
	<view class="dish-card" @click="goDetail">
		<view class="dish-image-wrap">
			<view class="image-placeholder" v-if="!imageLoaded">
				<text class="placeholder-icon">🍽️</text>
			</view>
			<image
				class="dish-image"
				:class="{ loaded: imageLoaded }"
				:src="dish.imageUrl || '/static/images/dish-default.png'"
				mode="aspectFill"
				lazy-load
				@load="imageLoaded = true"
			/>
			<view v-if="dish.isActivity" class="activity-badge">特价</view>
		</view>
		<view class="dish-info">
			<text class="dish-name">{{ dish.name }}</text>
			<view class="dish-bottom">
				<view class="price-wrap">
					<text class="price">{{ dish.isActivity ? dish.activityPrice : dish.price }}</text>
					<text class="unit">积分</text>
					<text v-if="dish.isActivity" class="original-price">{{ dish.price }} 积分</text>
				</view>
				<view class="add-btn" @click.stop="handleAdd">
					<text class="add-icon">+</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue'

	const props = defineProps({
		dish: {
			type: Object,
			default: () => ({})
		}
	})

	const emit = defineEmits(['add'])
	const imageLoaded = ref(false)

	const goDetail = () => {
		uni.navigateTo({
			url: `/pages/dish/detail?id=${props.dish.dishId}`
		})
	}

	const handleAdd = () => {
		emit('add', props.dish)
	}
</script>

<style scoped>
	.dish-card {
		background-color: var(--color-surface);
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 20rpx rgba(90, 60, 40, 0.07);
		display: flex;
		flex-direction: column;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.dish-card:active {
		transform: scale(0.97);
		box-shadow: 0 2rpx 12rpx rgba(90, 60, 40, 0.05);
	}

	.dish-image-wrap {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		overflow: hidden;
		background: linear-gradient(135deg, #FFF2E3, #F5EBE1);
	}

	.dish-image {
		width: 100%;
		height: 100%;
		transition: transform 0.3s ease, opacity 0.5s ease;
		opacity: 0;
	}

	.dish-image.loaded {
		opacity: 1;
	}

	.image-placeholder {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #FFF2E3, #F5EBE1);
		animation: shimmer 1.5s ease-in-out infinite;
	}

	@keyframes shimmer {
		0%, 100% { opacity: 0.6; }
		50% { opacity: 1; }
	}

	.placeholder-icon {
		font-size: 48rpx;
		opacity: 0.4;
	}

	.dish-card:active .dish-image {
		transform: scale(1.03);
	}

	.activity-badge {
		position: absolute;
		top: 0;
		left: 0;
		background: linear-gradient(135deg, #E8706A, #F08080);
		color: var(--color-surface);
		font-size: 18rpx;
		padding: 6rpx 16rpx 6rpx 12rpx;
		border-radius: 0 0 16rpx 0;
		font-weight: 600;
		animation: badgePop 0.3s ease-out;
	}

	@keyframes badgePop {
		from { transform: scale(0.8); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}

	.dish-info {
		padding: 14rpx 16rpx 16rpx;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.dish-name {
		font-size: 26rpx;
		font-weight: 600;
		color: #4A3328;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		margin-bottom: 10rpx;
		line-height: 1.4;
	}

	.dish-bottom {
		margin-top: auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.price-wrap {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 4rpx;
	}

	.price {
		font-size: 34rpx;
		font-weight: 800;
		background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.unit {
		font-size: 20rpx;
		color: var(--color-primary);
		font-weight: 500;
	}

	.original-price {
		font-size: 20rpx;
		color: #C4B5A8;
		text-decoration: line-through;
		width: 100%;
		margin-top: 2rpx;
	}

	.add-btn {
		width: 56rpx;
		height: 56rpx;
		background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(212, 132, 90, 0.3);
		flex-shrink: 0;
		transition: all 0.2s ease;
	}

	.add-btn:active {
		transform: scale(0.85);
		box-shadow: 0 2rpx 8rpx rgba(212, 132, 90, 0.2);
	}

	.add-icon {
		color: var(--color-surface);
		font-size: 32rpx;
		font-weight: bold;
		line-height: 1;
	}
</style>
