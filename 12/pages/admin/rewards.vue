<template>
	<view class="admin-rewards-page">
		<!-- 积分卡片 -->
		<view class="points-card">
			<view class="points-icon-wrap">
				<text class="points-icon">🪙</text>
			</view>
			<view>
				<text class="points-label">我的积分</text>
				<text class="points-value">{{ userStore.state.points }}</text>
			</view>
		</view>

		<!-- 待审核奖励 -->
		<view class="section">
			<text class="section-title">待审核奖励</text>
			<text class="section-desc">顾客设置的奖励，同意后获得积分</text>

			<Skeleton v-if="loading && rewards.length === 0" type="card" :count="3" />

			<view v-for="reward in pendingRewards" :key="reward.rewardId" class="reward-item">
				<view class="reward-info">
					<text class="reward-name">{{ reward.name }}</text>
					<text class="reward-creator" v-if="reward.creatorName">{{ reward.creatorName }} 设置</text>
					<text class="reward-desc" v-if="reward.description">{{ reward.description }}</text>
					<view class="reward-meta">
						<text class="reward-points">+{{ reward.requiredPoints }} 积分</text>
					</view>
				</view>
				<view class="reward-actions">
					<view class="approve-btn" @click="handleApprove(reward)">
						<text class="approve-text">同意</text>
					</view>
					<view class="reject-btn" @click="handleReject(reward)">
						<text class="reject-text">拒绝</text>
					</view>
				</view>
			</view>

			<EmptyState v-if="pendingRewards.length === 0 && !loading" icon="📋" text="暂无待审核奖励" />
		</view>

		<!-- 已通过奖励 -->
		<view class="section" v-if="approvedRewards.length > 0">
			<text class="section-title">已通过奖励</text>
			<view v-for="reward in approvedRewards" :key="reward.rewardId" class="reward-item">
				<view class="reward-info">
					<text class="reward-name">{{ reward.name }}</text>
					<text class="reward-creator" v-if="reward.creatorName">{{ reward.creatorName }} 设置</text>
					<view class="reward-meta">
						<text class="reward-points">-{{ reward.requiredPoints }} 积分</text>
					</view>
				</view>
				<view class="claim-btn" @click="handleClaim(reward)">
					<text class="claim-text">兑换</text>
				</view>
			</view>
		</view>

		<AdminTabBar current="/pages/admin/rewards" />
	</view>
</template>

<script setup>
	import { ref, onMounted, computed } from 'vue'
	import { getAdminRewards, approveReward, rejectReward, claimReward } from '../../api/exchange'
	import { useUserStore, initUserState, refreshProfile } from '../../store/user'
	import EmptyState from '../../components/EmptyState.vue'
	import AdminTabBar from '../../components/AdminTabBar.vue'
	import Skeleton from '../../components/Skeleton.vue'

	const userStore = useUserStore()
	const rewards = ref([])
	const loading = ref(false)

	const pendingRewards = computed(() => rewards.value.filter(r => r.status === 0))
	const approvedRewards = computed(() => rewards.value.filter(r => r.status === 1))

	onMounted(() => {
		initUserState()
		refreshProfile()
		loadRewards()
	})

	const loadRewards = async () => {
		loading.value = true
		try {
			const data = await getAdminRewards({ page: 1, size: 50 })
			rewards.value = data.list || []
		} catch (e) {
			console.error('加载奖励失败', e)
		} finally {
			loading.value = false
		}
	}

	const handleApprove = (reward) => {
		uni.showModal({
			title: '同意奖励',
			content: `同意「${reward.name}」？同意后可兑换`,
			success: async (res) => {
				if (res.confirm) {
					try {
						await approveReward(reward.rewardId)
						uni.showToast({ title: '已同意', icon: 'success' })
						loadRewards()
					} catch (e) {
						uni.showToast({ title: e.message || '操作失败', icon: 'none' })
					}
				}
			}
		})
	}

	const handleReject = (reward) => {
		uni.showModal({
			title: '拒绝奖励',
			content: `确定拒绝「${reward.name}」？`,
			success: async (res) => {
				if (res.confirm) {
					try {
						await rejectReward(reward.rewardId)
						uni.showToast({ title: '已拒绝', icon: 'success' })
						loadRewards()
					} catch (e) {
						uni.showToast({ title: e.message || '操作失败', icon: 'none' })
					}
				}
			}
		})
	}

	const handleClaim = (reward) => {
		if (userStore.state.points < reward.requiredPoints) {
			uni.showToast({ title: '积分不足', icon: 'none' })
			return
		}

		uni.showModal({
			title: '兑换奖励',
			content: `花费 ${reward.requiredPoints} 积分兑换「${reward.name}」？`,
			success: async (res) => {
				if (res.confirm) {
					try {
						await claimReward(reward.rewardId)
						await refreshProfile()
						uni.showToast({ title: '兑换成功', icon: 'success' })
						loadRewards()
					} catch (e) {
						uni.showToast({ title: e.message || '兑换失败', icon: 'none' })
					}
				}
			}
		})
	}

