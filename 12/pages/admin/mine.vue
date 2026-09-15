<template>
	<view class="admin-mine-page">
		<!-- 管理员信息卡片 -->
		<view class="admin-card">
			<view class="admin-card-bg"></view>
			<view class="admin-info">
				<view class="avatar-wrap" @click="handleChangeAvatar">
					<image v-if="userStore.state.avatar" class="avatar-img" :src="avatarUrl" />
					<text v-else class="avatar-icon">🏪</text>
					<view class="avatar-edit">
						<text class="avatar-edit-icon">📷</text>
					</view>
				</view>
				<view class="admin-text">
					<view class="name-row" @click="showNicknameDialog = true">
						<text class="admin-name">{{ userStore.state.nickname || '管理员' }}</text>
						<text class="name-edit">✏️</text>
					</view>
					<text class="admin-role">管理员</text>
				</view>
			</view>
		</view>

		<!-- 积分卡片 -->
		<view class="points-card" @click="goPointsFlow">
			<view class="points-left">
				<view class="points-icon-wrap">
					<text class="points-icon">🪙</text>
				</view>
				<view>
					<text class="points-label">我的积分 (订单收入)</text>
					<text class="points-value">{{ userStore.state.points }}</text>
				</view>
			</view>
			<text class="points-arrow">›</text>
		</view>

		<!-- 菜单列表 -->
		<view class="menu-card">
			<view class="menu-item" @click="goUserManage">
				<view class="menu-icon-wrap menu-icon-blue">
					<text class="menu-icon">👥</text>
				</view>
				<text class="menu-label">用户管理</text>
				<text class="menu-arrow">›</text>
			</view>
			<view class="menu-item" @click="goExchangeReview">
				<view class="menu-icon-wrap menu-icon-pink">
					<text class="menu-icon">🎁</text>
				</view>
				<text class="menu-label">兑换审核</text>
				<text class="menu-arrow">›</text>
			</view>
			<view class="menu-item" @click="showGroupCodeDialog = true">
				<view class="menu-icon-wrap menu-icon-orange">
					<text class="menu-icon">🔑</text>
				</view>
				<text class="menu-label">管理口令</text>
				<text class="menu-arrow">›</text>
			</view>
			<view class="menu-item" @click="showAccountDialog = true">
				<view class="menu-icon-wrap menu-icon-green">
					<text class="menu-icon">✏️</text>
				</view>
				<text class="menu-label">修改账号</text>
				<text class="menu-arrow">›</text>
			</view>
			<view class="menu-item" @click="showPasswordDialog = true">
				<view class="menu-icon-wrap menu-icon-purple">
					<text class="menu-icon">🔒</text>
				</view>
				<text class="menu-label">修改密码</text>
				<text class="menu-arrow">›</text>
			</view>
		</view>

		<!-- 退出登录 -->
		<view class="logout-btn" @click="handleLogout">
			<text class="logout-text">退出登录</text>
		</view>

		<!-- 昵称编辑弹窗 -->
		<view v-if="showNicknameDialog" class="dialog-mask" @click="showNicknameDialog = false">
			<view class="dialog-card" @click.stop>
				<text class="dialog-title">修改昵称</text>
				<text class="dialog-tip">每月可修改一次</text>
				<view class="nickname-warning">
					<text class="warning-icon">⚠️</text>
					<text class="warning-text">修改后的昵称将同步更新为您的登录账号名</text>
				</view>
				<textarea class="dialog-input" v-model="newNickname" placeholder="请输入新昵称" maxlength="16" />
				<view class="dialog-actions">
					<view class="dialog-btn dialog-cancel" @click="showNicknameDialog = false">
						<text>取消</text>
					</view>
					<view class="dialog-btn dialog-confirm" @click="handleSaveNickname">
						<text>确认</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 口令管理弹窗 -->
		<view v-if="showGroupCodeDialog" class="dialog-mask" @click="showGroupCodeDialog = false">
			<view class="dialog-card" @click.stop>
				<text class="dialog-title">管理分组口令</text>
				<text class="dialog-tip">设置后请将口令告知你的顾客，修改口令后正在使用中的顾客需要重新登录</text>
				<textarea class="dialog-input" v-model="newGroupCode" placeholder="请输入口令（如：bubu2024）" maxlength="32" />
				<view class="dialog-actions">
					<view class="dialog-btn dialog-cancel" @click="showGroupCodeDialog = false">
						<text>取消</text>
					</view>
					<view class="dialog-btn dialog-confirm" @click="handleSaveGroupCode">
						<text>保存</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 修改账号弹窗 -->
		<view v-if="showAccountDialog" class="dialog-mask" @click="showAccountDialog = false">
			<view class="dialog-card" @click.stop>
				<text class="dialog-title">修改登录账号</text>
				<text class="dialog-tip">需要输入当前密码确认</text>
				<textarea class="dialog-input" v-model="newAccount" placeholder="请输入新账号" maxlength="32" />
				<textarea class="dialog-input dialog-input-pwd" style="margin-top: 16rpx;" v-model="accountPassword" placeholder="请输入当前密码" maxlength="32" />
				<view class="dialog-actions">
					<view class="dialog-btn dialog-cancel" @click="showAccountDialog = false">
						<text>取消</text>
					</view>
					<view class="dialog-btn dialog-confirm" @click="handleChangeAccount">
						<text>确认</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 修改密码弹窗 -->
		<view v-if="showPasswordDialog" class="dialog-mask" @click="showPasswordDialog = false">
			<view class="dialog-card" @click.stop>
				<text class="dialog-title">修改密码</text>
				<text class="dialog-tip">密码修改后请牢记</text>
				<textarea class="dialog-input dialog-input-pwd" v-model="oldPassword" placeholder="请输入原密码" maxlength="32" />
				<textarea class="dialog-input dialog-input-pwd" style="margin-top: 16rpx;" v-model="newPassword" placeholder="请输入新密码" maxlength="32" />
				<textarea class="dialog-input dialog-input-pwd" style="margin-top: 16rpx;" v-model="confirmPassword" placeholder="请再次输入新密码" maxlength="32" />
				<view class="dialog-actions">
					<view class="dialog-btn dialog-cancel" @click="showPasswordDialog = false">
						<text>取消</text>
					</view>
					<view class="dialog-btn dialog-confirm" @click="handleChangePassword">
						<text>确认</text>
					</view>
				</view>
			</view>
		</view>

		<AdminTabBar current="/pages/admin/mine" />
	</view>
