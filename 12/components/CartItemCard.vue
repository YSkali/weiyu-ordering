<template>
	<view class="cart-item">
		<view class="item-image-wrap">
			<view class="image-placeholder" v-if="!imageLoaded">
				<text class="placeholder-icon">🍽️</text>
			</view>
			<image
				class="item-image"
				:class="{ loaded: imageLoaded }"
				:src="item.imageUrl || '/static/images/dish-default.png'"
				mode="aspectFill"
				@load="imageLoaded = true"
			/>
		</view>
		<view class="item-content">
			<view class="item-header">
				<text class="item-name">{{ item.name }}</text>
				<view class="delete-btn" @click="handleRemove">
					<text class="delete-icon">×</text>
				</view>
			</view>
			<view class="item-bottom">
				<text class="item-price">{{ item.price }} <text class="price-unit">积分</text></text>
				<view class="quantity-wrap">
					<view class="qty-btn" :class="{ disabled: item.quantity <= 1 }" @click="handleDecrease">
						<text class="qty-icon">-</text>
					</view>
					<text class="qty-num" :key="item.quantity">{{ item.quantity }}</text>
					<view class="qty-btn qty-btn-add" @click="handleIncrease">
						<text class="qty-icon qty-icon-add">+</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue'

	const props = defineProps({
		item: {
			type: Object,
			default: () => ({})
		}
	})

	const emit = defineEmits(['increase', 'decrease', 'remove'])
	const imageLoaded = ref(false)

	const handleIncrease = () => emit('increase', props.item.dishId)
	const handleDecrease = () => {
		if (props.item.quantity > 1) {
			emit('decrease', props.item.dishId)
		}
	}
	const handleRemove = () => emit('remove', props.item.dishId)
</script>

<style scoped>
	.cart-item {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		padding: 16rpx;
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 16rpx;
		box-shadow: 0 4rpx 16rpx -2rpx rgba(212, 132, 90, 0.08);
		border: 2rpx solid rgba(235, 225, 215, 0.5);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.cart-item:active {
		transform: scale(0.99);
	}

	.item-image-wrap {
		position: relative;
		width: 140rpx;
		height: 140rpx;
		border-radius: 20rpx;
		flex-shrink: 0;
		overflow: hidden;
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
		font-size: 36rpx;
		opacity: 0.4;
	}

	.item-image {
		width: 100%;
		height: 100%;
		transition: transform 0.2s ease, opacity 0.5s ease;
		opacity: 0;
	}

	.item-image.loaded {
		opacity: 1;
	}

	.cart-item:active .item-image {
		transform: scale(1.02);
	}

	.item-content {
		flex: 1;
		min-width: 0;
		height: 140rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 4rpx 0;
	}

	.item-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.item-name {
		font-size: 26rpx;
		font-weight: bold;
		color: var(--color-text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
		padding-right: 8rpx;
	}

	.delete-btn {
		padding: 4rpx 8rpx;
		transition: transform 0.2s ease;
	}

	.delete-btn:active {
		transform: scale(0.85);
	}

	.delete-icon {
		font-size: 32rpx;
		color: var(--color-text-muted);
	}

	.item-bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.item-price {
		font-weight: bold;
		background: var(--gradient-text);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		font-size: 28rpx;
	}

	.price-unit {
		font-size: 20rpx;
		font-weight: normal;
	}

	.quantity-wrap {
		display: flex;
		align-items: center;
		gap: 16rpx;
		background-color: #FAF3ED;
		border-radius: 999rpx;
		padding: 6rpx;
	}

	.qty-btn {
		width: 44rpx;
		height: 44rpx;
		background-color: #FFFFFF;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		transition: transform 0.15s ease;
	}

	.qty-btn:active {
		transform: scale(0.9);
	}

	.qty-btn.disabled {
		opacity: 0.5;
	}

	.qty-btn-add {
		background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
		box-shadow: 0 2rpx 8rpx rgba(212, 132, 90, 0.25);
	}

	.qty-icon {
		font-size: 28rpx;
		color: var(--color-text-secondary);
		font-weight: bold;
		line-height: 1;
	}

	.qty-icon-add {
		color: #FFFFFF;
	}

	.qty-num {
		font-size: 26rpx;
		font-weight: bold;
		min-width: 32rpx;
		text-align: center;
		color: var(--color-text-secondary);
		animation: numPop 0.3s ease-out;
	}

	@keyframes numPop {
		0% { transform: scale(1.3); opacity: 0.5; }
		50% { transform: scale(0.9); }
		100% { transform: scale(1); opacity: 1; }
	}
</style>
