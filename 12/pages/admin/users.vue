<template>
	<view class="admin-users-page">
		<!-- 搜索 -->
		<view class="search-wrap">
			<input class="search-input" placeholder="搜索用户昵称或账号..." v-model="keyword" @confirm="loadUsers" />
		</view>

		<!-- 加载骨架屏 -->
		<Skeleton v-if="loading && users.length === 0" type="list" :count="6" />

		<!-- 用户列表 -->
		<view v-for="user in users" :key="user.uid" class="user-group">
			<view class="user-card">
				<view class="user-main" @click="toggleAdjust(user)">
					<image class="user-avatar" :src="user.avatar || '/static/images/avatar-default.png'" />
					<view class="user-info">
						<view class="user-name-row">
							<text class="user-name">{{ user.nickname }}</text>
							<text v-if="user.status === 0" class="banned-tag">已禁用</text>
						</view>
						<view class="user-meta">
							<text class="user-points">🪙 {{ user.points }} 积分</text>
							<text class="user-role" :class="user.role === 'admin' ? 'role-admin' : 'role-customer'">
								{{ user.role === 'admin' ? '管理员' : '顾客' }}
							</text>
						</view>
					</view>
				</view>
				<view v-if="user.role === 'customer'" class="action-btns">
					<view class="ban-btn" @click="handleBan(user)">
						<text class="ban-btn-text">{{ user.status === 0 ? '解封' : '禁用' }}</text>
					</view>
					<view class="delete-btn" @click="handleDelete(user)">
						<text class="delete-btn-text">删除</text>
					</view>
				</view>
			</view>

			<!-- 内联积分调整表单 -->
			<view v-if="editingUid === user.uid" class="inline-form">
				<text class="inline-title">调整积分（当前: {{ user.points }}）</text>
				<view class="inline-field">
					<text class="inline-label">变动值（正数增加，负数扣减）</text>
					<textarea class="inline-input" v-model="adjustChange" placeholder="如：100 或 -50" :maxlength="10" />
				</view>
				<view class="inline-field">
					<text class="inline-label">备注</text>
					<textarea class="inline-input" v-model="adjustRemark" placeholder="请输入调整原因" />
				</view>
				<view class="inline-actions">
					<view class="inline-btn inline-cancel" @click="editingUid = ''">
						<text>取消</text>
					</view>
					<view class="inline-btn inline-confirm" @click="handleAdjust(user)">
						<text>确认</text>
					</view>
				</view>
			</view>
		</view>

		<EmptyState v-if="users.length === 0 && !loading" icon="👥" text="暂无用户" />
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue'
	import { getUsers, adjustPoints, deleteCustomer, banCustomer, unbanCustomer } from '../../api/user'
	import EmptyState from '../../components/EmptyState.vue'
	import Skeleton from '../../components/Skeleton.vue'

	const keyword = ref('')
	const users = ref([])
	const loading = ref(false)
	const editingUid = ref('')
	const adjustChange = ref('')
	const adjustRemark = ref('')

	onMounted(() => {
		loadUsers()
	})

	const loadUsers = async () => {
		loading.value = true
		try {
			const params = { page: 1, size: 50 }
			if (keyword.value) params.keyword = keyword.value
			const data = await getUsers(params)
			users.value = data.list || []
		} catch (e) {
			console.error('加载用户失败', e)
		} finally {
			loading.value = false
		}
	}

	const toggleAdjust = (user) => {
		if (editingUid.value === user.uid) {
			editingUid.value = ''
		} else {
			editingUid.value = user.uid
			adjustChange.value = ''
			adjustRemark.value = ''
		}
	}

	const handleAdjust = async (user) => {
		if (!adjustChange.value) {
			uni.showToast({ title: '请输入变动值', icon: 'none' })
			return
		}

		try {
			await adjustPoints(user.uid, {
				change: Number(adjustChange.value),
				remark: adjustRemark.value || '管理员调整'
			})
			uni.showToast({ title: '调整成功', icon: 'success' })
			editingUid.value = ''
			loadUsers()
		} catch (e) {
			uni.showToast({ title: e.message || '调整失败', icon: 'none' })
		}
	}

	const handleDelete = (user) => {
		uni.showModal({
			title: '永久删除',
			content: `确定要永久删除"${user.nickname}"吗？该用户的所有数据（订单、积分、评论）将被清除，且无法恢复。`,
			confirmColor: '#F08080',
			success: async (res) => {
				if (res.confirm) {
					try {
						await deleteCustomer(user.uid)
						uni.showToast({ title: '删除成功', icon: 'success' })
						loadUsers()
					} catch (e) {
						uni.showToast({ title: e.message || '删除失败', icon: 'none' })
					}
				}
			}
		})
	}

	const handleBan = (user) => {
		const isBanned = user.status === 0
		const action = isBanned ? '解封' : '禁用'
		uni.showModal({
			title: `确认${action}`,
			content: isBanned
				? `确定要解封"${user.nickname}"吗？解封后该用户可以正常登录。`
				: `确定要禁用"${user.nickname}"吗？禁用后该用户将无法登录，但数据保留。`,
			confirmColor: isBanned ? '#E8A87C' : '#FFD700',
			success: async (res) => {
				if (res.confirm) {
					try {
						if (isBanned) {
							await unbanCustomer(user.uid)
						} else {
							await banCustomer(user.uid)
						}
						uni.showToast({ title: `${action}成功`, icon: 'success' })
						loadUsers()
					} catch (e) {
						uni.showToast({ title: e.message || `${action}失败`, icon: 'none' })
					}
				}
			}
		})
	}
