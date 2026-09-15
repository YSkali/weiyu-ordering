<script>
	export default {
		onLaunch() {
			// #ifdef H5
			this._initH5BackButton()
			// #endif
		},
		onShow() {},
		onHide() {},
		methods: {
			_initH5BackButton() {
				const NO_BACK_PAGES = ['/pages/index/index', '/pages/cart/index', '/pages/points/index', '/pages/profile/index', '/pages/login/login']

				const updateBtn = () => {
					const path = location.hash.replace('#', '').split('?')[0]
					const existing = document.querySelector('.h5-back-btn')

					if (NO_BACK_PAGES.includes(path)) {
						if (existing) existing.remove()
						return
					}

					if (existing) return

					const btn = document.createElement('div')
					btn.className = 'h5-back-btn'
					btn.innerHTML = '&#8249;'
					btn.addEventListener('click', () => {
						const pages = getCurrentPages()
						if (pages.length > 1) {
							uni.navigateBack()
						} else {
							uni.redirectTo({ url: '/pages/login/login' })
						}
					})
					document.body.appendChild(btn)
				}

				updateBtn()
				setInterval(updateBtn, 300)
			}
		}
	}
</script>

<style>
	/* ========== 设计令牌 ========== */
	page {
		/* 主色调 */
		--color-primary: #D4845A;
		--color-primary-light: #E8A87C;
		--color-primary-pale: #F0C4A8;
		--color-primary-dark: #B86B42;

		/* 功能色 */
		--color-accent-red: #E8706A;
		--color-accent-gold: #FFD700;
		--color-accent-green: #6BBF59;

		/* 文字色 */
		--color-text-primary: #4A3328;
		--color-text-secondary: #5C4033;
		--color-text-muted: #8C786E;
		--color-text-hint: #B8A89A;
		--color-text-disabled: #D4C8C0;

		/* 背景色 */
		--color-bg: #FFFAF5;
		--color-bg-warm: #FFF8F0;
		--color-bg-accent: #FFF2E3;
		--color-surface: #FFFFFF;

		/* 边框色 */
		--color-border: #EBE1D7;
		--color-border-light: #F5EBE1;
		--color-border-faint: #FAF3ED;

		/* 渐变 */
		--gradient-primary: linear-gradient(135deg, #D4845A, #E8A87C);
		--gradient-primary-wide: linear-gradient(145deg, #D4845A 0%, #E8A87C 50%, #D4B89C 100%);
		--gradient-text: linear-gradient(135deg, #D4845A, #E8A87C);
		--gradient-hero: linear-gradient(145deg, #D4845A 0%, #E8A87C 50%, #F0C4A8 100%);

		/* 阴影 */
		--shadow-card: 0 4rpx 16rpx -2rpx rgba(212, 132, 90, 0.08);
		--shadow-float: 0 8rpx 32rpx rgba(90, 60, 40, 0.08);
		--shadow-btn: 0 8rpx 24rpx rgba(212, 132, 90, 0.35);

		/* 圆角 */
		--radius-sm: 16rpx;
		--radius-md: 24rpx;
		--radius-lg: 32rpx;
		--radius-full: 999rpx;

		/* 全局样式 */
		background: linear-gradient(180deg, #FFFAF5 0%, #FFF5ED 40%, #FFFAF5 100%);
		color: var(--color-text-primary);
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		font-size: 26rpx;
		line-height: 1.6;
		letter-spacing: 0.02em;
		/* #ifdef H5 */
		max-width: 750px;
		margin: 0 auto;
		min-height: 100vh;
		box-shadow: 0 0 60rpx rgba(212, 132, 90, 0.08);
		position: relative;
		/* #endif */
	}

	/* 微妙颗粒纹理 */
	page::before {
		content: '';
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
		pointer-events: none;
		z-index: 0;
	}

	/* H5 返回按钮 */
	/* #ifdef H5 */
	.h5-back-btn {
		position: fixed;
		left: 12px;
		top: 12px;
		width: 34px;
		height: 34px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 22px;
		color: #FFFFFF;
		cursor: pointer;
		z-index: 9999;
		border-radius: 50%;
		background: linear-gradient(135deg, #D4845A, #E8A87C);
		box-shadow: 0 2px 12px rgba(212,132,90,0.35);
		transition: all 0.2s ease;
	}
	.h5-back-btn:hover {
		background: linear-gradient(135deg, #B86B42, #D4845A);
		transform: scale(1.05);
	}
	/* #endif */

	/* 安全区域 */
	.safe-bottom {
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
	}
</style>
