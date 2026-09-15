<template>
	<view class="exchange-page">
		<!-- 我的积分 -->
		<view class="my-points">
			<view class="my-points-left">
				<text class="my-points-label">我的积分</text>
				<text class="my-points-value">{{ userStore.state.points }}</text>
			</view>
			<view class="my-rewards-btn" @click="goMyRewards">
				<text class="my-rewards-text">我的奖励 ›</text>
			</view>
		</view>

		<!-- 创建奖励 -->
		<view class="create-card">
			<text class="create-title">设置积分奖励</text>
			<text class="create-desc">设置奖励让管理员来完成</text>
			<view class="form-row">
				<text class="form-label">奖励名称</text>
				<textarea class="form-input" v-model="newReward.name" placeholder="如：帮我带杯奶茶、洗碗一次" />
			</view>
			<view class="form-row">
				<text class="form-label">所需积分</text>
				<textarea class="form-input" v-model="newReward.requiredPoints" placeholder="设置所需积分，如：200" />
			</view>
			<view class="form-row">
				<text class="form-label">描述</text>
				<textarea class="form-input" v-model="newReward.description" placeholder="可选，补充说明奖励内容" />
			</view>
			<view class="create-btn" @click="handleCreate">
				<text class="create-btn-text">确认设置</text>
			</view>
		</view>

		<!-- 奖品列表 -->
		<view class="section-title" v-if="rewards.length > 0">
			<text>已设置的奖励</text>
		</view>
		<Skeleton v-if="loading && rewards.length === 0" type="card" :count="3" />
		<view class="reward-list" v-if="rewards.length > 0">
			<view v-for="reward in rewards" :key="reward.rewardId" class="reward-card">
				<view class="reward-info">
					<text class="reward-name">{{ reward.name }}</text>
					<text class="reward-desc" v-if="reward.description">{{ reward.description }}</text>
					<view class="reward-meta">
						<text class="reward-points">{{ reward.requiredPoints }} 积分</text>
						<text class="reward-stock" v-if="reward.stock >= 0">库存: {{ reward.stock }}</text>
					</view>
				</view>
			</view>
		</view>

		<EmptyState v-else-if="!loading" icon="🎁" text="暂无奖励，快来设置第一个吧" />
	</view>
</template>

<script setup>
	import { ref, onMounted, reactive } from 'vue'
	import { getRewards, createReward } from '../../api/exchange'
	import { useUserStore } from '../../store/user'
	import { initUserState, refreshProfile } from '../../store/user'
	import EmptyState from '../../components/EmptyState.vue'
	import Skeleton from '../../components/Skeleton.vue'

	const userStore = useUserStore()
	const rewards = ref([])
	const loading = ref(false)

	const newReward = reactive({
		name: '',
		requiredPoints: '',
		description: ''
	})

	onMounted(() => {
		initUserState()
		refreshProfile()
		loadRewards()
	})

	const loadRewards = async () => {
		loading.value = true
		try {
			const data = await getRewards({ page: 1, size: 50 })
			rewards.value = data.list || []
		} catch (e) {
			console.error('加载奖励失败', e)
		} finally {
			loading.value = false
		}
	}

	const goMyRewards = () => {
		uni.navigateTo({ url: '/pages/exchange/my-rewards' })
	}

	const handleCreate = async () => {
		if (!newReward.name) {
			uni.showToast({ title: '请输入奖励名称', icon: 'none' })
			return
		}
		const points = parseInt(newReward.requiredPoints)
		if (!points || points <= 0) {
			uni.showToast({ title: '请输入有效积分', icon: 'none' })
			return
		}

		uni.showModal({
			title: '确认设置',
			content: `设置「${newReward.name}」需要 ${points} 积分？`,
			success: async (res) => {
				if (res.confirm) {
					try {
						await createReward({
							name: newReward.name,
							requiredPoints: points,
							description: newReward.description
						})
						uni.showToast({ title: '设置成功，等待管理员审核', icon: 'success' })
						newReward.name = ''
						newReward.requiredPoints = ''
						newReward.description = ''
						loadRewards()
					} catch (e) {
						uni.showToast({ title: e.message || '设置失败', icon: 'none' })
					}
				}
			}
		})
	}
</script>