</template>

<script setup>
	import { ref, computed, onMounted } from 'vue'
	import { useUserStore, initUserState, refreshProfile, clearUser } from '../../store/user'
	import { uploadAvatar, updateProfile, changeAccount, changePassword, setGroupCode } from '../../api/user'
	import { BASE_URL } from '../../utils/config'
	import AdminTabBar from '../../components/AdminTabBar.vue'

	const userStore = useUserStore()
	const showNicknameDialog = ref(false)
	const newNickname = ref('')

	// 口令管理
	const showGroupCodeDialog = ref(false)
	const newGroupCode = ref('')

	// 修改账号
	const showAccountDialog = ref(false)
	const newAccount = ref('')
	const accountPassword = ref('')

	// 修改密码
	const showPasswordDialog = ref(false)
	const oldPassword = ref('')
	const newPassword = ref('')
	const confirmPassword = ref('')

	const avatarUrl = computed(() => {
		const av = userStore.state.avatar
		if (!av) return ''
		if (av.startsWith('http')) return av
		return BASE_URL.replace('/v1', '') + av
	})

	onMounted(() => {
		initUserState()
		refreshProfile()
	})

	const handleChangeAvatar = () => {
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: async (res) => {
				uni.showLoading({ title: '上传中...' })
				try {
					await uploadAvatar(res.tempFilePaths[0])
					await refreshProfile()
					uni.showToast({ title: '头像已更新', icon: 'success' })
				} catch (e) {
					uni.showToast({ title: e.message || '上传失败', icon: 'none' })
				} finally {
					uni.hideLoading()
				}
			}
		})
	}

	const handleSaveNickname = async () => {
		const name = newNickname.value.trim()
		if (!name) {
			uni.showToast({ title: '请输入昵称', icon: 'none' })
			return
		}
		if (name === userStore.state.nickname) {
			showNicknameDialog.value = false
			return
		}

		uni.showModal({
			title: '确认修改',
			content: `修改后您的登录账号名也将变为「${name}」，下次登录请使用新名称，确认修改？`,
			success: async (res) => {
				if (res.confirm) {
					try {
						await updateProfile({ nickname: name })
						await refreshProfile()
						showNicknameDialog.value = false
						uni.showToast({ title: '昵称和账号已更新', icon: 'success' })
					} catch (e) {
						uni.showToast({ title: e.message || '修改失败', icon: 'none' })
					}
				}
			}
		})
	}

	const goPointsFlow = () => {
		uni.navigateTo({ url: '/pages/admin/points-flow' })
	}

	const handleSaveGroupCode = async () => {
		const code = newGroupCode.value.trim()
		if (!code) {
			uni.showToast({ title: '请输入口令', icon: 'none' })
			return
		}
		try {
			await setGroupCode(code)
			showGroupCodeDialog.value = false
			uni.showToast({ title: '口令设置成功', icon: 'success' })
		} catch (e) {
			uni.showToast({ title: e.message || '设置失败', icon: 'none' })
		}
	}

	const handleChangeAccount = async () => {
		const acc = newAccount.value.trim()
		if (!acc) {
			uni.showToast({ title: '请输入新账号', icon: 'none' })
			return
		}
		if (!accountPassword.value) {
			uni.showToast({ title: '请输入当前密码', icon: 'none' })
			return
		}
		try {
			await changeAccount(acc, accountPassword.value)
			showAccountDialog.value = false
			newAccount.value = ''
			accountPassword.value = ''
			uni.showToast({ title: '账号修改成功', icon: 'success' })
		} catch (e) {
			uni.showToast({ title: e.message || '修改失败', icon: 'none' })
		}
	}

	const handleChangePassword = async () => {
		if (!oldPassword.value) {
			uni.showToast({ title: '请输入原密码', icon: 'none' })
			return
		}
		if (!newPassword.value) {
			uni.showToast({ title: '请输入新密码', icon: 'none' })
			return
		}
		if (newPassword.value !== confirmPassword.value) {
			uni.showToast({ title: '两次密码不一致', icon: 'none' })
			return
		}
		try {
			await changePassword(oldPassword.value, newPassword.value)
			showPasswordDialog.value = false
			oldPassword.value = ''
			newPassword.value = ''
			confirmPassword.value = ''
			uni.showToast({ title: '密码修改成功', icon: 'success' })
		} catch (e) {
			uni.showToast({ title: e.message || '修改失败', icon: 'none' })
		}
	}

	const goUserManage = () => {
		uni.navigateTo({ url: '/pages/admin/users' })
	}

	const goExchangeReview = () => {
		uni.navigateTo({ url: '/pages/admin/exchange-review' })
	}

	const handleLogout = () => {
		uni.showModal({
			title: '退出登录',
			content: '确定要退出登录吗？',
			success: (res) => {
				if (res.confirm) {
					clearUser()
					uni.reLaunch({ url: '/pages/login/login' })
				}
			}
		})
	}
