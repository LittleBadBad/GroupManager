// pages/myinfo/myinfo.js
const app=getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userinfo:{},

        count:0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that=this
        const eventChannel = this.getOpenerEventChannel()
        eventChannel.on('getData',function(data){
          wx.setNavigationBarTitle({
            title: '个人信息',
          })
          that.setData({userinfo:data.userinfo,count:1})
        })
    },

    onShow(){
        if(this.data.count)
            this.setData({userinfo:app.globalData.userinfo})
    },

    chgAvatar(){
        wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success (res) {
            const src = res.tempFilePaths[0]
            wx.showLoading({
            mask: true,
            title:'加载中'
            })
            wx.navigateTo({
            url: '../upload/upload?src='+src+'&&from=me',
            success:res=>{
                wx.hideLoading()
            }
            })
        }
        })
    }
})