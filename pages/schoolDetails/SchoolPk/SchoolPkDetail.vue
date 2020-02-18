<template>
	<view id="container">
		<view class="m-top">
			<view class="content">
				<view class="left">
					<view class="item" v-for="(item, i) of bodyList" :key="i">{{ item.schoolname }}</view>
				</view>
				
				<view class="right"><image src="/static/indexIcon/pk-vs.png" mode="aspectFit" style="width: 183upx; height: 106upx;" /></view>
			</view>
			<view class="m-logo" style="position: fixed;top: 0;left:0;width: 750rpx;z-index: 100;" v-if="!isShow">
				<image class="logo-t-img" src="../../../static/logo_top.png" mode="aspectFit"></image>
			</view>
		</view>
		<view class="m-title"><text>学校对比信息</text></view>
		<view class="m-radar" v-if="radar"><canvas canvas-id="canvasRadar" id="canvasRadar" class="charts" @touchstart="touchPie($event, 'canvasRadar')"></canvas></view>
		<view class="m-table">
			<QSTabs ref="tabs" :current="current" :tabs="tabs" width="375" swiperWidth="750" activeColor="#6451FC" backgroundColor="#fff" @change="change($event)" />
			<swiper
				:style="{ height: `${scrollH}`, borderTop: '1upx solid rgba(238, 238, 238, 0.3)' }"
				:current="current"
				@change="swiperChange"
				@transition="transition"
				@animationfinish="animationfinish"
			>
				<swiper-item>
					<view class="swiper1">
						<table-show id="table_data" :tableWidth="tableWidth" :bodyList="bodyList">
							<view v-if="isShow" class="m-btn"><button class="vec-btn" type="primary" @click="html2canvas.onClick">下载对比报告</button></view>
						</table-show>
					</view>
				</swiper-item>
				<swiper-item>
					<ava-compare id="ava_data"></ava-compare>
				</swiper-item>
			</swiper>
		</view>
		<view class="m-logo" v-if="!isShow">
			<image class="logo-b-img" src="../../../static/logo_bottom.png" mode="aspectFit"></image>
		</view>
	</view>
</template>