</script>

<style scoped>
	.admin-mine-page {
		padding: 0 0 160rpx;
		background-color: #FFFAF5;
		min-height: 100vh;
		animation: pageIn 0.5s ease-out;
	}

	@keyframes pageIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* ========== 管理员卡片 ========== */
	.admin-card {
		background: linear-gradient(145deg, #D4845A 0%, #E8A87C 50%, #D4B89C 100%);
		padding: 48rpx 32rpx 40rpx;
		position: relative;
		overflow: hidden;
	}

	.admin-card-bg {
		position: absolute;
		top: -60rpx;
		right: -60rpx;
		width: 280rpx;
		height: 280rpx;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 50%;
		animation: floatDecor 6s ease-in-out infinite;
	}

	@keyframes floatDecor {
		0%, 100% { transform: translateY(0) rotate(0deg); }
		50% { transform: translateY(-16rpx) rotate(5deg); }
	}

	.admin-info {
		display: flex;
		align-items: center;
		gap: 20rpx;
		position: relative;
		z-index: 1;
		animation: slideRight 0.6s ease-out;
	}

	@keyframes slideRight {
		from { opacity: 0; transform: translateX(-24rpx); }
		to { opacity: 1; transform: translateX(0); }
	}

	.avatar-wrap {
		width: 120rpx;
		height: 120rpx;
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
		animation: avatarPop 0.5s ease-out 0.2s both;
	}

	@keyframes avatarPop {
		from { transform: scale(0.7); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.avatar-icon {
		font-size: 56rpx;
	}

	.avatar-edit {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 36rpx;
		background-color: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.avatar-edit-icon {
		font-size: 18rpx;
	}

	.name-row {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.admin-name {
		font-size: 36rpx;
		font-weight: bold;
		color: #FFFFFF;
	}

	.name-edit {
		font-size: 24rpx;
	}

	.admin-role {
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.8);
		background-color: rgba(255, 255, 255, 0.2);
		padding: 4rpx 16rpx;
		border-radius: 999rpx;
		display: inline-block;
		margin-top: 8rpx;
	}

	.points-card {
		background-color: #FFFFFF;
		border-radius: 20rpx;
		padding: 24rpx;
		margin: -20rpx 24rpx 20rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 8rpx 32rpx rgba(90, 60, 40, 0.08);
		position: relative;
		z-index: 2;
		animation: cardPop 0.4s ease-out 0.15s both;
	}

	@keyframes cardPop {
		from { opacity: 0; transform: translateY(16rpx) scale(0.97); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	.points-left {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.points-icon-wrap {
		width: 80rpx;
		height: 80rpx;
		background-color: #FFF2E3;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: iconBounce 2s ease-in-out infinite;
	}

	@keyframes iconBounce {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.06); }
	}

	.points-icon {
		font-size: 36rpx;
	}

	.points-label {
		font-size: 22rpx;
		color: #8C786E;
		display: block;
	}

	.points-value {
		font-size: 40rpx;
		font-weight: bold;
		background: linear-gradient(135deg, #D4845A, #E8A87C);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.points-arrow {
		font-size: 32rpx;
		color: #B8A89A;
		transition: transform 0.2s ease;
	}

	.points-card:active .points-arrow {
		transform: translateX(4rpx);
	}

	.menu-card {
		background-color: #FFFFFF;
		border-radius: 20rpx;
		padding: 4rpx 0;
		margin: 0 24rpx 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(90, 60, 40, 0.06);
		animation: cardPop 0.4s ease-out 0.25s both;
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 24rpx;
		transition: background-color 0.2s ease;
		position: relative;
	}

	.menu-item:not(:last-child)::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 104rpx;
		right: 24rpx;
		height: 2rpx;
		background: linear-gradient(90deg, rgba(212, 132, 90, 0.15), rgba(232, 168, 124, 0.05));
	}

	.menu-item:active {
		background-color: #FFF8F0;
	}

	.menu-icon-wrap {
		width: 64rpx;
		height: 64rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 16rpx;
	}

	.menu-icon-blue { background-color: rgba(135, 206, 235, 0.2); }
	.menu-icon-pink { background-color: rgba(240, 128, 128, 0.2); }
	.menu-icon-orange { background-color: rgba(255, 200, 100, 0.2); }
	.menu-icon-green { background-color: rgba(232, 168, 124, 0.2); }
	.menu-icon-purple { background-color: rgba(180, 150, 220, 0.2); }

	.menu-icon {
		font-size: 28rpx;
	}

	.menu-label {
		flex: 1;
		font-size: 28rpx;
		color: #5C4033;
		font-weight: 500;
	}

	.menu-arrow {
		font-size: 32rpx;
		color: #B8A89A;
		transition: transform 0.2s ease;
	}

	.menu-item:active .menu-arrow {
		transform: translateX(4rpx);
	}

	.logout-btn {
		background-color: #FFFFFF;
		border-radius: 20rpx;
		padding: 24rpx;
		text-align: center;
		margin: 0 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(90, 60, 40, 0.06);
		animation: cardPop 0.4s ease-out 0.35s both;
		transition: transform 0.2s ease;
	}

	.logout-btn:active {
		transform: scale(0.98);
	}

	.logout-text {
		font-size: 28rpx;
		color: #E8706A;
		font-weight: 600;
	}

	/* 弹窗 */
	.dialog-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
		animation: maskIn 0.2s ease-out;
	}

	@keyframes maskIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.dialog-card {
		background-color: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-radius: 28rpx;
		padding: 32rpx;
		width: 80%;
		max-width: 600rpx;
		box-shadow: 0 24rpx 64rpx rgba(0, 0, 0, 0.15);
		animation: dialogPop 0.3s ease-out;
	}

	@keyframes dialogPop {
		from { transform: scale(0.9); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}

	.dialog-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #5C4033;
		display: block;
		margin-bottom: 8rpx;
	}

	.dialog-tip {
		font-size: 22rpx;
		color: #B8A89A;
		display: block;
		margin-bottom: 16rpx;
	}

	.nickname-warning {
		display: flex;
		align-items: center;
		gap: 8rpx;
		background-color: #FFF2E3;
		border: 2rpx solid #F5D0A9;
		border-radius: 12rpx;
		padding: 12rpx 16rpx;
		margin-bottom: 20rpx;
	}

	.warning-icon {
		font-size: 24rpx;
		flex-shrink: 0;
	}

	.warning-text {
		font-size: 22rpx;
		color: #B86B42;
		line-height: 1.4;
	}

	.dialog-input {
		border: 2rpx solid #EBE1D7;
		border-radius: 16rpx;
		padding: 20rpx 24rpx;
		font-size: 28rpx;
		width: 100%;
		box-sizing: border-box;
		min-height: 40rpx;
		max-height: 80rpx;
		resize: none;
		overflow-y: hidden;
		line-height: 1.5;
		transition: border-color 0.2s ease;
	}

	.dialog-input:focus {
		border-color: #D4845A;
	}

	.dialog-input-pwd {
		-webkit-text-security: disc;
	}

	.dialog-actions {
		display: flex;
		gap: 16rpx;
		margin-top: 24rpx;
	}

	.dialog-btn {
		flex: 1;
		padding: 16rpx;
		border-radius: 999rpx;
		text-align: center;
		font-size: 28rpx;
		font-weight: bold;
		transition: transform 0.2s ease;
	}

	.dialog-btn:active {
		transform: scale(0.96);
	}

	.dialog-cancel {
		background-color: #FAF3ED;
		color: #8C786E;
	}

	.dialog-confirm {
		background: linear-gradient(135deg, #D4845A, #E8A87C);
		color: #FFFFFF;
		box-shadow: 0 4rpx 12rpx rgba(212, 132, 90, 0.2);
		position: relative;
		overflow: hidden;
	}

	.dialog-confirm::after {
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

	.dialog-confirm:active::after {
		width: 300%;
		height: 300%;
		opacity: 1;
		transition: width 0s, height 0s, opacity 0s;
	}
</style>
