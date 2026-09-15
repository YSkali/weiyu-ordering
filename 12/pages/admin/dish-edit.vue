<template>
	<view class="dish-edit-page">
		<view class="form-card">
			<!-- 菜品名称 -->
			<view class="form-item">
				<text class="form-label">菜品名称</text>
				<textarea class="form-input" v-model="form.name" placeholder="请输入菜品名称，如：竹笋小蛋糕" />
			</view>

			<!-- 积分价格 -->
			<view class="form-item">
				<text class="form-label">积分价格</text>
				<textarea class="form-input" v-model="form.price" placeholder="请输入所需积分，如：120" />
			</view>

			<!-- 活动价 -->
			<view class="form-item">
				<text class="form-label">活动价（可选）</text>
				<textarea class="form-input" v-model="form.activityPrice" placeholder="活动期间积分价，如：100" />
			</view>

			<!-- 活动时间 -->
			<view class="form-item" v-if="form.activityPrice">
				<text class="form-label">活动开始时间</text>
				<picker mode="date" :value="form.activityStart" @change="onStartDateChange">
					<view class="form-input picker-input">
						<text>{{ form.activityStart || '请选择活动开始日期' }}</text>
					</view>
				</picker>
			</view>
			<view class="form-item" v-if="form.activityPrice">
				<text class="form-label">活动结束时间</text>
				<picker mode="date" :value="form.activityEnd" @change="onEndDateChange">
					<view class="form-input picker-input">
						<text>{{ form.activityEnd || '请选择活动结束日期' }}</text>
					</view>
				</picker>
			</view>

			<!-- 分类 -->
			<view class="form-item">
				<text class="form-label">分类</text>
				<picker :range="categoryNames" @change="onCategoryChange">
					<view class="form-input picker-input">
						<text>{{ categoryNames[selectedCategoryIndex] || '请选择分类' }}</text>
					</view>
				</picker>
			</view>

			<!-- 描述 -->
			<view class="form-item">
				<text class="form-label">描述</text>
				<textarea class="form-textarea" v-model="form.description" placeholder="请输入菜品描述，如：口感绵密的奶油小蛋糕" />
			</view>

			<!-- 图片URL -->
			<view class="form-item">
				<text class="form-label">图片URL</text>
				<textarea class="form-input" v-model="form.imageUrl" placeholder="粘贴图片链接地址" />
			</view>

			<!-- 评论开关 -->
			<view class="form-item form-switch-item">
				<text class="form-label">允许评论</text>
				<switch :checked="form.commentEnabled === 1" @change="onCommentToggle" color="#D4845A" />
			</view>
		</view>

		<!-- 保存按钮 -->
		<view class="save-btn" @click="handleSave">
			<text class="save-text">{{ isEdit ? '保存修改' : '创建菜品' }}</text>
		</view>
	</view>
</template>

