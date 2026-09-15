<template>
	<view class="login-page">
		<!-- 顶部大面积装饰区域 -->
		<view class="hero-area">
			<view class="hero-circle hero-circle-1"></view>
			<view class="hero-circle hero-circle-2"></view>
			<view class="hero-circle hero-circle-3"></view>
			<view class="hero-particle particle-1"></view>
			<view class="hero-particle particle-2"></view>
			<view class="hero-particle particle-3"></view>
			<view class="hero-content">
				<view class="hero-logo">
					<text class="hero-logo-icon">❤️</text>
					<view class="hero-logo-glow"></view>
				</view>
				<text class="hero-title">味遇</text>
				<text class="hero-subtitle">用积分，遇见美味</text>
			</view>
		</view>

		<!-- 登录表单卡片 -->
		<view class="form-card">
			<!-- 角色切换 -->
			<view class="role-tabs">
				<view class="role-tab" :class="{ active: mode === 'customer' }" @click="mode = 'customer'">
					<text class="role-tab-icon">👤</text>
					<text class="role-tab-text">顾客登录</text>
				</view>
				<view class="role-tab" :class="{ active: mode === 'admin' }" @click="mode = 'admin'">
					<text class="role-tab-icon">🏪</text>
					<text class="role-tab-text">管理员登录</text>
				</view>
			</view>

			<!-- 输入区域 -->
			<view class="input-group">
				<view class="input-item">
					<text class="input-label">账号</text>
					<view class="input-wrap">
						<text class="input-icon">👤</text>
						<textarea class="input-field" v-model="account" placeholder="请输入您的账号" maxlength="32" />
					</view>
				</view>
				<view class="input-item">
					<text class="input-label">密码</text>
					<view class="input-wrap">
						<text class="input-icon">🔒</text>
						<textarea class="input-field input-field-pwd" v-model="password" placeholder="请输入您的密码" maxlength="32" />
					</view>
				</view>
				<view class="input-item" v-if="mode === 'customer'">
					<text class="input-label">口令</text>
					<view class="input-wrap">
						<text class="input-icon">🔑</text>
						<textarea class="input-field" v-model="groupCode" placeholder="请输入管理员提供的口令" maxlength="32" />
					</view>
				</view>
			</view>

			<!-- 登录按钮 -->
			<view class="login-btn" @click="handleLogin">
				<text class="login-btn-text">登 录</text>
				<view class="login-btn-shine"></view>
			</view>

			<!-- 提示 -->
			<view class="tip-area">
				<view class="tip-icon-wrap">
					<text class="tip-icon">💡</text>
				</view>
				<text class="tip-text" v-if="mode === 'customer'">首次登录自动注册 · 需要管理员提供的口令</text>
				<text class="tip-text" v-else>使用内置管理员账户登录</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { accountLogin } from '../../utils/auth'
	import { setUser, initUserState } from '../../store/user'

	export default {
		data() {
			return {
				mode: 'customer',
				account: '',
				password: '',
				groupCode: ''
			}
		},
		onShow() {
			const token = uni.getStorageSync('token')
			const userInfo = uni.getStorageSync('userInfo') || {}
			if (token) {
				if (userInfo.role === 'admin') {
					uni.redirectTo({ url: '/pages/admin/home' })
				} else {
					uni.switchTab({ url: '/pages/index/index' })
				}
			}
		},
		methods: {
			async handleLogin() {
				if (!this.account.trim()) {
					uni.showToast({ title: '请输入账号', icon: 'none' })
					return
				}
				if (!this.password) {
					uni.showToast({ title: '请输入密码', icon: 'none' })
					return
				}
				if (this.mode === 'customer' && !this.groupCode.trim()) {
					uni.showToast({ title: '请输入口令', icon: 'none' })
					return
				}

				uni.showLoading({ title: '登录中...' })
				try {
					const data = await accountLogin(
						this.account.trim(),
						this.password,
						this.mode === 'customer' ? this.groupCode.trim() : undefined
					)
					setUser(data)
					initUserState()

					if (data.isNew) {
						uni.showModal({
							title: '注册成功',
							content: '请牢记你的密码，下次登录需要使用！',
							showCancel: false,
							success: () => {
								this.navigateByRole(data.role)
							}
						})
					} else {
						this.navigateByRole(data.role)
					}
				} catch (e) {
					uni.showToast({ title: e.message || '登录失败', icon: 'none' })
				} finally {
					uni.hideLoading()
				}
			},
			navigateByRole(role) {
				if (role === 'admin') {
					uni.redirectTo({ url: '/pages/admin/home' })
				} else {
					uni.switchTab({ url: '/pages/index/index' })
				}
			}
		}
	}
