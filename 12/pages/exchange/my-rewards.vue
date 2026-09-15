<template>
	<view class="my-rewards-page">
		<!-- 状态统计 -->
		<view class="stats-card">
			<view class="stat-item">
				<text class="stat-value">{{ pendingCount }}</text>
				<text class="stat-label">待审核</text>
			</view>
			<view class="stat-item">
				<text class="stat-value approved-color">{{ approvedCount }}</text>
				<text class="stat-label">已通过</text>
			</view>
			<view class="stat-item">
				<text class="stat-value claimed-color">{{ claimedCount }}</text>
				<text class="stat-label">已兑换</text>
			</view>
			<view class="stat-item">
				<text class="stat-value rejected-color">{{ rejectedCount }}</text>
				<text class="stat-label">已拒绝</text>
			</view>
		</view>

		<!-- 奖励列表 -->
		<view v-if="rewards.length > 0">
			<view v-for="reward in rewards" :key="reward.rewardId" class="reward-item">
				<view class="reward-left">
					<view class="status-dot" :class="statusClass(reward.status)"></view>
				</view>
				<view class="reward-content">
					<view class="reward-header">
						<text class="reward-name">{{ reward.name }}</text>
						<text class="reward-status" :class="statusClass(reward.status)">{{ statusText(reward.status) }}</text>
					</view>
					<text class="reward-desc" v-if="reward.description">{{ reward.description }}</text>
					<view class="reward-footer">
						<text class="reward-points">{{ reward.requiredPoints }} 积分</text>
						<text class="reward-time">{{ formatTime(reward.createdAt) }}</text>
					</view>
					<view class="reward-actions" v-if="reward.status === 0 || reward.status === 2">
						<view class="action-btn edit-btn" @click="goEdit(reward.rewardId)">
							<text class="action-text">编辑</text>
						</view>
						<view class="action-btn del-btn" @click="handleDelete(reward.rewardId, reward.name)" v-if="reward.status === 0">
							<text class="action-text">删除</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<EmptyState v-else-if="!loading" icon="🎁" text="还没有设置过奖励" />

		<!-- 底部按钮 -->
		<view class="bottom-btn" @click="goCreate">
			<text class="bottom-btn-text">设置新奖励</text>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted, computed } from 'vue'
	import { getMyRewards, deleteReward } from '../../api/exchange'
	import EmptyState from '../../components/EmptyState.vue'

	const rewards = ref([])
	const loading = ref(false)

	const pendingCount = computed(() => rewards.value.filter(r => r.status === 0).length)
	const approvedCount = computed(() => rewards.value.filter(r => r.status === 1).length)
	const claimedCount = computed(() => rewards.value.filter(r => r.status === 3).length)
	const rejectedCount = computed(() => rewards.value.filter(r => r.status === 2).length)

	onMounted(() => {
		loadRewards()
	})

	const loadRewards = async () => {
		loading.value = true
		try {
			const data = await getMyRewards({ page: 1, size: 50 })
			rewards.value = data.list || []
		} catch (e) {
			console.error('加载我的奖励失败', e)
		} finally {
			loading.value = false
		}
	}

	const statusText = (status) => {
		const map = { 0: '待审核', 1: '已通过', 2: '已拒绝', 3: '已兑换' }
		return map[status] || '未知'
	}

	const statusClass = (status) => {
		const map = { 0: 'status-pending', 1: 'status-approved', 2: 'status-rejected', 3: 'status-claimed' }
		return map[status] || ''
	}

	const formatTime = (dateStr) => {
		if (!dateStr) return ''
		const d = new Date(dateStr)
		return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
	}

	const goCreate = () => {
		uni.navigateTo({ url: '/pages/exchange/index' })
	}

	const goEdit = (rewardId) => {
		uni.navigateTo({ url: `/pages/exchange/reward-edit?id=${rewardId}` })
	}

	const handleDelete = (rewardId, name) => {
		uni.showModal({
			title: '确认删除',
			content: `确定要删除「${name}」吗？`,
			success: async (res) => {
				if (res.confirm) {
					try {
						await deleteReward(rewardId)
						uni.showToast({ title: '已删除', icon: 'success' })
						loadRewards()
					} catch (e) {
						uni.showToast({ title: e.message || '删除失败', icon: 'none' })
					}
				}
			}
		})
	}
</script>

