<template>
	<view class="points-page">
		<!-- 积分卡片 -->
		<view class="points-card">
			<view class="points-header">
				<view class="points-icon-wrap">
					<text class="points-icon">🪙</text>
				</view>
				<view>
					<text class="points-label">可用积分余额</text>
					<text class="points-value">{{ userStore.state.points }}</text>
				</view>
			</view>
			<view class="card-actions">
				<view class="sign-in-btn" @click="handleSignIn">
					<text class="sign-in-text">每日签到</text>
				</view>
				<view class="exchange-btn" @click="goExchange">
					<text class="exchange-text">去兑换</text>
				</view>
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
	import { useUserStore } from '../../store/user'
	import { initUserState, refreshProfile } from '../../store/user'
	import { FLOW_TYPE_MAP } from '../../utils/config'
	import request from '../../utils/request'
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

	const handleSignIn = async () => {
		try {
			const data = await request({ url: '/users/sign-in', method: 'POST' })
			uni.showToast({ title: data.message || '签到成功', icon: 'success' })
			await refreshProfile()
			flows.value = []
			page.value = 1
			loadFlows()
		} catch (e) {
			uni.showToast({ title: e.message || '签到失败', icon: 'none' })
		}
	}

	const loadFlows = async () => {
		loading.value = true
		try {
			const data = await getPointsFlow({ page: page.value, size: 20 })
			flows.value = [...flows.value, ...data.list]
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

	const goExchange = () => {
		uni.navigateTo({ url: '/pages/exchange/index' })
	}

	const formatTime = (dateStr) => {
		if (!dateStr) return ''
		const d = new Date(dateStr)
		return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
	}
</script>

<style scoped>
	.points-page {
		padding: 0;
		background-color: #FFFAF5;
		min-height: 100vh;
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* ========== 积分卡片区 ========== */
	.points-card {
		background: linear-gradient(145deg, #D4845A 0%, #E8A87C 50%, #D4B89C 100%);
		padding: 48rpx 32rpx 40rpx;
		position: relative;
		overflow: hidden;
	}

	.points-header {
		display: flex;
		align-items: center;
		gap: 20rpx;
		position: relative;
		z-index: 1;
		animation: slideUp 0.6s ease-out;
	}

	@keyframes slideUp {
		from { opacity: 0; transform: translateY(24rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.points-icon-wrap {
		width: 80rpx;
		height: 80rpx;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(10px);
		animation: iconPulse 2s ease-in-out infinite;
	}

	@keyframes iconPulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.08); }
	}

	.points-icon {
		font-size: 40rpx;
	}

	.points-label {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.7);
		margin-bottom: 4rpx;
	}

	.points-value {
		font-size: 64rpx;
		font-weight: 800;
		color: #FFFFFF;
		text-shadow: 0 2rpx 8rpx rgba(90, 60, 40, 0.1);
	}

	.card-actions {
		position: absolute;
		right: 32rpx;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		gap: 12rpx;
		align-items: center;
		z-index: 1;
		animation: slideLeft 0.5s ease-out 0.2s both;
	}

	@keyframes slideLeft {
		from { opacity: 0; transform: translate(20rpx, -50%); }
		to { opacity: 1; transform: translate(0, -50%); }
	}

	.sign-in-btn {
		background: rgba(255, 215, 0, 0.9);
		padding: 14rpx 28rpx;
		border-radius: 12rpx;
		box-shadow: 0 4rpx 12rpx rgba(255, 215, 0, 0.25);
		transition: transform 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.sign-in-btn::after {
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

	.sign-in-btn:active::after {
		width: 300%;
		height: 300%;
		opacity: 1;
		transition: width 0s, height 0s, opacity 0s;
	}

	.sign-in-btn:active {
		transform: scale(0.95);
	}

	.sign-in-text {
		font-size: 24rpx;
		color: #5C4033;
		font-weight: 700;
	}

	.exchange-btn {
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
		padding: 14rpx 28rpx;
		border-radius: 12rpx;
		transition: transform 0.2s ease;
	}

	.exchange-btn:active {
		transform: scale(0.95);
	}

	.exchange-text {
		font-size: 24rpx;
		color: #FFFFFF;
		font-weight: 600;
	}

	/* ========== 积分明细 ========== */
	.flow-section {
		padding: 24rpx;
		animation: sectionIn 0.4s ease-out 0.2s both;
	}

	@keyframes sectionIn {
		from { opacity: 0; transform: translateY(12rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #4A3328;
		margin-bottom: 16rpx;
	}

	.flow-item {
		display: flex;
		align-items: center;
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding: 20rpx;
		margin-bottom: 10rpx;
		box-shadow: 0 2rpx 12rpx rgba(90, 60, 40, 0.05);
		animation: flowIn 0.3s ease-out both;
	}

	.flow-item:nth-child(1) { animation-delay: 0s; }
	.flow-item:nth-child(2) { animation-delay: 0.05s; }
	.flow-item:nth-child(3) { animation-delay: 0.1s; }
	.flow-item:nth-child(4) { animation-delay: 0.15s; }
	.flow-item:nth-child(5) { animation-delay: 0.2s; }

	@keyframes flowIn {
		from { opacity: 0; transform: translateX(-16rpx); }
		to { opacity: 1; transform: translateX(0); }
	}

	.flow-icon-wrap {
		width: 48rpx;
		height: 48rpx;
		border-radius: 14rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 16rpx;
	}

	.flow-add {
		background: linear-gradient(135deg, #E8A87C, #F0C4A8);
	}

	.flow-sub {
		background: linear-gradient(135deg, #F08080, #F5A0A0);
	}

	.flow-icon {
		font-size: 22rpx;
		color: #FFFFFF;
		font-weight: bold;
	}

	.flow-info {
		flex: 1;
	}

	.flow-remark {
		font-size: 26rpx;
		color: #4A3328;
		font-weight: 500;
	}

	.flow-time {
		font-size: 20rpx;
		color: #B8A89A;
		margin-top: 4rpx;
	}

	.flow-change {
		font-size: 30rpx;
		font-weight: 800;
	}

	.change-add {
		background: linear-gradient(135deg, #6BBF59, #8FD480);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.change-sub {
		background: linear-gradient(135deg, #E8706A, #F09090);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
</style>
