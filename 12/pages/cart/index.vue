<template>
	<view class="cart-page">
		<view v-if="cartStore.state.items.length > 0">
			<!-- 购物车列表 -->
			<view
				v-for="(item, index) in cartStore.state.items"
				:key="item.dishId"
				class="cart-item-anim"
				:style="{ animationDelay: index * 0.06 + 's' }"
			>
				<CartItemCard
					:item="item"
					@increase="onIncrease"
					@decrease="onDecrease"
					@remove="onRemove"
				/>
			</view>

			<!-- 结算栏 -->
			<view class="checkout-bar safe-bottom">
				<view class="checkout-info">
					<text class="checkout-label">合计</text>
					<view class="checkout-total">
						<text class="total-value">{{ cartStore.totalPoints() }}</text>
						<text class="total-unit">积分</text>
					</view>
				</view>
				<view class="checkout-btn" @click="handleCheckout">
					<text class="checkout-btn-text">提交订单</text>
					<view class="checkout-btn-shine"></view>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<EmptyState v-else icon="🛍️" text="购物车空空的，快去挑选美食吧~">
			<view class="go-shop-btn" @click="goHome">
				<text class="go-shop-text">去逛逛</text>
			</view>
		</EmptyState>
	</view>
</template>

<script setup>
	import { useCartStore } from '../../store/cart'
	import { createOrder } from '../../api/order'
	import CartItemCard from '../../components/CartItemCard.vue'
	import EmptyState from '../../components/EmptyState.vue'

	const cartStore = useCartStore()

	const onIncrease = (dishId) => {
		const item = cartStore.state.items.find(i => i.dishId === dishId)
		if (item) {
			cartStore.addItem({
				dishId: item.dishId,
				name: item.name,
				price: item.price,
				imageUrl: item.imageUrl,
				isActivity: false,
				activityPrice: item.price
			})
		}
	}

	const onDecrease = (dishId) => {
		cartStore.decreaseItem(dishId)
	}

	const onRemove = (dishId) => {
		cartStore.removeItem(dishId)
	}

	const goHome = () => {
		uni.switchTab({ url: '/pages/index/index' })
	}

	const handleCheckout = async () => {
		if (cartStore.state.items.length === 0) return

		const total = cartStore.totalPoints()

		uni.showModal({
			title: '确认下单',
			content: `本次订单共 ${total} 积分，提交后等待管理员确认`,
			success: async (res) => {
				if (res.confirm) {
					uni.showLoading({ title: '提交中...' })
					try {
						await createOrder({
							items: cartStore.state.items.map(item => ({
								dishId: item.dishId,
								quantity: item.quantity
							}))
						})
						cartStore.clearCart()
						uni.showToast({ title: '下单成功！等待管理员确认', icon: 'success' })
						setTimeout(() => {
							uni.navigateTo({ url: '/pages/order/list' })
						}, 1500)
					} catch (e) {
						uni.showToast({ title: e.message || '下单失败', icon: 'none' })
					} finally {
						uni.hideLoading()
					}
				}
			}
		})
	}
</script>

<style scoped>
	.cart-page {
		padding: 16rpx 24rpx;
		padding-bottom: 240rpx;
		min-height: 100%;
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.cart-item-anim {
		animation: cartItemIn 0.35s ease-out both;
	}

	@keyframes cartItemIn {
		from { opacity: 0; transform: translateX(-20rpx); }
		to { opacity: 1; transform: translateX(0); }
	}

	.checkout-bar {
		position: fixed;
		bottom: 100rpx;
		left: 0;
		right: 0;
		background-color: #FFFFFF;
		margin: 0 24rpx;
		border-radius: 32rpx;
		padding: 24rpx 32rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 8rpx 48rpx -4rpx rgba(212, 132, 90, 0.15);
		z-index: 100;
		animation: slideUp 0.4s ease-out 0.2s both;
	}

	@keyframes slideUp {
		from { opacity: 0; transform: translateY(40rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.checkout-info {
		animation: infoPop 0.3s ease-out 0.3s both;
	}

	@keyframes infoPop {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}

	.checkout-label {
		font-size: 22rpx;
		color: #8C786E;
		margin-bottom: 4rpx;
	}

	.total-value {
		font-size: 40rpx;
		font-weight: bold;
		color: var(--color-primary);
	}

	.total-unit {
		font-size: 24rpx;
		color: var(--color-primary);
		margin-left: 4rpx;
		font-weight: normal;
	}

	.checkout-btn {
		background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
		padding: 20rpx 48rpx;
		border-radius: 999rpx;
		box-shadow: 0 8rpx 24rpx rgba(212, 132, 90, 0.35);
		position: relative;
		overflow: hidden;
	}

	.checkout-btn::after {
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

	.checkout-btn:active::after {
		width: 300%;
		height: 300%;
		opacity: 1;
		transition: width 0s, height 0s, opacity 0s;
	}

	.checkout-btn:active {
		opacity: 0.9;
		transform: scale(0.98);
	}

	.checkout-btn-shine {
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

	.checkout-btn-text {
		font-size: 28rpx;
		color: #FFFFFF;
		font-weight: bold;
		position: relative;
		z-index: 1;
	}

	.go-shop-btn {
		margin-top: 32rpx;
		background: linear-gradient(135deg, var(--color-primary-light), #F0C4A8);
		color: #FFFFFF;
		padding: 16rpx 48rpx;
		border-radius: 999rpx;
		box-shadow: 0 4rpx 16rpx rgba(232, 168, 124, 0.3);
	}

	.go-shop-text {
		font-size: 26rpx;
		color: #FFFFFF;
		font-weight: bold;
	}
</style>