<script>
import uCharts from '@/components/u-charts/u-charts.js';
import tableShow from './table-show-school.vue';
import tableShowPhoto from './table-show-photo.vue';
import QSTabs from '@/components/QS-tabs/QS-tabs.vue';
import avaCompare from './AvaCompare.vue';
var canvaRadar = null;
var _self;
export default {
	components: { QSTabs, avaCompare, tableShow, tableShowPhoto },
	data() {
		return {
			isShow: true,
			current: 0,
			systemInfo: uni.getSystemInfoSync(),
			tabs: ['信息对比', '画像对比'],
			bodyList: [],
			radar: true,
			tableHeight: 0,
			tableWidth: '750upx',
			serverData: '',
			schooltype: '',
			sliderMax: '',
			xlcc: 1,
			chartsInfo: {
				cWidth: '',
				cHeight: '',
				tips: '',
				pixelRatio: 1,
				serverData: '',
				itemCount: 30, //x轴单屏数据密度
				sliderMax: 200
			},
			cate: {
				高职: ['生均教学设备值', '专任教师总数', '在校生总数', '专业设置数', '技术服务到款额'],
				中职: ['生均教学设备值', '专任教师总数', '在校生总数', '专业设置数', '当年巩固率']
			}
		};
	},
	computed: {
		scrollH() {
			let sys = uni.getSystemInfoSync();
			let winWidth = sys.windowWidth;
			let winrate = 750 / winWidth;
			let winHeight = parseInt(sys.windowHeight * winrate);
			return this.tableHeight + 'px';
		}
	},
	onLoad(e) {
		_self = this;
		this.chartsInfo.cWidth = uni.upx2px(750);
		this.chartsInfo.cHeight = uni.upx2px(700);
		this.tableHeight = uni.getSystemInfoSync().windowHeight + 'px';
		this.getData(e.ids);
	},
	methods: {
		toEmail(options) {
			// 显示按钮的同时将table高度扩高 68
			this.tableHeight = this.tableHeight + 68
			this.isShow = true;
			uni.saveImageToPhotosAlbum({
				filePath: options.target,
				success: function() {
					uni.showToast({
						title: '保存图片成功',
						mask: false,
						duration: 1500
					});
				}
			});
		},
		hideBtn() {
			uni.pageScrollTo({
			    scrollTop: 0,
			    duration: 0
			});
			// table高度减去底部按钮 68
			this.tableHeight = this.tableHeight - 68
			this.isShow = false;
		},
		async getData(sids) {
			this.bodyList = await this.$api.apiMyXxdb(this, sids);
			if (this.bodyList[0].schooltype != this.bodyList[1].schooltype) {
				this.radar = false;
			} else {
				this.schooltype = this.bodyList[0].schooltype;
				this.getServerData();
			}
			setTimeout(() => {
				// 获取表格数据的同时，计算表格的高度，以便截图时显示完整，使用nextTick可能会计算过快
				this.calcHeight();
			}, 100);
		},
		calcHeight(isTable=true) {
			const query = uni.createSelectorQuery().in(this);
			let domId = isTable ? '#table_data' : '#ava_data'
			query
				.select(domId)
				.boundingClientRect(data => {
					this.tableHeight = +data.height;
				})
				.exec();
		},
		change(index) {
			if(index == 0){
				this.calcHeight()
			}else if(index == 1){
				this.calcHeight(false)
			}
			this.current = index;
		},
		swiperChange({ detail: { current } }) {
			if(current == 0){
				this.calcHeight()
			}else if(current == 1){
				
				this.calcHeight(false)
			}
			this.current = current;
		},
		transition({ detail: { dx } }) {
			this.$refs.tabs.setDx(dx);
		},
		animationfinish({ detail: { current } }) {
			this.$refs.tabs.setFinishCurrent(current);
		},

		showRadar(canvasId, chartData) {
			canvaRadar = new uCharts({
				$this: _self,
				canvasId: canvasId,
				type: 'radar',
				fontSize: 11,
				xAxis: {
					rotateLabel: true
				},
				legend: {
					show: true,
					padding: 5,
					lineHeight: 11,
					margin: 0,
					position: 'top'
				},
				// legend:{show:true},
				background: '#FFFFFF',
				pixelRatio: _self.chartsInfo.pixelRatio,
				animation: true,
				dataLabel: true,
				categories: chartData.categories,
				series: chartData.series,
				width: _self.chartsInfo.cWidth * _self.chartsInfo.pixelRatio,
				height: _self.chartsInfo.cHeight * _self.chartsInfo.pixelRatio,
				extra: {
					radar: {
						max: 100 //雷达数值的最大值
					}
				}
			});
		},
		getServerData() {
			let categories = this.cate[this.schooltype];
			let sd = [];
			let k = new Array(this.bodyList.length).fill(0);
			for (let i of this.bodyList) {
				sd.push({
					name: i.schoolname,
					data: k
				});
			}
			/*   let series= [
            {
              name: "上海信息学校",
              data: [190, 210, 105, 21, 27]
            },
            {
              name: "天津第一商业学校",
              data: [190, 210, 105, 35, 27]
            },
            {
              name: "天津第一商业学校",
              data: [50, 40, 55, 80, 33]
            },
            {
              name: "天津第一商业学校",
              data: [70, 100, 30, 150, 80]
            }
      	] */
			let Radar = {};
			Radar.categories = categories;
			Radar.series = sd;
			console.log('Radar', Radar);
			this.showRadar('canvasRadar', Radar);
		},
		touchPie(e, id) {
			/* canvaRadar.showToolTip(e, {
        format: function(item) {
          return item.name + ":" + item.data;
        }
      }); */
		}
	}
};
</script>
<script module="html2canvas" lang="renderjs">
export default {
	mounted() {
		if (typeof window.html2canvas === 'function') {
		} else {
			const script = document.createElement('script')
			script.src = 'static/js/html2canvas.min.js'
			document.head.appendChild(script)
		}
	},
	methods: {
		onClick(event, ownerInstance) {
			ownerInstance.callMethod('hideBtn')
			// 加延迟防止按钮还未隐藏就被截图
			setTimeout(()=>{
				this.saveDomImage(html2canvas,document.getElementById('container'),+new Date()+'.png',ownerInstance)
			},300)
			
		},
		saveDomImage (html2Canvas, dom, fileName,ownerInstance) {
		            if (typeof html2Canvas == null)
		                throw Error("html2Canvas is not defined");
		            if (dom == null)
		                throw Error("saveDomImage param : dom is null");
		            if (fileName == null || fileName == "")
		                fileName = "untitled.png";
					html2Canvas(dom,{
						allowTaint:true,
						logging: false,
					}).then((canvas) => {
					        var dataUrl = canvas.toDataURL();
					        var b = new plus.nativeObj.Bitmap('bitblmap');
					        b.loadBase64Data(dataUrl, () => {
					            // bitmap绘制完毕
					            b.save("_doc/"+fileName, {
					                overwrite: true
					            }, (object) => {
					                //保存到相册
					                ownerInstance.callMethod('toEmail', {
					                    target: object.target,
					                    bitmap: b
					                })
					            }, () => {
									// 保存失败
					                uni.showToast({
					                    title: '保存图片失败',
					                    mask: false,
					                    icon: 'none',
					                    duration: 1500
					                });
					            });
					        })
					    })
		    }
	}
}
</script>
<style scoped lang="scss">
@import '../../indexIcon/majorDatabase/pkDetail.scss';
.m-btn {
	background: #ffffff;
	padding: 25upx 0;
	width: 750upx;
}
.m-logo{
	.logo-t-img{
		width: 750rpx;
		height: 240rpx;
	}
	.logo-b-img{
		width: 750rpx;
		height: 400rpx;
	}
}
</style>
