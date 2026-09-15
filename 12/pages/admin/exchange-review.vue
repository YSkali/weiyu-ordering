<template>
	<view class="exchange-review-page">
		<!-- 状态筛选 -->
		<view class="status-tabs">
			<view
				v-for="tab in tabs"
				:key="tab.value"
				class="tab-item"
				:class="{ active: activeTab === tab.value }"
				@click="switchTab(tab.value)"
			>
				<text class="tab-text">{{ tab.label }}</text>
			</view>
		</view>

		<!-- 加载骨架屏 -->
		<Skeleton v-if="loading && requests.length === 0" type="card" :count="3" />

		<!-- 申请列表 -->
		<view v-for="req in requests" :key="req.requestId" class="request-card">
			<view class="request-header">
				<view>
					<text class="request-user">{{ req.nickname }}</text>
					<text class="request-reward">兑换: {{ req.rewardName }}</text>
				</view>
				<view class="status-badge" :class="'status-' + req.status">
					{{ getStatusText(req.status) }}
				</view>
			</view>
			<view class="request-body">
				<text class="request-points">所需积分: {{ req.requiredPoints }}</text>
				<text class="request-time">{{ formatTime(req.createdAt) }}</text>
				<text v-if="req.remark" class="request-remark">备注: {{ req.remark }}</text>
			</view>
			<view v-if="req.status === 'pending'" class="request-actions">
				<view class="action-btn reject-btn" @click="handleReview(req.requestId, 'rejected')">
					<text class="action-text-reject">拒绝</text>
				</view>
				<view class="action-btn approve-btn" @click="handleReview(req.requestId, 'approved')">
					<text class="action-text-approve">通过</text>
				</view>
			</view>
		</view>

		<EmptyState v-if="requests.length === 0 && !loading" icon="🎁" text="暂无兑换申请" />
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue'
	import { getAllRequests, reviewRequest } from '../../api/exchange'
	import EmptyState from '../../components/EmptyState.vue'
	import Skeleton from '../../components/Skeleton.vue'

	const tabs = [
		{ label: '待审核', value: 'pending' },
		{ label: '已通过', value: 'approved' },
		{ label: '已拒绝', value: 'rejected' },
		{ label: '全部', value: '' }
	]

	const activeTab = ref('pending')
	const requests = ref([])
	const loading = ref(false)

	onMounted(() => {
		loadRequests()
	})

	const switchTab = (value) => {
		activeTab.value = value
		loadRequests()
	}

	const loadRequests = async () => {
		loading.value = true
		try {
			const params = { page: 1, size: 50 }
			if (activeTab.value) params.status = activeTab.value
			const data = await getAllRequests(params)
			requests.value = data.list || []
		} catch (e) {
			console.error('加载申请失败', e)
		} finally {
			loading.value = false
		}
	}

	const getStatusText = (status) => {
		const map = { pending: '待审核', approved: '已通过', rejected: '已拒绝', completed: '已完成' }
		return map[status] || status
	}

	const handleReview = (requestId, status) => {
		const content = status === 'approved' ? '确认通过此兑换申请？' : '确认拒绝此兑换申请？'
		uni.showModal({
			title: '审核确认',
			content,
			success: async (res) => {
				if (res.confirm) {
					try {
						await reviewRequest(requestId, { status })
						uni.showToast({ title: status === 'approved' ? '已通过' : '已拒绝', icon: 'success' })
						loadRequests()
					} catch (e) {
						uni.showToast({ title: e.message || '操作失败', icon: 'none' })
					}
				}
			}
		})
	}

	const formatTime = (dateStr) => {
		if (!dateStr) return ''
		const d = new Date(dateStr)
		return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
	}
</script>

<style scoped>
	.exchange-review-page {
		padding: 16rpx 24rpx;
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.status-tabs {
		display: flex;
		background-color: #FFFFFF;
		border-radius: 999rpx;
		padding: 6rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx -2rpx rgba(212, 132, 90, 0.08);
		animation: slideDown 0.4s ease-out;
	}

	@keyframes slideDown {
		from { opacity: 0; transform: translateY(-12rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 14rpx 0;
		border-radius: 999rpx;
		font-size: 24rpx;
		color: #8C786E;
		font-weight: 500;
		transition: all 0.25s ease;
	}

	.tab-item.active {
		background-color: #D4845A;
		color: #FFFFFF;
		font-weight: bold;
		box-shadow: 0 4rpx 12rpx rgba(212, 132, 90, 0.3);
		animation: tabPop 0.3s ease-out;
	}

	@keyframes tabPop {
		from { transform: scale(0.95); }
		to { transform: scale(1); }
	}

	.request-card {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		padding: 24rpx;
		margin-bottom: 16rpx;
		box-shadow: 0 4rpx 16rpx -2rpx rgba(212, 132, 90, 0.08);
		animation: cardIn 0.3s ease-out both;
	}

	.request-card:nth-child(2) { animation-delay: 0s; }
	.request-card:nth-child(3) { animation-delay: 0.06s; }
	.request-card:nth-child(4) { animation-delay: 0.12s; }

	@keyframes cardIn {
		from { opacity: 0; transform: translateY(12rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.request-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 12rpx;
	}

	.request-user {
		font-size: 28rpx;
		font-weight: bold;
		color: #5C4033;
		display: block;
	}

	.request-reward {
		font-size: 24rpx;
		color: #D4845A;
		margin-top: 4rpx;
		display: block;
	}

	.status-badge {
		font-size: 22rpx;
		padding: 4rpx 16rpx;
		border-radius: 999rpx;
		font-weight: bold;
	}

	.status-pending {
		background-color: rgba(255, 215, 0, 0.2);
		color: #B8860B;
	}

	.status-approved {
		background-color: rgba(232, 168, 124, 0.2);
		color: #5C8A3D;
	}

	.status-rejected {
		background-color: rgba(240, 128, 128, 0.2);
		color: #C05050;
	}

	.request-body {
		margin-bottom: 12rpx;
	}

	.request-points {
		font-size: 24rpx;
		background: linear-gradient(135deg, #D4845A, #E8A87C);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		font-weight: bold;
		display: block;
	}

	.request-time {
		font-size: 22rpx;
		color: #B8A89A;
		margin-top: 4rpx;
		display: block;
	}

	.request-remark {
		font-size: 22rpx;
		color: #8C786E;
		margin-top: 8rpx;
		display: block;
	}

	.request-actions {
		display: flex;
		gap: 16rpx;
		padding-top: 16rpx;
		border-top: 2rpx solid rgba(235, 225, 215, 0.5);
	}

	.action-btn {
		flex: 1;
		padding: 12rpx;
		border-radius: 999rpx;
		text-align: center;
		transition: transform 0.2s ease;
	}

	.action-btn:active {
		transform: scale(0.95);
	}

	.reject-btn {
		border: 2rpx solid #F08080;
	}

	.action-text-reject {
		font-size: 24rpx;
		color: #F08080;
		font-weight: bold;
	}

	.approve-btn {
		background: linear-gradient(135deg, #E8A87C, #F0C4A8);
		box-shadow: 0 4rpx 12rpx rgba(232, 168, 124, 0.3);
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

	.action-text-approve {
		font-size: 24rpx;
		color: #FFFFFF;
		font-weight: bold;
	}
</style>
