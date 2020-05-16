// pages/devices/adddevice/adddevice.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        cells:[
            {
                name:'类型',
                placeholder:'点击输入',
                picker:['话筒','帐篷','桌子','凳子','音响','话筒架','抽奖箱','相机'],
            },
            {
                name:'可用个数',
                placeholder:'点击输入'
            },
            {
                name:'备注/规格',
                placeholder:'点击输入'
            },
            {
                name:'存防地点',
                placeholder:'点击输入'
            },
        ],
        variable:[],
        limit:9,
        files:['../../../images/1.jpg','../../../images/2.jpg','../../../images/3.jpg','../../../images/4.jpg'],
        newdevice:{

        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    chooseImage: function (e) {
        var that = this
        var limit=this.data.limit
        var files=this.data.files
        wx.chooseImage({
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            count:limit-files.length,
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片

                that.setData({
                    files: files.concat(res.tempFilePaths)
                });
            }
        })
    },

    previewImage: function(e){
        wx.previewImage({
            current: e.currentTarget.id, // 当前显示图片的http链接
            urls: this.data.files // 需要预览的图片http链接列表
        })
    },

    cancelUpload(e){
        var i=e.currentTarget.dataset.index
        var files=this.data.files
        var filesnew=new Array()
        var n=0
        for (let j in files) 
          if(j!=i)
            filesnew[n++]=files[j]
        this.setData({files:filesnew})
      },
    
})