</script>

<style scoped>
	/* ========== 整体布局 ========== */
	.login-page {
		min-height: 100vh;
		background-color: #FFFAF5;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;
		animation: fadeIn 0.6s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(20rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	/* ========== 顶部英雄区 ========== */
	.hero-area {
		position: relative;
		padding: 100rpx 40rpx 120rpx;
		background: linear-gradient(145deg, #D4845A 0%, #E8A87C 50%, #F0C4A8 100%);
		overflow: hidden;
	}

	.hero-circle {
		position: absolute;
		border-radius: 50%;
	}

	.hero-circle-1 {
		top: -80rpx;
		right: -60rpx;
		width: 350rpx;
		height: 350rpx;
		background: rgba(255, 255, 255, 0.1);
		animation: float 6s ease-in-out infinite;
	}

	.hero-circle-2 {
		bottom: -100rpx;
		left: -80rpx;
		width: 280rpx;
		height: 280rpx;
		background: rgba(255, 255, 255, 0.06);
		animation: float 8s ease-in-out infinite reverse;
	}

	.hero-circle-3 {
		top: 60rpx;
		left: 40%;
		width: 140rpx;
		height: 140rpx;
		background: rgba(255, 242, 227, 0.2);
		animation: float 7s ease-in-out infinite 1s;
	}

	/* 粒子效果 */
	.hero-particle {
		position: absolute;
		width: 12rpx;
		height: 12rpx;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 50%;
	}

	.particle-1 {
		top: 30%;
		left: 20%;
		animation: particleFloat 4s ease-in-out infinite;
	}

	.particle-2 {
		top: 50%;
		right: 25%;
		animation: particleFloat 5s ease-in-out infinite 1s;
	}

	.particle-3 {
		bottom: 30%;
		left: 60%;
		animation: particleFloat 6s ease-in-out infinite 2s;
	}

	@keyframes float {
		0%, 100% { transform: translateY(0) rotate(0deg); }
		33% { transform: translateY(-20rpx) rotate(5deg); }
		66% { transform: translateY(10rpx) rotate(-3deg); }
	}

	@keyframes particleFloat {
		0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
		50% { transform: translateY(-30rpx) scale(1.5); opacity: 0.6; }
	}

	.hero-content {
		position: relative;
		z-index: 1;
		text-align: center;
		animation: slideUp 0.8s ease-out;
	}

	@keyframes slideUp {
		from { opacity: 0; transform: translateY(30rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.hero-logo {
		width: 140rpx;
		height: 140rpx;
		margin: 0 auto 24rpx;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 36rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(10px);
		position: relative;
		animation: heartbeat 2s ease-in-out infinite;
	}

	@keyframes heartbeat {
		0%, 100% { transform: scale(1); }
		14% { transform: scale(1.08); }
		28% { transform: scale(1); }
		42% { transform: scale(1.05); }
		56% { transform: scale(1); }
	}

	.hero-logo-glow {
		position: absolute;
		inset: -10rpx;
		border-radius: 40rpx;
		background: rgba(255, 255, 255, 0.15);
		animation: glow 2s ease-in-out infinite;
	}

	@keyframes glow {
		0%, 100% { opacity: 0.5; transform: scale(1); }
		50% { opacity: 0.8; transform: scale(1.05); }
	}

	.hero-logo-icon {
		font-size: 64rpx;
		position: relative;
		z-index: 1;
	}

	.hero-title {
		font-size: 60rpx;
		font-weight: 800;
		color: #FFFFFF;
		letter-spacing: 16rpx;
		display: block;
		text-shadow: 0 4rpx 12rpx rgba(90, 60, 40, 0.2);
		background: linear-gradient(135deg, #FFFFFF 0%, #FFF2E3 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-subtitle {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.85);
		letter-spacing: 6rpx;
		margin-top: 12rpx;
		display: block;
	}

	/* ========== 表单卡片 ========== */
	.form-card {
		background-color: #FFFFFF;
		border-radius: 40rpx 40rpx 0 0;
		padding: 48rpx 40rpx;
		margin-top: -50rpx;
		position: relative;
		z-index: 2;
		flex: 1;
		box-shadow: 0 -8rpx 40rpx rgba(212, 132, 90, 0.1);
		animation: slideUp 0.6s ease-out 0.2s both;
	}

	/* ========== 角色切换 ========== */
	.role-tabs {
		display: flex;
		gap: 0;
		margin-bottom: 40rpx;
		background-color: #FFF2E3;
		border-radius: 20rpx;
		padding: 6rpx;
	}

	.role-tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		padding: 20rpx;
		border-radius: 16rpx;
		transition: all 0.3s ease;
	}

	.role-tab.active {
		background-color: #FFFFFF;
		box-shadow: 0 4rpx 16rpx rgba(212, 132, 90, 0.12);
		transform: scale(1.02);
	}

	.role-tab-icon {
		font-size: 28rpx;
	}

	.role-tab-text {
		font-size: 28rpx;
		color: #8A7060;
		font-weight: 500;
	}

	.role-tab.active .role-tab-text {
		color: #D4845A;
		font-weight: 700;
	}

	/* ========== 输入区域 ========== */
	.input-group {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		margin-bottom: 40rpx;
	}

	.input-item {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
		animation: inputSlide 0.3s ease-out both;
	}

	.input-item:nth-child(1) { animation-delay: 0.3s; }
	.input-item:nth-child(2) { animation-delay: 0.4s; }
	.input-item:nth-child(3) { animation-delay: 0.5s; }

	@keyframes inputSlide {
		from { opacity: 0; transform: translateY(12rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.input-label {
		font-size: 26rpx;
		color: #8A7060;
		font-weight: 600;
		padding-left: 6rpx;
	}

	.input-wrap {
		display: flex;
		align-items: center;
		background-color: #FFF8F0;
		border: 2rpx solid #F5EBE1;
		border-radius: 20rpx;
		padding: 12rpx 24rpx;
		transition: all 0.3s ease;
	}

	.input-wrap:focus-within {
		border-color: #D4845A;
		box-shadow: 0 0 0 4rpx rgba(212, 132, 90, 0.1);
	}

	.input-icon {
		font-size: 28rpx;
		margin-right: 12rpx;
		opacity: 0.6;
	}

	.input-field {
		flex: 1;
		padding: 16rpx 0;
		font-size: 30rpx;
		color: #4A3328;
		line-height: 1.5;
		min-height: 36rpx;
		max-height: 60rpx;
		resize: none;
		overflow-y: hidden;
		background: transparent;
		border: none;
	}

	.input-field-pwd {
		-webkit-text-security: disc;
	}

	/* ========== 登录按钮 ========== */
	.login-btn {
		background: linear-gradient(135deg, #D4845A 0%, #E8A87C 100%);
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 12rpx 32rpx rgba(212, 132, 90, 0.35);
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.login-btn:active {
		opacity: 0.9;
		transform: scale(0.98);
	}

	.login-btn::after {
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

	.login-btn:active::after {
		width: 300%;
		height: 300%;
		opacity: 1;
		transition: width 0s, height 0s, opacity 0s;
	}

	.login-btn-shine {
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
		animation: shine 3s ease-in-out infinite;
	}

	@keyframes shine {
		0% { left: -100%; }
		50% { left: 100%; }
		100% { left: 100%; }
	}

	.login-btn-text {
		font-size: 32rpx;
		font-weight: 700;
		color: #FFFFFF;
		letter-spacing: 12rpx;
		position: relative;
		z-index: 1;
	}

	/* ========== 提示文字 ========== */
	.tip-area {
		text-align: center;
		padding-top: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
	}

	.tip-icon-wrap {
		width: 48rpx;
		height: 48rpx;
		background: #FFF2E3;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tip-icon {
		font-size: 24rpx;
	}

	.tip-text {
		font-size: 24rpx;
		color: #D4C4B8;
		line-height: 1.6;
	}
</style>