<style scoped>
	.my-rewards-page {
		padding: 24rpx;
		padding-bottom: 120rpx;
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.stats-card {
		background: linear-gradient(135deg, #D4845A, #E8A87C);
		border-radius: 32rpx;
		padding: 32rpx;
		display: flex;
		justify-content: space-around;
		margin-bottom: 24rpx;
		animation: cardPop 0.4s ease-out;
	}

	@keyframes cardPop {
		from { opacity: 0; transform: translateY(16rpx) scale(0.97); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	.stat-item {
		text-align: center;
	}

	.stat-value {
		font-size: 40rpx;
		font-weight: bold;
		color: #FFFFFF;
		display: block;
	}

	.stat-label {
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.7);
	}

	.approved-color { color: #E8A87C; }
	.claimed-color { color: #FFD700; }
	.rejected-color { color: #F08080; }

	.reward-item {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		padding: 20rpx;
		margin-bottom: 12rpx;
		display: flex;
		gap: 16rpx;
		box-shadow: 0 4rpx 16rpx -2rpx rgba(212, 132, 90, 0.08);
		animation: itemIn 0.3s ease-out both;
	}

	.reward-item:nth-child(1) { animation-delay: 0s; }
	.reward-item:nth-child(2) { animation-delay: 0.06s; }
	.reward-item:nth-child(3) { animation-delay: 0.12s; }
	.reward-item:nth-child(4) { animation-delay: 0.18s; }

	@keyframes itemIn {
		from { opacity: 0; transform: translateX(-12rpx); }
		to { opacity: 1; transform: translateX(0); }
	}

	.reward-left {
		display: flex;
		align-items: flex-start;
		padding-top: 8rpx;
	}

	.status-dot {
		width: 16rpx;
		height: 16rpx;
		border-radius: 50%;
	}

	.status-pending { background-color: #FFD700; }
	.status-approved { background-color: #E8A87C; }
	.status-rejected { background-color: #F08080; }
	.status-claimed { background-color: #D4845A; }

	.reward-content {
		flex: 1;
	}

	.reward-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.reward-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #5C4033;
	}

	.reward-status {
		font-size: 22rpx;
		padding: 4rpx 14rpx;
		border-radius: 999rpx;
	}

	.reward-status.status-pending {
		background-color: rgba(255, 215, 0, 0.15);
		color: #B8860B;
	}

	.reward-status.status-approved {
		background-color: rgba(232, 168, 124, 0.15);
		color: #6B8E23;
	}

	.reward-status.status-rejected {
		background-color: rgba(240, 128, 128, 0.15);
		color: #CD5C5C;
	}

	.reward-status.status-claimed {
		background-color: rgba(212, 132, 90, 0.15);
		color: #D4845A;
	}

	.reward-desc {
		font-size: 22rpx;
		color: #8C786E;
		margin-top: 6rpx;
	}

	.reward-footer {
		display: flex;
		justify-content: space-between;
		margin-top: 10rpx;
	}

	.reward-actions {
		display: flex;
		gap: 12rpx;
		margin-top: 12rpx;
	}

	.action-btn {
		padding: 6rpx 20rpx;
		border-radius: 999rpx;
		transition: transform 0.2s ease;
	}

	.action-btn:active {
		transform: scale(0.95);
	}

	.edit-btn {
		background-color: rgba(212, 132, 90, 0.15);
	}

	.del-btn {
		background-color: rgba(240, 128, 128, 0.15);
	}

	.edit-btn .action-text {
		font-size: 22rpx;
		color: #D4845A;
	}

	.del-btn .action-text {
		font-size: 22rpx;
		color: #F08080;
	}

	.reward-points {
		font-size: 26rpx;
		color: #D4845A;
		font-weight: bold;
	}

	.reward-time {
		font-size: 20rpx;
		color: #B8A89A;
	}

	.bottom-btn {
		position: fixed;
		bottom: 24rpx;
		left: 24rpx;
		right: 24rpx;
		background: linear-gradient(135deg, #D4845A, #E8A87C);
		padding: 24rpx 0;
		border-radius: 999rpx;
		text-align: center;
		box-shadow: 0 8rpx 24rpx rgba(212, 132, 90, 0.35);
		transition: transform 0.2s ease;
		animation: btnSlideUp 0.4s ease-out 0.3s both;
	}

	@keyframes btnSlideUp {
		from { opacity: 0; transform: translateY(20rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.bottom-btn:active {
		transform: scale(0.97);
	}

	.bottom-btn-text {
		font-size: 30rpx;
		color: #FFFFFF;
		font-weight: bold;
	}
</style>
