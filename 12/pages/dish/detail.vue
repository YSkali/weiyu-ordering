<template>
	<view class="detail-page">
		<!-- 菜品图片 -->
		<view class="hero-image-wrap">
			<view class="image-placeholder" v-if="!imageLoaded">
				<text class="placeholder-icon">🍽️</text>
			</view>
			<image class="hero-image" :class="{ loaded: imageLoaded }" :src="dish.imageUrl" mode="aspectFill" @load="imageLoaded = true" />
			<view v-if="dish.isActivity" class="activity-badge">特价</view>
		</view>

		<!-- 菜品信息 -->
		<view class="dish-info-card">
			<text class="dish-name">{{ dish.name }}</text>
			<text class="dish-desc" v-if="dish.description">{{ dish.description }}</text>
			<view class="price-row">
				<view class="price-wrap">
					<text class="price">{{ dish.isActivity ? dish.activityPrice : dish.price }}</text>
					<text class="unit">积分</text>
				</view>
				<text v-if="dish.isActivity" class="original-price">{{ dish.price }} 积分</text>
			</view>
			<view class="meta-row">
				<text class="cate-tag">{{ dish.cateName }}</text>
			</view>
		</view>

		<!-- 评论区 -->
		<view class="comment-section" v-if="dish.commentEnabled">
			<text class="section-title">用户评价</text>

			<view v-if="comments.length === 0" class="no-comments">
				<text class="no-text">暂无评论，快来抢沙发~</text>
			</view>

			<view v-for="comment in comments" :key="comment.commentId" class="comment-item">
				<view class="comment-header">
					<image class="avatar" :src="comment.user?.avatar || '/static/images/avatar-default.png'" />
					<view class="comment-user-info">
						<text class="nickname">{{ comment.user?.nickname || '用户' }}</text>
						<view class="rating-stars">
							<text v-for="i in 5" :key="i" class="star" :class="{ active: i <= comment.rating }">★</text>
						</view>
					</view>
					<text class="comment-time">{{ formatTime(comment.createdAt) }}</text>
				</view>
				<text class="comment-content">{{ comment.content }}</text>

				<!-- 回复列表 -->
				<view v-if="comment.replies && comment.replies.length > 0" class="replies">
					<view v-for="reply in comment.replies" :key="reply.commentId" class="reply-item">
						<text class="reply-nickname">{{ reply.user?.nickname || '用户' }}：</text>
						<text class="reply-content">{{ reply.content }}</text>
					</view>
				</view>

				<!-- 管理员回复输入框 -->
				<view v-if="userStore.state.role === 'admin'" class="reply-input-wrap">
					<textarea class="reply-input" v-model="replyTexts[comment.commentId]" placeholder="回复这条评论..." maxlength="200" />
					<view class="reply-send-btn" @click="handleReply(comment.commentId)">
						<text class="reply-send-text">回复</text>
					</view>
					<view class="comment-del-btn" @click="handleDeleteComment(comment.commentId)">
						<text class="comment-del-text">删除</text>
					</view>
				</view>
			</view>

			<!-- 顾客评论输入框 -->
			<view v-if="userStore.state.role === 'customer'" class="comment-input-card">
				<text class="comment-input-title">发表评论</text>
				<view class="rating-select">
					<text class="rating-label">评分：</text>
					<text v-for="i in 5" :key="i" class="rating-star" :class="{ active: i <= newRating }" @click="newRating = i">★</text>
				</view>
				<textarea class="comment-textarea" v-model="newComment" placeholder="说说你对这道菜的看法..." maxlength="500" />
				<view class="comment-submit-btn" @click="handleComment">
					<text class="comment-submit-text">发表评论</text>
				</view>
			</view>
		</view>

		<!-- 底部操作栏 -->
		<view class="bottom-bar safe-bottom">
			<view class="bottom-price">
				<text class="bottom-price-value">{{ dish.isActivity ? dish.activityPrice : dish.price }}</text>
				<text class="bottom-price-unit">积分</text>
			</view>
			<view class="add-cart-btn" @click="handleAddToCart">
				<text class="add-cart-text">加入购物车</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue'
	import { getDishDetail } from '../../api/dish'
	import { getComments, createComment, deleteComment } from '../../api/comment'
	import { useCartStore } from '../../store/cart'
	import { useUserStore } from '../../store/user'

	const cartStore = useCartStore()
	const userStore = useUserStore()
	const dish = ref({})
	const comments = ref([])
	const newComment = ref('')
	const newRating = ref(5)
	const replyTexts = ref({})
	const imageLoaded = ref(false)
	let dishId = 0

	onMounted(() => {
		const pages = getCurrentPages()
		const currentPage = pages[pages.length - 1]
		dishId = currentPage.options?.id || currentPage.$page?.options?.id

		if (dishId) {
			loadDish()
			loadComments()
		}
	})

	const loadDish = async () => {
		try {
			dish.value = await getDishDetail(dishId)
		} catch (e) {
			uni.showToast({ title: '加载失败', icon: 'none' })
		}
	}

	const loadComments = async () => {
		try {
			const data = await getComments(dishId, { page: 1, size: 20 })
			comments.value = data.list || []
		} catch (e) {
			console.error('加载评论失败', e)
		}
	}

	const handleAddToCart = () => {
		cartStore.addItem(dish.value)
	}

	const handleComment = async () => {
		if (!newComment.value.trim()) {
			uni.showToast({ title: '请输入评论内容', icon: 'none' })
			return
		}
		try {
			await createComment({
				dishId: Number(dishId),
				content: newComment.value.trim(),
				rating: newRating.value
			})
			newComment.value = ''
			newRating.value = 5
			uni.showToast({ title: '评论成功', icon: 'success' })
			loadComments()
		} catch (e) {
			uni.showToast({ title: e.message || '评论失败', icon: 'none' })
		}
	}

	const handleReply = async (commentId) => {
		const text = replyTexts.value[commentId]
		if (!text || !text.trim()) {
			uni.showToast({ title: '请输入回复内容', icon: 'none' })
			return
		}
		try {
			await createComment({
				dishId: Number(dishId),
				content: text.trim(),
				rating: 5,
				parentId: commentId
			})
			replyTexts.value[commentId] = ''
			uni.showToast({ title: '回复成功', icon: 'success' })
			loadComments()
		} catch (e) {
			uni.showToast({ title: e.message || '回复失败', icon: 'none' })
		}
	}

	const handleDeleteComment = async (commentId) => {
		uni.showModal({
			title: '提示',
			content: '确定删除这条评论吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						await deleteComment(commentId)
						uni.showToast({ title: '删除成功', icon: 'success' })
						loadComments()
					} catch (e) {
						uni.showToast({ title: e.message || '删除失败', icon: 'none' })
					}
				}
			}
		})
	}

	const formatTime = (dateStr) => {
		if (!dateStr) return ''
		const d = new Date(dateStr)
		return `${d.getMonth() + 1}/${d.getDate()}`
	}
