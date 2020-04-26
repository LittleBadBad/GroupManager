import WeCropper from '../we-cropper/we-cropper.js'

const app = getApp()
const config = app.globalData.config
const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight - 50

Page({
  data: {
    cropperOpt: {
      id: 'cropper',
      targetId: 'targetCropper',
      pixelRatio: device.pixelRatio,
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: (width - 300) / 2,
        y: (height - 300) / 2,
        width: 300,
        height: 300
      },
      boundStyle: {
        color: config.getThemeColor(),
        mask: 'rgba(0,0,0,0.8)',
        lineWidth: 1
      },
    },
    from:''
  },
  touchStart (e) {
    this.cropper.touchStart(e)
  },
  touchMove (e) {
    this.cropper.touchMove(e)
  },
  touchEnd (e) {
    this.cropper.touchEnd(e)
  },
  getCropperImage () {
    var that=this
    this.cropper.getCropperImage(function (path, err) {
      if (err) {
        wx.showModal({
          title: '温馨提示',
          content: err.message
        })
      } else {
        //先压缩
        wx.compressImage({
          src: path,
          complete: (res) => {},
          fail: (res) => {},
          quality: 1,
          success: (result1) => {
            console.log(that.data.from)
            let pages=getCurrentPages();
            let prevPage=pages[pages.length-2]
            if(that.data.from=='group'){
              prevPage.setData({
                groupavatar:result1.tempFilePath
              })
              wx.navigateBack({
                delta: 1,
              })
            }else if(that.data.from=='me'){
              var userinfo=app.globalData.userinfo
              wx.uploadFile({
                filePath: result1.tempFilePath,
                name: 'cover',
                url: app.globalData.serverurl+'update_me_avatar',
                header: {
                  'content-type': 'multipart/form-data'
                },
                formData: {
                  pid:userinfo.userOpenid
                },
                complete:res=>{wx.hideLoading()},
                fail:res=>{
                  wx.showToast({
                    title: res.errMsg,
                    duration: 2000,
                    mask: true,
                  })
                },
                success: result => {
                  if(result.statusCode==200){
                    console.log(result)
                    app.globalData.userinfo.avatarUrl = result1.tempFilePath
                    wx.showToast({
                      title: '修改成功！',
                      icon:'success'
                    })
                    wx.navigateBack({
                      delta: 1,
                    })
                  }
                },
              })
            }
          },
        })
        // var that=this
        // console.log(this)
        // wx.getImageInfo({
        //   src: path,
        //   success: res =>{
        //     //---------利用canvas压缩图片--------------
        //     // var ratio = 2;
        //     var canvasWidth
        //     var canvasHeight
        //     if(res.width>132)
        //       canvasWidth =canvasHeight = 132 //图片原始长宽
        //     else
        //       canvasWidth =canvasHeight=res.width

        //     var ctx = wx.createCanvasContext('canvas',that)
        //     ctx.drawImage(res.path, 0, 0, canvasWidth, canvasHeight)
        //     ctx.draw(false, setTimeout(function(){
        //          wx.canvasToTempFilePath({
        //              canvasId: 'canvas',
        //              width:canvasWidth,//规定好canvas宽和长，否则直接打印保存图片会横向压缩
        //              height:canvasHeight,
        //              destWidth: canvasWidth,
        //              destHeight: canvasHeight,
        //              success: res=>{
        //                 console.log('canvasres',res.tempFilePath)//最终图片路径
        //                 let pages=getCurrentPages();
        //                 let prevPage=pages[pages.length-2]
        //                 prevPage.setData({
        //                   groupavatar:res.tempFilePath
        //                 })
        //                 wx.navigateBack({
        //                   delta: 1
        //                 })
        //              },
        //              fail: res=>{
        //                  console.log('canvas',res)
        //             }
        //         },that)
        //     },100))//留一定的时间绘制canvas
        //   },
        //   fail: res=>{
        //   console.log('getImageInfo',res.errMsg)
        //   },
        // })
        // wx.previewImage({
        //   current: '', // 当前显示图片的 http 链接
        //   urls: [path] // 需要预览的图片 http 链接列表
        // })
      }
    })
  },
  uploadTap () {
    const self = this

    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success (res) {
        const src = res.tempFilePaths[0]
        //  获取裁剪图片资源后，给data添加src属性及其值

        self.cropper.pushOrign(src)
      }
    })
  },
  onLoad (option) {
    const { cropperOpt } = this.data
    cropperOpt.boundStyle.color = config.getThemeColor()
    this.setData({ cropperOpt })
    if (option.src) {
      this.data.from=option.from
      cropperOpt.src = option.src
      this.cropper = new WeCropper(cropperOpt)
        .on('ready', (ctx) => {
          //console.log(`wecropper is ready for work!`)
        })
        .on('beforeImageLoad', (ctx) => {
          //console.log(`before picture loaded, i can do something`)
          //console.log(`current canvas context:`, ctx)
          wx.showToast({
            title: '上传中',
            icon: 'loading',
            duration: 20000
          })
        })
        .on('imageLoad', (ctx) => {
          //console.log(`picture loaded`)
          //console.log(`current canvas context:`, ctx)
          wx.hideToast()
        })
        .on('beforeDraw', (ctx, instance) => {
          //console.log(`before canvas draw,i can do something`)
          //console.log(`current canvas context:`, ctx)
        })
    }
  }
})
