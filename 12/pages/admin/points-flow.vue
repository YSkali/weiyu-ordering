<template>
	<view class="points-flow-page">
		<!-- 积分卡片 -->
		<view class="points-card">
			<view class="points-icon-wrap">
				<text class="points-icon">🪙</text>
			</view>
			<view>
				<text class="points-label">我的积分 (订单收入)</text>
				<text class="points-value">{{ userStore.state.points }}</text>
			</view>
		</view>

		<!-- 积分流水 -->
		<view class="flow-section">
			<text class="section-title">积分明细</text>

			<Skeleton v-if="loading && flows.length === 0" type="list" :count="6" />

			<view v-if="flows.length > 0">
				<view v-for="flow in flows" :key="flow.flowId" class="flow-item">
					<view class="flow-icon-wrap" :class="flow.change > 0 ? 'flow-add' : 'flow-sub'">
						<text class="flow-icon">{{ flow.change > 0 ? '↑' : '↓' }}</text>
					</view>
					<view class="flow-info">
						<text class="flow-remark">{{ flow.remark || getFlowTypeText(flow.type) }}</text>
						<text class="flow-time">{{ formatTime(flow.createdAt) }}</text>
					</view>
					<text class="flow-change" :class="flow.change > 0 ? 'change-add' : 'change-sub'">
						{{ flow.change > 0 ? '+' : '' }}{{ flow.change }}
					</text>
				</view>
			</view>

			<EmptyState v-else-if="!loading" icon="📊" text="暂无积分记录" />
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue'
	import { getPointsFlow } from '../../api/user'
	import { useUserStore, initUserState, refreshProfile } from '../../store/user'
	import { FLOW_TYPE_MAP } from '../../utils/config'
	import EmptyState from '../../components/EmptyState.vue'
	import Skeleton from '../../components/Skeleton.vue'

	const userStore = useUserStore()
	const flows = ref([])
	const loading = ref(false)
	const page = ref(1)

	onMounted(() => {
		initUserState()
		refreshProfile()
		loadFlows()
	})

	const loadFlows = async () => {
		loading.value = true
		try {
			const data = await getPointsFlow({ page: page.value, size: 50 })
			flows.value = [...flows.value, ...(data.list || [])]
			page.value++
		} catch (e) {
			console.error('加载积分流水失败', e)
		} finally {
			loading.value = false
		}
	}

	const getFlowTypeText = (type) => {
		return FLOW_TYPE_MAP[type]?.text || type
	}

	const formatTime = (dateStr) => {
		if (!dateStr) return ''
		const d = new Date(dateStr)
		return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
	}
</script>

<style scoped>
	.points-flow-page {
		padding: 24rpx;
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.points-card {
		background: linear-gradient(135deg, #D4845A, #E8A87C);
		border-radius: 32rpx;
		padding: 32rpx;
		display: flex;
		align-items: center;
		gap: 20rpx;
		margin-bottom: 24rpx;
		animation: cardPop 0.4s ease-out;
	}

	@keyframes cardPop {
		from { opacity: 0; transform: translateY(16rpx) scale(0.97); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	.points-icon-wrap {
		width: 80rpx;
		height: 80rpx;
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: iconPulse 2s ease-in-out infinite;
	}

	@keyframes iconPulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.06); }
	}

	.points-icon {
		font-size: 40rpx;
	}

	.points-label {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
		display: block;
	}

	.points-value {
		font-size: 48rpx;
		font-weight: bold;
		background: linear-gradient(135deg, #FFFFFF, #FFF2E3);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.section-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #5C4033;
		margin-bottom: 16rpx;
	}

	.flow-item {
		display: flex;
		align-items: center;
		background-color: #FFFFFF;
		border-radius: 20rpx;
		padding: 20rpx;
		margin-bottom: 12rpx;
		box-shadow: 0 4rpx 16rpx -2rpx rgba(212, 132, 90, 0.08);
		animation: flowIn 0.3s ease-out both;
	}

	.flow-item:nth-child(1) { animation-delay: 0s; }
	.flow-item:nth-child(2) { animation-delay: 0.05s; }
	.flow-item:nth-child(3) { animation-delay: 0.1s; }
	.flow-item:nth-child(4) { animation-delay: 0.15s; }
	.flow-item:nth-child(5) { animation-delay: 0.2s; }

	@keyframes flowIn {
		from { opacity: 0; transform: translateX(-12rpx); }
		to { opacity: 1; transform: translateX(0); }
	}

	.flow-icon-wrap {
		width: 48rpx;
		height: 48rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 16rpx;
	}

	.flow-add {
		background-color: rgba(232, 168, 124, 0.2);
	}

	.flow-sub {
		background-color: rgba(240, 128, 128, 0.2);
	}

	.flow-icon {
		font-size: 24rpx;
	}

	.flow-add .flow-icon {
		color: #E8A87C;
	}

	.flow-sub .flow-icon {
		color: #F08080;
	}

	.flow-info {
		flex: 1;
	}

	.flow-remark {
		font-size: 24rpx;
		color: #5C4033;
		font-weight: 500;
	}

	.flow-time {
		font-size: 20rpx;
		color: #B8A89A;
		margin-top: 4rpx;
	}

	.flow-change {
		font-size: 28rpx;
		font-weight: bold;
	}

	.change-add {
		background: linear-gradient(135deg, #E8A87C, #F0C4A8);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.change-sub {
		background: linear-gradient(135deg, #F08080, #F5A0A0);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
</style>
