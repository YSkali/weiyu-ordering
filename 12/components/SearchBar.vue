<template>
	<view class="search-bar">
		<text class="search-icon">🔍</text>
		<input
			class="search-input"
			type="text"
			:value="modelValue"
			placeholder="搜索想吃的宝贝..."
			placeholder-class="search-placeholder"
			@input="onInput"
			@confirm="onConfirm"
		/>
	</view>
</template>

<script setup>
	defineProps({
		modelValue: {
			type: String,
			default: ''
		}
	})

	const emit = defineEmits(['update:modelValue', 'search'])

	const onInput = (e) => {
		emit('update:modelValue', e.detail.value)
	}

	const onConfirm = () => {
		emit('search')
	}
</script>

<style scoped>
	.search-bar {
		display: flex;
		align-items: center;
		background-color: var(--color-surface);
		border-radius: var(--radius-sm);
		padding: 14rpx 22rpx;
		box-shadow:
			0 2rpx 8rpx rgba(90, 60, 40, 0.04),
			0 4rpx 16rpx rgba(90, 60, 40, 0.03);
		border: 1.5rpx solid var(--color-border-faint);
		transition: border-color 0.3s ease, box-shadow 0.3s ease;
	}

	.search-bar:focus-within {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 4rpx rgba(212, 132, 90, 0.1), 0 4rpx 20rpx rgba(212, 132, 90, 0.08);
	}

	.search-icon {
		margin-right: 10rpx;
		font-size: 26rpx;
		opacity: 0.5;
		transition: opacity 0.3s ease, transform 0.3s ease;
	}

	.search-bar:focus-within .search-icon {
		opacity: 0.8;
		transform: scale(1.1);
	}

	.search-input {
		flex: 1;
		font-size: 26rpx;
		color: var(--color-text-primary);
	}

	.search-placeholder {
		color: #C4B5A8;
		font-size: 26rpx;
	}
</style>