<script setup>
	import { ref, computed, onMounted } from 'vue'
	import { getDishDetail, createDish, updateDish, getCategories } from '../../api/dish'

	const isEdit = ref(false)
	let dishId = 0

	const form = ref({
		name: '',
		price: '',
		activityPrice: '',
		activityStart: '',
		activityEnd: '',
		cateId: 1,
		description: '',
		imageUrl: '',
		commentEnabled: 1
	})

	const categories = ref([])
	const selectedCategoryIndex = ref(0)

	const categoryNames = computed(() => categories.value.map(c => c.name))

	onMounted(async () => {
		// 加载分类
		try {
			categories.value = await getCategories()
		} catch (e) {
			console.error('加载分类失败', e)
		}

		// 检查是否编辑模式
		const pages = getCurrentPages()
		const currentPage = pages[pages.length - 1]
		dishId = currentPage.options?.id || currentPage.$page?.options?.id

		if (dishId) {
			isEdit.value = true
			loadDish()
		}
	})

	const loadDish = async () => {
		try {
			const dish = await getDishDetail(dishId)
			form.value = {
				name: dish.name,
				price: dish.price,
				activityPrice: dish.activityPrice || '',
				activityStart: dish.activityStart ? dish.activityStart.substring(0, 10) : '',
				activityEnd: dish.activityEnd ? dish.activityEnd.substring(0, 10) : '',
				cateId: dish.cateId,
				description: dish.description || '',
				imageUrl: dish.imageUrl,
				commentEnabled: dish.commentEnabled
			}
			selectedCategoryIndex.value = categories.value.findIndex(c => c.cateId === dish.cateId)
		} catch (e) {
			uni.showToast({ title: '加载失败', icon: 'none' })
		}
	}

	const onCategoryChange = (e) => {
		selectedCategoryIndex.value = e.detail.value
		form.value.cateId = categories.value[selectedCategoryIndex.value]?.cateId
	}

	const onCommentToggle = (e) => {
		form.value.commentEnabled = e.detail.value ? 1 : 0
	}

	const onStartDateChange = (e) => {
		form.value.activityStart = e.detail.value
	}

	const onEndDateChange = (e) => {
		form.value.activityEnd = e.detail.value
	}

	const handleSave = async () => {
		if (!form.value.name || !form.value.price) {
			uni.showToast({ title: '请填写菜品名称和价格', icon: 'none' })
			return
		}

		const data = {
			...form.value,
			price: Number(form.value.price),
			activityPrice: form.value.activityPrice ? Number(form.value.activityPrice) : null,
			activityStart: form.value.activityStart ? form.value.activityStart + 'T00:00:00' : null,
			activityEnd: form.value.activityEnd ? form.value.activityEnd + 'T23:59:59' : null
		}

		try {
			if (isEdit.value) {
				await updateDish(dishId, data)
				uni.showToast({ title: '修改成功', icon: 'success' })
			} else {
				await createDish(data)
				uni.showToast({ title: '创建成功', icon: 'success' })
			}
			setTimeout(() => {
				uni.navigateBack()
			}, 1500)
		} catch (e) {
			uni.showToast({ title: e.message || '操作失败', icon: 'none' })
		}
	}
</script>

<style scoped>
	.dish-edit-page {
		padding: 24rpx;
		animation: fadeIn 0.4s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.form-card {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;
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

	.form-item {
		margin-bottom: 24rpx;
		animation: formItemIn 0.3s ease-out both;
	}

	.form-item:nth-child(1) { animation-delay: 0.05s; }
	.form-item:nth-child(2) { animation-delay: 0.1s; }
	.form-item:nth-child(3) { animation-delay: 0.15s; }
	.form-item:nth-child(4) { animation-delay: 0.2s; }
	.form-item:nth-child(5) { animation-delay: 0.25s; }
	.form-item:nth-child(6) { animation-delay: 0.3s; }
	.form-item:nth-child(7) { animation-delay: 0.35s; }

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

	.picker-input {
		display: flex;
		align-items: center;
	}

	.form-textarea {
		border: 2rpx solid #EBE1D7;
		border-radius: 16rpx;
		padding: 16rpx;
		font-size: 26rpx;
		color: #5C4033;
		width: 100%;
		height: 160rpx;
		transition: border-color 0.2s ease;
	}

	.form-textarea:focus {
		border-color: #D4845A;
	}

	.form-switch-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.save-btn {
		background: linear-gradient(135deg, #D4845A, #E8A87C);
		padding: 24rpx 0;
		border-radius: 999rpx;
		text-align: center;
		box-shadow: 0 8rpx 24rpx rgba(212, 132, 90, 0.25);
		transition: transform 0.2s ease;
		animation: btnSlideUp 0.4s ease-out 0.15s both;
	}

	@keyframes btnSlideUp {
		from { opacity: 0; transform: translateY(16rpx); }
		to { opacity: 1; transform: translateY(0); }
	}

	.save-btn:active {
		transform: scale(0.97);
	}

	.save-text {
		font-size: 30rpx;
		color: #FFFFFF;
		font-weight: bold;
	}
</style>
