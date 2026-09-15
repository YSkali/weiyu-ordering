<template>
	<view class="admin-tab-bar">
		<view
			v-for="tab in tabs"
			:key="tab.path"
			class="tab-item"
			:class="{ active: current === tab.path }"
			@click="switchTab(tab.path)"
		>
			<view class="tab-icon-wrap">
				<text class="tab-icon">{{ current === tab.path ? tab.activeIcon : tab.icon }}</text>
				<view v-if="current === tab.path" class="tab-indicator"></view>
			</view>
			<text class="tab-label">{{ tab.label }}</text>
		</view>
	</view>
</template>

<script setup>
	defineProps({
		current: {
			type: String,
			default: ''
		}
	})

	const tabs = [
		{ label: '菜品', icon: '🍜', activeIcon: '🍜', path: '/pages/admin/home' },
		{ label: '接单', icon: '📋', activeIcon: '📋', path: '/pages/admin/accept' },
		{ label: '积分', icon: '🪙', activeIcon: '🪙', path: '/pages/admin/rewards' },
		{ label: '我的', icon: '👤', activeIcon: '👤', path: '/pages/admin/mine' }
	]

	const switchTab = (path) => {
		uni.redirectTo({ url: path })
	}
</script>

<style scoped>
	.admin-tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		display: flex;
		padding: 8rpx 0;
		padding-bottom: calc(8rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -1rpx 0 rgba(0, 0, 0, 0.04), 0 -4rpx 16rpx rgba(90, 60, 40, 0.04);
		z-index: 999;
	}

	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 8rpx 0;
		transition: all 0.2s;
	}

	.tab-icon-wrap {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.tab-icon {
		font-size: 36rpx;
		margin-bottom: 2rpx;
		transition: transform 0.25s ease;
	}

	.tab-item.active .tab-icon {
		transform: scale(1.15);
	}

	.tab-indicator {
		width: 8rpx;
		height: 8rpx;
		background: var(--color-primary);
		border-radius: 50%;
		margin-top: 4rpx;
		animation: dotPop 0.3s ease-out;
	}

	@keyframes dotPop {
		from { transform: scale(0); opacity: 0; }
		50% { transform: scale(1.4); }
		to { transform: scale(1); opacity: 1; }
	}

	.tab-label {
		font-size: 20rpx;
		color: var(--color-text-hint);
		font-weight: 500;
	}

	.tab-item.active .tab-label {
		color: var(--color-primary);
		font-weight: 600;
	}
</style>