</script>

<style scoped>
	.detail-page {
		padding-bottom: 160rpx;
		animation: fadeIn 0.4s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.hero-image-wrap {
		width: 100%;
		height: 500rpx;
		position: relative;
		background-color: #FAF3ED;
		overflow: hidden;
	}

	.image-placeholder {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #FFF2E3, #F5EBE1);
		animation: shimmer 1.5s ease-in-out infinite;
		z-index: 1;
	}

	@keyframes shimmer {
		0%, 100% { opacity: 0.6; }
		50% { opacity: 1; }
	}

	.placeholder-icon {
		font-size: 80rpx;
		opacity: 0.4;
	}

	.hero-image {
		width: 100%;
		height: 100%;
		transition: opacity 0.6s ease, transform 0.6s ease;
		opacity: 0;
		transform: scale(1.05);
	}

	.hero-image.loaded {
		opacity: 1;
		transform: scale(1);
	}

	@keyframes imageReveal {
		from { transform: scale(1.05); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}

	.activity-badge {
		position: absolute;
		top: 24rpx;
		left: 24rpx;
		background: linear-gradient(135deg, #E8706A, #F08080);
		color: #FFFFFF;
		font-size: 24rpx;
		padding: 8rpx 24rpx;
		border-radius: 999rpx;
		font-weight: bold;
		animation: badgePop 0.3s ease-out 0.3s both;
	}

	@keyframes badgePop {
		from { transform: scale(0.8); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}

	.dish-info-card {
		background-color: #FFFFFF;
		margin: -40rpx 24rpx 0;
		border-radius: 32rpx;
		padding: 32rpx;
		position: relative;
		z-index: 1;
		box-shadow: 0 8rpx 48rpx -4rpx rgba(212, 132, 90, 0.12);
		animation: cardSlideUp 0.4s ease-out 0.2s both;
	}

	@keyframes cardSlideUp {
		from { opacity: 0; transform: translateY(24rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.dish-name {
		font-size: 36rpx;
		font-weight: bold;
		color: #5C4033;
		margin-bottom: 12rpx;
	}

	.dish-desc {
		font-size: 24rpx;
		color: #8C786E;
		margin-bottom: 16rpx;
		line-height: 1.6;
	}

	.price-row {
		display: flex;
		align-items: baseline;
		gap: 16rpx;
		margin-bottom: 12rpx;
	}

	.price-wrap {
		display: flex;
		align-items: baseline;
	}

	.price {
		font-size: 44rpx;
		font-weight: bold;
		background: linear-gradient(135deg, #D4845A, #E8A87C);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.unit {
		font-size: 24rpx;
		color: #D4845A;
		margin-left: 4rpx;
		font-weight: 500;
	}

	.original-price {
		font-size: 24rpx;
		color: #8C786E;
		text-decoration: line-through;
	}

	.meta-row {
		display: flex;
		gap: 12rpx;
	}

	.cate-tag {
		font-size: 22rpx;
		color: #D4845A;
		background-color: #FFF2E3;
		padding: 4rpx 16rpx;
		border-radius: 999rpx;
	}

	.comment-section {
		padding: 32rpx 24rpx;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #5C4033;
		margin-bottom: 24rpx;
	}

	.no-comments {
		text-align: center;
		padding: 48rpx 0;
	}

	.no-text {
		font-size: 24rpx;
		color: #B8A89A;
	}

	.comment-item {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		padding: 24rpx;
		margin-bottom: 16rpx;
		box-shadow: 0 4rpx 16rpx -2rpx rgba(212, 132, 90, 0.08);
		animation: commentIn 0.3s ease-out both;
	}

	.comment-item:nth-child(1) { animation-delay: 0s; }
	.comment-item:nth-child(2) { animation-delay: 0.06s; }
	.comment-item:nth-child(3) { animation-delay: 0.12s; }

	@keyframes commentIn {
		from { opacity: 0; transform: translateY(12rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.comment-header {
		display: flex;
		align-items: center;
		margin-bottom: 12rpx;
	}

	.avatar {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		background-color: #FAF3ED;
		margin-right: 12rpx;
	}

	.comment-user-info {
		flex: 1;
	}

	.nickname {
		font-size: 24rpx;
		font-weight: bold;
		color: #5C4033;
	}

	.rating-stars {
		margin-top: 4rpx;
	}

	.star {
		font-size: 20rpx;
		color: #D4C8C0;
	}

	.star.active {
		color: #FFD700;
	}

	.comment-time {
		font-size: 20rpx;
		color: #B8A89A;
	}

	.comment-content {
		font-size: 26rpx;
		color: #5C4033;
		line-height: 1.6;
	}

	.replies {
		margin-top: 16rpx;
		padding: 16rpx;
		background-color: #FFF8F0;
		border-radius: 16rpx;
	}

	.reply-item {
		margin-bottom: 8rpx;
	}

	.reply-nickname {
		font-size: 22rpx;
		font-weight: bold;
		color: #D4845A;
	}

	.reply-content {
		font-size: 22rpx;
		color: #5C4033;
	}

	.bottom-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #FFFFFF;
		padding: 16rpx 32rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 -4rpx 24rpx rgba(212, 132, 90, 0.08);
		z-index: 100;
		animation: barSlideUp 0.3s ease-out 0.3s both;
	}

	@keyframes barSlideUp {
		from { opacity: 0; transform: translateY(100%); }
		to { opacity: 1; transform: translateY(0); }
	}

	.bottom-price-value {
		font-size: 40rpx;
		font-weight: bold;
		background: linear-gradient(135deg, #D4845A, #E8A87C);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.bottom-price-unit {
		font-size: 22rpx;
		color: #D4845A;
		margin-left: 4rpx;
	}

	.add-cart-btn {
		background: linear-gradient(135deg, #E8A87C, #F0C4A8);
		color: #FFFFFF;
		padding: 20rpx 48rpx;
		border-radius: 999rpx;
		font-weight: bold;
		box-shadow: 0 4rpx 16rpx rgba(232, 168, 124, 0.4);
		transition: transform 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.add-cart-btn::after {
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

	.add-cart-btn:active::after {
		width: 300%;
		height: 300%;
		opacity: 1;
		transition: width 0s, height 0s, opacity 0s;
	}

	.add-cart-btn:active {
		transform: scale(0.96);
	}

	.add-cart-text {
		font-size: 28rpx;
		color: #FFFFFF;
		font-weight: bold;
	}

	.reply-input-wrap {
		margin-top: 16rpx;
		padding-top: 16rpx;
		border-top: 1rpx solid #F5EDE7;
	}

	.reply-input {
		width: 100%;
		min-height: 100rpx;
		font-size: 24rpx;
		color: #5C4033;
		background-color: #FFF8F0;
		border-radius: 16rpx;
		padding: 16rpx;
		box-sizing: border-box;
	}

	.reply-send-btn {
		display: inline-block;
		background: linear-gradient(135deg, #E8A87C, #F0C4A8);
		color: #FFFFFF;
		padding: 12rpx 32rpx;
		border-radius: 999rpx;
		margin-top: 12rpx;
		margin-right: 16rpx;
		position: relative;
		overflow: hidden;
	}

	.reply-send-btn::after {
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

	.reply-send-btn:active::after {
		width: 300%;
		height: 300%;
		opacity: 1;
		transition: width 0s, height 0s, opacity 0s;
	}

	.reply-send-text {
		font-size: 22rpx;
		color: #FFFFFF;
	}

	.comment-del-btn {
		display: inline-block;
		background-color: #F5EDE7;
		padding: 12rpx 32rpx;
		border-radius: 999rpx;
		margin-top: 12rpx;
	}

	.comment-del-text {
		font-size: 22rpx;
		color: #8C786E;
	}

	.comment-input-card {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		padding: 24rpx;
		margin-top: 24rpx;
		box-shadow: 0 4rpx 16rpx -2rpx rgba(212, 132, 90, 0.08);
	}

	.comment-input-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #5C4033;
		margin-bottom: 16rpx;
	}

	.rating-select {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.rating-label {
		font-size: 24rpx;
		color: #8C786E;
		margin-right: 8rpx;
	}

	.rating-star {
		font-size: 36rpx;
		color: #D4C8C0;
		margin-right: 8rpx;
	}

	.rating-star.active {
		color: #FFD700;
	}

	.comment-textarea {
		width: 100%;
		min-height: 160rpx;
		font-size: 26rpx;
		color: #5C4033;
		background-color: #FFF8F0;
		border-radius: 16rpx;
		padding: 16rpx;
		box-sizing: border-box;
		margin-bottom: 16rpx;
	}

	.comment-submit-btn {
		background: linear-gradient(135deg, #E8A87C, #F0C4A8);
		color: #FFFFFF;
		padding: 20rpx 0;
		border-radius: 999rpx;
		text-align: center;
		position: relative;
		overflow: hidden;
	}

	.comment-submit-btn::after {
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

	.comment-submit-btn:active::after {
		width: 300%;
		height: 300%;
		opacity: 1;
		transition: width 0s, height 0s, opacity 0s;
	}

	.comment-submit-text {
		font-size: 28rpx;
		color: #FFFFFF;
		font-weight: bold;
	}
</style>