<style scoped>
	.exchange-page {
		padding: 0;
		background-color: #FFFAF5;
		min-height: 100vh;
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* ========== 积分头部 ========== */
	.my-points {
		background: linear-gradient(145deg, #D4845A 0%, #E8A87C 50%, #D4B89C 100%);
		padding: 40rpx 32rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;
		overflow: hidden;
	}

	.my-points-label {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	.my-points-value {
		font-size: 48rpx;
		font-weight: bold;
		background: linear-gradient(135deg, #FFFFFF, #FFF2E3);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		animation: numberPop 0.5s ease-out;
	}

	@keyframes numberPop {
		from { transform: scale(0.8); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}

	.my-rewards-btn {
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
		padding: 12rpx 24rpx;
		border-radius: 999rpx;
		transition: transform 0.2s ease;
	}

	.my-rewards-btn:active {
		transform: scale(0.95);
	}

	.my-rewards-text {
		font-size: 24rpx;
		color: #FFFFFF;
	}

	.create-card {
		background-color: #FFFFFF;
		border-radius: 20rpx;
		padding: 28rpx;
		margin: -20rpx 24rpx 24rpx;
		box-shadow: 0 8rpx 32rpx rgba(90, 60, 40, 0.08);
		position: relative;
		z-index: 2;
		animation: cardSlideUp 0.4s ease-out 0.15s both;
	}

	@keyframes cardSlideUp {
		from { opacity: 0; transform: translateY(16rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.create-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #5C4033;
		display: block;
	}

	.create-desc {
		font-size: 22rpx;
		color: #8C786E;
		display: block;
		margin-bottom: 20rpx;
	}

	.form-row {
		margin-bottom: 16rpx;
		animation: formItemIn 0.3s ease-out both;
	}

	.form-row:nth-child(4) { animation-delay: 0.05s; }
	.form-row:nth-child(5) { animation-delay: 0.1s; }
	.form-row:nth-child(6) { animation-delay: 0.15s; }

	@keyframes formItemIn {
		from { opacity: 0; transform: translateY(8rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.form-label {
		font-size: 24rpx;
		color: #8C786E;
		margin-bottom: 8rpx;
		display: block;
	}

	.form-input {
		border: 2rpx solid #EBE1D7;
		border-radius: 16rpx;
		padding: 18rpx 20rpx;
		font-size: 26rpx;
		color: #5C4033;
		width: 100%;
		box-sizing: border-box;
		line-height: 1.5;
		min-height: 40rpx;
		max-height: 80rpx;
		resize: none;
		overflow-y: hidden;
		transition: border-color 0.2s ease;
	}

	.form-input:focus {
		border-color: #D4845A;
	}

	.create-btn {
		background: linear-gradient(135deg, #E8A87C, #F0C4A8);
		padding: 20rpx 0;
		border-radius: 999rpx;
		text-align: center;
		margin-top: 8rpx;
		box-shadow: 0 4rpx 16rpx rgba(232, 168, 124, 0.3);
		transition: transform 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.create-btn::after {
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

	.create-btn:active::after {
		width: 300%;
		height: 300%;
		opacity: 1;
		transition: width 0s, height 0s, opacity 0s;
	}

	.create-btn:active {
		transform: scale(0.97);
	}

	.create-btn-text {
		font-size: 28rpx;
		color: #FFFFFF;
		font-weight: bold;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #4A3328;
		margin-bottom: 16rpx;
		padding: 0 24rpx;
	}

	.reward-list {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		padding: 0 24rpx;
	}

	.reward-card {
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(90, 60, 40, 0.05);
		animation: rewardIn 0.3s ease-out both;
		position: relative;
		overflow: hidden;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.reward-card::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 6rpx;
		background: linear-gradient(180deg, #D4845A, #E8A87C);
		border-radius: 6rpx 0 0 6rpx;
	}

	.reward-card:active {
		transform: scale(0.98);
		box-shadow: 0 4rpx 16rpx rgba(90, 60, 40, 0.1);
	}

	.reward-card:nth-child(1) { animation-delay: 0s; }
	.reward-card:nth-child(2) { animation-delay: 0.06s; }
	.reward-card:nth-child(3) { animation-delay: 0.12s; }
	.reward-card:nth-child(4) { animation-delay: 0.18s; }
	.reward-card:nth-child(5) { animation-delay: 0.24s; }

	@keyframes rewardIn {
		from { opacity: 0; transform: translateX(-12rpx); }
		to { opacity: 1; transform: translateX(0); }
	}

	.reward-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #5C4033;
		display: block;
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

	.reward-stock {
		font-size: 22rpx;
		color: #B8A89A;
	}
</style>
