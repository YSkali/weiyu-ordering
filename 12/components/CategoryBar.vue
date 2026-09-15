<template>
	<scroll-view class="category-bar" scroll-x :show-scrollbar="false">
		<view
			v-for="cat in categories"
			:key="cat.cateId"
			class="category-item"
			:class="{ active: activeId === cat.cateId }"
			@click="handleSelect(cat.cateId)"
		>
			<text v-if="cat.cateId === 0" class="fire-icon">🔥</text>
			<text class="category-text">{{ cat.name }}</text>
		</view>
	</scroll-view>
</template>

<script setup>
	defineProps({
		categories: {
			type: Array,
			default: () => []
		},
		activeId: {
			type: Number,
			default: 0
		}
	})

	const emit = defineEmits(['select'])

	const handleSelect = (cateId) => {
		emit('select', cateId)
	}
</script>

<style scoped>
	.category-bar {
		white-space: nowrap;
		padding: 12rpx 0;
	}

	.category-item {
		display: inline-flex;
		align-items: center;
		padding: 12rpx 28rpx;
		border-radius: 12rpx;
		background-color: #FFFFFF;
		color: #8A7060;
		font-size: 24rpx;
		font-weight: 500;
		margin-right: 12rpx;
		box-shadow: 0 2rpx 8rpx rgba(90, 60, 40, 0.04);
		transition: all 0.25s ease;
		border: 1.5rpx solid #FAF3ED;
	}

	.category-item.active {
		background: linear-gradient(135deg, #D4845A, #E8A87C);
		color: #FFFFFF;
		border-color: transparent;
		box-shadow: 0 4rpx 16rpx rgba(212, 132, 90, 0.25);
		font-weight: 600;
	}

	.fire-icon {
		margin-right: 6rpx;
		font-size: 22rpx;
	}

	.category-text {
		line-height: 1;
	}
</style>
