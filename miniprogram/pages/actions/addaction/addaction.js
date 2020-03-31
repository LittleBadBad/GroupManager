const app = getApp()
import { formatDate } from '../../../utils/util';
// pages/actions/addaction/addaction.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    useropenid:'',
    mygroup:'',
    mydivlist:'',
    namelist:[],

    nameinputing:0,
    
    unitlist:['社团','公关部','人事部'],
    unit:'',
    selecting:0,

    ptnrselecting:0,
    data_name:['二狗gggggg','妍妍','狗坏','二狗','妍妍','狗坏','二狗','妍妍','狗坏','二狗','妍妍','狗坏','二狗','妍妍','狗坏','二ggggg狗','妍妍','狗ggggggg坏','二狗','妍妍','狗坏','二狗','妍妍','狗坏','二狗','妍妍','狗坏','二狗','妍妍','狗坏','二狗','妍妍','狗坏','二狗','妍妍','狗坏','二狗','妍妍','狗坏','二狗','妍妍','狗坏','二狗','妍妍gggg','狗坏',],
    
    inputVal:'',

    files:[],
    limit:9,

    action:{
      date:formatDate(new Date())
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('getData',function(data){
      var mydivlist=data.mydivlist
      var unitlist=new Array()
      unitlist[0]="社团"
      for (let i in mydivlist)
        unitlist[i+1]=mydivlist.name
      that.setData({
        useropenid:data.useropenid,
        mygroup:data.mygroup,
        mydivlist:data.mydivlist,
        namelist:data.memberlist,

        unitlist:unitlist
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // var data_name=this.data.data_name
    // var namelist=new Array()
    // for (let i = 0; i < data_name.length; i++) {
    //   namelist[i]=new Object()
    //   namelist[i].name=data_name[i]
    //   namelist[i].clicked=0
    // }
    // namelist[0].clicked=1
    // this.setData({namelist:namelist})
  },


  // nameFocus(e){
  //   this.setData({
  //     nameinputing:1
  //   })
  // },

  // nameBlur(e){
  //   //console.log(e)
  //   if(e.detail.value=='')
  //     this.setData({
  //       nameinputing:0
  //     })
  // },

  getName(e){
    //console.log(e)
    var name=e.detail.value
    this.data.action.name=name
  },

  getIntro(e){
    var intro=e.detail.value
    this.data.action.intro=intro
  },

  chgUnit(e){
    var i=e.detail.value
    var unitlist=this.data.unitlist
    var action=this.data.action
    var mygroup=this.data.mygroup
    var mydivlist=this.data.mydivlist
    if(i == 0){
      action.type=1
      action.id=mygroup.gid
    }else{
      action.type=0
      action.id=mydivlist[i-1].id
    }
    this.setData({
      selecting:1,
      unit:unitlist[i],
      action:action
    })
    
  },

  chageDate(e){
    //console.log(e)
    var action=this.data.action
    var date=e.detail.value
    action.date=date
    this.setData({
      action:action,
    })
  },

  inputTest(e){
    console.log(e)   
  },

  slctParticipants(){
    console.log(this.data.namelist)
    this.data.namelist[0].clicked=1
    this.setData({ptnrselecting:1,namelist:this.data.namelist})
  },

  tabName(e){
    var i=e.currentTarget.dataset.index
    var namelist=this.data.namelist
    namelist[i].clicked=!namelist[i].clicked
    this.setData({namelist:namelist})
  },

  confirmInput(e){
    console.log(e)
    var newname=e.detail.value
    var namelist=this.data.namelist
    var l=namelist.length
    namelist[l]=new Object()
    namelist[l].name=newname
    namelist[l].clicked=1
    namelist[l].hide=1
    this.setData({namelist:namelist,inputVal:'',ptnrselecting:1})
    this.addMember(namelist)
  },

  cancelChoose(e){
    var i=e.currentTarget.dataset.index
    var namelist=this.data.namelist
    namelist[i].clicked=!namelist[i].clicked
    this.setData({namelist:namelist})
    console.log(namelist)
    this.addMember(namelist)
  },

  chooseImage: function (e) {
    var that = this;
    var files=this.data.files
    var limit=this.data.limit
    wx.chooseImage({//res1选择
        count:limit-files.length,
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success:res1=> {
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            var files=res1.tempFilePaths
            wx.showLoading({
              title: '加载中',
              mask: true,
            })

            for(let index in files)
              wx.compressImage({
                src: files[index],
                complete: (res) => {
                  wx.hideLoading()
                },
                fail: (res) => {},
                quality: 1,
                success: (result) => {
                  that.setData({
                    files: that.data.files.concat(result.tempFilePath)
                  }); 
                },
              })
              // wx.getImageInfo({//res2获取信息
              //   src: files[index],
              //   success: res2 =>{
              //     //---------利用canvas压缩图片--------------
              //     var ratio = 2;
              //     var canvasWidth = res2.width //图片原始长宽
              //     var canvasHeight = res2.height
              //     while (canvasWidth > 200 || canvasHeight > 200){// 保证宽高在200以内
              //         canvasWidth = Math.trunc(res2.width / ratio)
              //         canvasHeight = Math.trunc(res2.height / ratio)
              //         ratio++
              //     }
              //     console.log('files[index]',files[index])
              //     //----------绘制图形并取出图片路径--------------
              //     var ctx = wx.createCanvasContext('compress',that)
              //     console.log(ctx)
              //     ctx.drawImage(res2.path, 0, 0, canvasWidth, canvasHeight)
              //     ctx.draw(false,setTimeout(function(){
              //         wx.canvasToTempFilePath({//res3获取压缩后路径
              //             canvasId: 'compress',
              //             width:canvasWidth,//规定好canvas宽和长，否则直接打印保存图片会横向压缩
              //             height:canvasHeight,
              //             destWidth: canvasWidth,
              //             destHeight: canvasHeight,
              //             complete:res3=>{
              //               if(index==files.length-1)
              //                 wx.hideLoading()
              //             },
              //             success: res3=>{
              //                 console.log('canvasres',res3.tempFilePath)//最终图片路径
              //                 that.setData({
              //                   files: that.data.files.concat(res3.tempFilePath)
              //                 });
              //             },
              //             fail: res3=>{
              //               wx.showToast({
              //                 title: '图片获取失败',
              //                 duration: 2000,
              //                 icon:'none',
              //                 mask: true,
              //               })
              //               console.log('canvas',res3)
              //             }
              //         },that)
              //     },100))//留一定的时间绘制canvas
              //   },
              //   fail: res2=>{
              //   console.log('getImageInfo',res2.errMsg)
              //   },
              // })
        }
    })
  },

  previewImage: function(e){
    var i=e.currentTarget.dataset.index
    var files=this.data.files
   //console.log(files)
      wx.previewImage({
          current: files[i], // 当前显示图片的http链接
          urls: files // 需要预览的图片http链接列表
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

  submit(){
    var action=this.data.action
    var files=this.data.files
    var namelist=this.data.namelist
    console.log(action)
    this.addMember(namelist)
    if(!action.name)
      wx.showModal({
        confirmText: '确定',
        content: '请填写活动名',
        showCancel: false,
      })
    else if(!action.id)
      wx.showModal({
        confirmText: '确定',
        content: '请填写活动类型',
        showCancel: false,
      })
    else if(!action.people)
      wx.showModal({
        confirmText: '确定',
        content: '请选择参与人',
        showCancel: false,
      })
    else{
      wx.showLoading({
        title: '上传中',
      })
      wx.request({
        url: app.globalData.serverurl+'AddAction',
        complete: (res) => {},
        data: action,
        success: (result1) => {
          console.log(result1)
          wx.hideLoading()
          var n=0
          for (let i in files) {
            wx.showLoading({
              title: '上传第'+i+'张图片',
              mask:true
            })
            console.log(i)
            wx.uploadFile({
              filePath: files[i],
              name: 'cover',
              url: app.globalData.serverurl+'AddActImg',
              complete: (res) => {console.log(res)},
              fail: (res) => {console.log(res)},
              formData: {
                addr:result1.data.addr
              },
              header: {
                'content-type': 'multipart/form-data'
              },
              success: (result2) => {
                n++
              },
            })
          }
          var listener = setInterval(() => {
            if(n==files.length)
              wx.navigateBack({
                complete: (res) => {wx.hideLoading()},
                delta: 0,
                fail: (res) => {},
                success: (res) => {
                  clearInterval(listener)
                  wx.showToast({
                    title: '上传成功',
                    duration: 2000,
                    icon: 'success',
                    mask: true,
                  })
                },
              })
          }, 100);
        },
      })
    }
  },

  addMember(namelist){
    var people=new Array()
    var n=0
    for (let i in namelist)
      namelist[i].clicked ? people[n++]=namelist[i].name:''
    this.data.action.people=people
    console.log(people)
  }
})