</script>

<style scoped>
	.admin-users-page {
		padding: 0;
		background-color: #FFFAF5;
		min-height: 100vh;
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.search-wrap {
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding: 12rpx 20rpx;
		margin: 16rpx 24rpx 16rpx;
		box-shadow: 0 4rpx 20rpx rgba(90, 60, 40, 0.06);
		transition: box-shadow 0.2s ease;
		animation: slideDown 0.4s ease-out;
	}

	@keyframes slideDown {
		from { opacity: 0; transform: translateY(-12rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.search-wrap:focus-within {
		box-shadow: 0 0 0 4rpx rgba(212, 132, 90, 0.08);
	}

	.search-input {
		font-size: 26rpx;
		width: 100%;
	}

	.user-group {
		margin: 0 24rpx 12rpx;
		animation: itemIn 0.3s ease-out both;
	}

	.user-group:nth-child(2) { animation-delay: 0s; }
	.user-group:nth-child(3) { animation-delay: 0.05s; }
	.user-group:nth-child(4) { animation-delay: 0.1s; }
	.user-group:nth-child(5) { animation-delay: 0.15s; }

	@keyframes itemIn {
		from { opacity: 0; transform: translateX(-12rpx); }
		to { opacity: 1; transform: translateX(0); }
	}

	.user-card {
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding: 20rpx;
		display: flex;
		align-items: center;
		gap: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(90, 60, 40, 0.05);
		transition: transform 0.2s ease;
	}

	.user-card:active {
		transform: scale(0.99);
	}

	.user-main {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.user-name-row {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.banned-tag {
		font-size: 18rpx;
		color: #F08080;
		background-color: rgba(240, 128, 128, 0.12);
		padding: 2rpx 10rpx;
		border-radius: 8rpx;
	}

	.action-btns {
		display: flex;
		gap: 10rpx;
	}

	.ban-btn {
		padding: 10rpx 24rpx;
		background-color: rgba(255, 215, 0, 0.12);
		border-radius: 16rpx;
		transition: transform 0.2s ease;
	}

	.ban-btn:active {
		transform: scale(0.95);
	}

	.ban-btn-text {
		font-size: 24rpx;
		color: #B8860B;
	}

	.delete-btn {
		padding: 10rpx 24rpx;
		background-color: rgba(240, 128, 128, 0.1);
		border-radius: 16rpx;
		transition: transform 0.2s ease;
	}

	.delete-btn:active {
		transform: scale(0.95);
	}

	.delete-btn-text {
		font-size: 24rpx;
		color: #F08080;
	}

	.user-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background-color: #FAF3ED;
	}

	.user-info {
		flex: 1;
	}

	.user-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #5C4033;
		display: block;
	}

	.user-meta {
		display: flex;
		gap: 12rpx;
		margin-top: 4rpx;
		align-items: center;
	}

	.user-points {
		font-size: 24rpx;
		color: #D4845A;
	}

	.user-role {
		font-size: 20rpx;
		padding: 2rpx 12rpx;
		border-radius: 999rpx;
	}

	.role-admin {
		background-color: rgba(212, 132, 90, 0.15);
		color: #D4845A;
	}

	.role-customer {
		background-color: rgba(232, 168, 124, 0.2);
		color: #5C4033;
	}

	/* 内联表单 */
	.inline-form {
		background-color: #FFF8F0;
		border-radius: 0 0 20rpx 20rpx;
		padding: 20rpx 24rpx;
		margin-top: -8rpx;
		border-top: 1.5rpx solid #FAF3ED;
		box-shadow:
			0 2rpx 8rpx rgba(90, 60, 40, 0.04),
			0 4rpx 16rpx rgba(90, 60, 40, 0.03);
		animation: formSlideDown 0.25s ease-out;
	}

	@keyframes formSlideDown {
		from { opacity: 0; max-height: 0; }
		to { opacity: 1; max-height: 500rpx; }
	}

	.inline-title {
		font-size: 26rpx;
		font-weight: bold;
		color: #5C4033;
		margin-bottom: 16rpx;
		display: block;
	}

	.inline-field {
		margin-bottom: 16rpx;
	}

	.inline-label {
		font-size: 24rpx;
		color: #8C786E;
		margin-bottom: 8rpx;
		display: block;
	}

	.inline-input {
		border: 2rpx solid #EBE1D7;
		border-radius: 16rpx;
		padding: 18rpx 20rpx;
		font-size: 26rpx;
		width: 100%;
		box-sizing: border-box;
		line-height: 1.5;
		min-height: 40rpx;
		max-height: 80rpx;
		resize: none;
		overflow-y: hidden;
		transition: border-color 0.2s ease;
	}

	.inline-input:focus {
		border-color: #D4845A;
	}

	.inline-actions {
		display: flex;
		gap: 16rpx;
		margin-top: 8rpx;
	}

	.inline-btn {
		flex: 1;
		padding: 16rpx;
		border-radius: 999rpx;
		text-align: center;
		font-size: 26rpx;
		font-weight: bold;
		transition: transform 0.2s ease;
	}

	.inline-btn:active {
		transform: scale(0.96);
	}

	.inline-cancel {
		background-color: #FAF3ED;
		color: #8C786E;
	}

	.inline-confirm {
		background: linear-gradient(135deg, #D4845A, #E8A87C);
		color: #FFFFFF;
		box-shadow: 0 4rpx 12rpx rgba(212, 132, 90, 0.2);
	}
</style>