</script>

<style scoped>
	.admin-rewards-page {
		padding: 16rpx 24rpx;
		padding-bottom: 160rpx;
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

	.section {
		margin-bottom: 24rpx;
		animation: sectionIn 0.4s ease-out both;
	}

	.section:nth-child(2) { animation-delay: 0.1s; }
	.section:nth-child(3) { animation-delay: 0.2s; }

	@keyframes sectionIn {
		from { opacity: 0; transform: translateY(12rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.section-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #5C4033;
		margin-bottom: 4rpx;
	}

	.section-desc {
		font-size: 22rpx;
		color: #8C786E;
		margin-bottom: 16rpx;
		display: block;
	}

	.reward-item {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		padding: 20rpx;
		margin-bottom: 12rpx;
		display: flex;
		align-items: center;
		gap: 16rpx;
		box-shadow: 0 4rpx 16rpx -2rpx rgba(212, 132, 90, 0.08);
		animation: rewardIn 0.3s ease-out both;
	}

	.reward-item:nth-child(2) { animation-delay: 0s; }
	.reward-item:nth-child(3) { animation-delay: 0.06s; }
	.reward-item:nth-child(4) { animation-delay: 0.12s; }

	@keyframes rewardIn {
		from { opacity: 0; transform: translateX(-12rpx); }
		to { opacity: 1; transform: translateX(0); }
	}

	.reward-item.approved {
		opacity: 0.7;
	}

	.reward-info {
		flex: 1;
	}

	.reward-name {
		font-size: 26rpx;
		font-weight: bold;
		color: #5C4033;
		display: block;
	}

	.reward-creator {
		font-size: 22rpx;
		color: #D4845A;
		display: block;
		margin-top: 2rpx;
	}

	.reward-desc {
		font-size: 22rpx;
		color: #8C786E;
		display: block;
		margin-top: 4rpx;
	}

	.reward-meta {
		display: flex;
		gap: 16rpx;
		margin-top: 8rpx;
	}

	.reward-points {
		font-size: 26rpx;
		font-weight: bold;
		background: linear-gradient(135deg, #D4845A, #E8A87C);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.reward-actions {
		display: flex;
		gap: 12rpx;
		flex-shrink: 0;
	}

	.approve-btn {
		background: linear-gradient(135deg, #E8A87C, #F0C4A8);
		padding: 12rpx 24rpx;
		border-radius: 999rpx;
		box-shadow: 0 4rpx 12rpx rgba(232, 168, 124, 0.3);
		transition: transform 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.approve-btn::after {
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

	.approve-btn:active::after {
		width: 300%;
		height: 300%;
		opacity: 1;
		transition: width 0s, height 0s, opacity 0s;
	}

	.approve-btn:active {
		transform: scale(0.95);
	}

	.approve-text {
		font-size: 24rpx;
		color: #FFFFFF;
		font-weight: bold;
	}

	.reject-btn {
		background-color: #FFFFFF;
		border: 2rpx solid #F08080;
		padding: 12rpx 24rpx;
		border-radius: 999rpx;
		transition: transform 0.2s ease;
	}

	.reject-btn:active {
		transform: scale(0.95);
	}

	.reject-text {
		font-size: 24rpx;
		color: #F08080;
	}

	.claim-btn {
		background: linear-gradient(135deg, #D4845A, #E8A87C);
		padding: 12rpx 24rpx;
		border-radius: 999rpx;
		flex-shrink: 0;
		box-shadow: 0 4rpx 12rpx rgba(212, 132, 90, 0.3);
		transition: transform 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.claim-btn::after {
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

	.claim-btn:active::after {
		width: 300%;
		height: 300%;
		opacity: 1;
		transition: width 0s, height 0s, opacity 0s;
	}

	.claim-btn:active {
		transform: scale(0.95);
	}

	.claim-text {
		font-size: 24rpx;
		color: #FFFFFF;
		font-weight: bold;
	}
</style>
