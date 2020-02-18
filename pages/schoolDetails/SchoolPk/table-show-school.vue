<template>
	<view>
		<view class="t-table" id="test_dom" :prop="sizeObj">
			<view class="t-row t-title">
				<view class="t-th">学校名称</view>
				<view class="t-th" v-for="(item, index) in bodyList" :key="index">{{ item.schoolname }}</view>
			</view>
			<scroll-view scroll-y class="t-body">
				<view class="t-row" v-for="(row, index) in keyList" :key="index">
					<view class="t-td">{{ row.name }}</view>
					<view class="t-td" v-for="(item, i) in bodyList" :key="i">{{ item[row.value] || '-' }}</view>
				</view>
			</scroll-view>
			<slot></slot>
		</view>
		
	</view>
</template>

<script>
export default {
	props: {
		tableHeight: String,
		tableWidth: String,
		bodyList: Array
	},
	watch: {
		tableHeight() {
			this.refresh();
		}
	},
	data() {
		return {
			isShow:true,
			sizeObj:{
				height:'auto'
			},
			keyList: [
				{
					name: '所在地',
					value: 'city'
				},
				{
					name: '建校时间',
					value: 'establishdate'
				},
				{
					name: '办学层次',
					value: 'schooltype'
				},
				{
					name: '举办者',
					value: 'organizer'
				},
				{
					name: '是否为重点（示范）学校',
					value: 'sfzd'
				},
				{
					name: '在校生总数/人',
					value: 'zxs'
				},
				{
					name: '学校占地面积/平方公里',
					value: 'zdmj'
				},
				{
					name: '师生比',
					value: 'ssb'
				},
				{
					name: '双师型教师占比',
					value: 'ssjsb'
				},
				{
					name: '专业设置数',
					value: 'zysz'
				},
				{
					name: '技能大赛获奖数',
					value: 'jnds'
				},
				{
					name: '本科以上专任教师占比',
					value: 'bkjsb'
				},
				{
					name: '高讲教师占比',
					value: 'gjjsb'
				},
				{
					name: '就业率',
					value: 'jyl'
				},
				{
					name: '兼职教师占专任教师比例',
					value: 'jzjsb'
				}
			]
		};
	},
	methods: {
		refresh() {
			this.show = false;
			this.$nextTick(() => {
				this.show = true;
			});
		},
		toEmail(options) {
			this.isShow = true
			uni.saveImageToPhotosAlbum({
				filePath: options.target,
				success: function() {
					// options.bitmap.clear(); //销毁Bitmap图片
					uni.showToast({
						title: '保存图片成功',
						mask: false,
						duration: 1500
					});
				}
			});
			return;
			uni.showToast({
				title: '暂未开通',
				icon: 'none'
			});
		},
		hideBtn(){
			this.isShow = false;
		}
	}
};
</script>

<style scoped lang="scss">
@import './tableShow.scss';
</style>
