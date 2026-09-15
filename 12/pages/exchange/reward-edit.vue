<template>
	<view class="edit-page">
		<view class="edit-card">
			<text class="edit-title">编辑奖励</text>
			<view class="form-row">
				<text class="form-label">奖励名称</text>
				<textarea class="form-input" v-model="form.name" placeholder="请输入奖励名称" />
			</view>
			<view class="form-row">
				<text class="form-label">所需积分</text>
				<textarea class="form-input" v-model="form.requiredPoints" placeholder="请输入所需积分" />
			</view>
			<view class="form-row">
				<text class="form-label">描述</text>
				<textarea class="form-input" v-model="form.description" placeholder="可选，补充说明奖励内容" />
			</view>
			<view class="save-btn" @click="handleSave">
				<text class="save-btn-text">保存修改</text>
			</view>
		</view>

		<view class="tips">
			<text class="tips-text">编辑后奖励将重新提交审核</text>
		</view>
	</view>
</template>

<script setup>
	import { ref, reactive, onMounted } from 'vue'
	import { getMyRewards, updateReward } from '../../api/exchange'

	const rewardId = ref(null)
	const form = reactive({
		name: '',
		requiredPoints: '',
		description: ''
	})

	onMounted(() => {
		const pages = getCurrentPages()
		const page = pages[pages.length - 1]
		rewardId.value = Number(page.options?.id || page.$page?.options?.id)
		if (rewardId.value) {
			loadReward()
		}
	})

	const loadReward = async () => {
		try {
			const data = await getMyRewards({ page: 1, size: 100 })
			const list = data.list || []
			const reward = list.find(r => r.rewardId === rewardId.value)
			if (reward) {
				form.name = reward.name
				form.requiredPoints = String(reward.requiredPoints)
				form.description = reward.description || ''
			} else {
				uni.showToast({ title: '奖励不存在', icon: 'none' })
				setTimeout(() => uni.navigateBack(), 1500)
			}
		} catch (e) {
			uni.showToast({ title: '加载失败', icon: 'none' })
		}
	}

	const handleSave = async () => {
		if (!form.name) {
			uni.showToast({ title: '请输入奖励名称', icon: 'none' })
			return
		}
		const points = parseInt(form.requiredPoints)
		if (!points || points <= 0) {
			uni.showToast({ title: '请输入有效积分', icon: 'none' })
			return
		}

		uni.showModal({
			title: '确认修改',
			content: '编辑后奖励将重新提交管理员审核',
			success: async (res) => {
				if (res.confirm) {
					try {
						await updateReward(rewardId.value, {
							name: form.name,
							requiredPoints: points,
							description: form.description
						})
						uni.showToast({ title: '修改成功', icon: 'success' })
						setTimeout(() => uni.navigateBack(), 1500)
					} catch (e) {
						uni.showToast({ title: e.message || '修改失败', icon: 'none' })
					}
				}
			}
		})
	}
</script>

<style scoped>
	.edit-page {
		padding: 24rpx;
		animation: fadeIn 0.4s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.edit-card {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		padding: 28rpx;
		box-shadow:
			0 2rpx 8rpx rgba(90, 60, 40, 0.04),
			0 4rpx 16rpx rgba(90, 60, 40, 0.03);
		border: 1rpx solid rgba(240, 235, 230, 0.8);
		animation: cardSlideUp 0.4s ease-out;
	}

	@keyframes cardSlideUp {
		from { opacity: 0; transform: translateY(16rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.edit-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #5C4033;
		display: block;
		margin-bottom: 20rpx;
	}

	.form-row {
		margin-bottom: 16rpx;
		animation: formItemIn 0.3s ease-out both;
	}

	.form-row:nth-child(2) { animation-delay: 0.05s; }
	.form-row:nth-child(3) { animation-delay: 0.1s; }
	.form-row:nth-child(4) { animation-delay: 0.15s; }

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
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.form-input:focus {
		border-color: #D4845A;
		box-shadow: 0 0 0 4rpx rgba(212, 132, 90, 0.1);
	}

	.save-btn {
		background: linear-gradient(135deg, #E8A87C, #F0C4A8);
		padding: 20rpx 0;
		border-radius: 999rpx;
		text-align: center;
		margin-top: 8rpx;
		box-shadow: 0 4rpx 16rpx rgba(232, 168, 124, 0.3);
		animation: btnSlideUp 0.4s ease-out 0.15s both;
		transition: transform 0.2s ease;
	}

	@keyframes btnSlideUp {
		from { opacity: 0; transform: translateY(12rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.save-btn:active {
		transform: scale(0.97);
	}

	.save-btn-text {
		font-size: 28rpx;
		color: #FFFFFF;
		font-weight: bold;
	}

	.tips {
		margin-top: 24rpx;
		text-align: center;
	}

	.tips-text {
		font-size: 22rpx;
		color: #B8A89A;
	}
</style>
