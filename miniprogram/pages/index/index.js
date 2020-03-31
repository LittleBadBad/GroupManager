//index.js
const app = getApp()
import { formatTime } from '../../utils/util.js';
Page({
  data: {
    //../../images/blablabl.jpg

    authdialog:0,
    userInfo: {},
    userOpenid:'',
    groupavatar:'../../images/2.jpg',
    grouplistsearch:[],
     grouplist: [//{
    //   gid:'1287299719',
    //   avatarUrl:'../../images/user-unlogin.png',
    //   name: '校学生会',
    //   sum: '校会成立于1998年……',
    //   num:200,
    //   joined:0
    // },
    // {
    //   gid:'108672146',
    //   avatarUrl: '../../images/user-unlogin.png',
    //   name:'小坏坏',
    //   sum:'坏坏成员每天至少发20张色图才能完成业绩',
    //   num:20,
    //   joined:0
    // }
    ],

    canvasImg:''

  },

  //在此登录
  onLoad: function() {
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    if (!wx.cloud) {
      wx.showToast({
        title: 'erro',
      })
      return
    }

},

onShow(){
  if(this.data.userOpenid)
    this.login(this.data.userOpenid)
},

onReady(){
  //先定义再setdata
  wx.cloud.callFunction({
  name:'login',
  success:res=>{
    this.setData({userOpenid:res.result.openid}) 
    //调取本地全局数据要加this
    console.log('userOpenid:',this.data.userOpenid)
    this.login(this.data.userOpenid)//请求登录数据
  },
  fail:res=>{console.log(res)}
})
},

toggleAuth(){
  wx.showToast({
    title: '前往个人界面继续授权'
  })
  this.setData({
    authdialog:0
  })
},

toMyGroup:function(event){
  let i=event.currentTarget.dataset.index
  //建立缓存
  // wx.setStorageSync('groupsum', this.data.grouplist[i].Intro)
  // wx.setStorageSync('groupavatar', this.data.grouplist[i].Avatar)

    //跳转传值
    wx.navigateTo({
      url:'../group/group',
      success:res=>{
        res.eventChannel.emit('getData',{
          pid:this.data.userOpenid,
          group:this.data.grouplist[i]
        })
      }

    })
  },

  //群搜索模块
 groupSearch(){
    this.setData({
      tapsearch:1
    })
  },

toggleSearch(){
    this.setData({
      tapsearch:0
    })
  },

showInput: function () {
    this.setData({
        inputShowed: true
    });
},

hideInput: function () {
  this.setData({
      inputVal: "",
      inputShowed: false
  });
},
clearInput: function () {
  this.setData({
      inputVal: ""
  });
},

inputTyping: function (e) {
  let inputV=e.detail.value
  this.setData({
    inputVal:inputV
  })
  //群搜索请求
  wx.request({
    url: app.globalData.serverurl + 'SearchTeam?ginfo='+inputV,
    complete: (res) => {},
    fail: (res) => {},
    success: result => {
      //console.log('搜索结果',result)
      //取群交集 O(n^2) *待优化*
      var grouplistsearch=new Array()
      grouplistsearch=result.data.grouplist
      for (let i = 0; i < grouplistsearch.length; i++) {
        let group=grouplistsearch[i]
        for (let j = 0; j < this.data.grouplist.length; j++) {
          if(group.gid == this.data.grouplist[j].gid)
            grouplistsearch[i].joined=true
        }
      }
      this.setData({
        grouplistsearch:grouplistsearch
      })
    },
  })
},

//申请加入
joinReq(e){
  console.log(e)
  wx.showToast({
    title: '加入中',
    icon:'loading'
  })
  var gid=this.data.grouplistsearch[e.currentTarget.id].gid
  var time = formatTime(new Date())
  wx.request({
    url: app.globalData.serverurl+'Join_Team',
    data:{
      pid:this.data.userOpenid,
      gid:gid,
      jointime:time
    },
    success: result => {
      console.log('join',result)
      var grouplist=this.data.grouplist
      let i=grouplist.length
      grouplist[i]=new Object()
      grouplist[i]=this.data.grouplistsearch[e.currentTarget.id]
      wx.downloadFile({
        url:grouplist[i].avatar,
        complete: (res) => {},
        fail: (res) => {},
        success: res => {
          grouplist[i].avatar=res.tempFilePath
          grouplist[i].done=true
          wx.showToast({
            title: '加入成功',
            icon:'success'
          })
          this.setData({
            tapsearch: 0,
            grouplist:grouplist
          })
        },
      })
    },
  })
},

//群创建模块
groupCreate(){
  this.setData({
    tapcreate:1
  })
},

toggleCreate(){
  this.setData({
    tapcreate:0
  })
},

  // 上传图片
doUpload: function () {
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
        url: '../upload/upload?src='+src,
        success:res=>{
          wx.hideLoading()
        }
      })
    }
  })
},

//提交群信息
subGroup(e){
console.log(e)
var time = formatTime(new Date())
wx.showLoading({
  title: '提交社团信息',
  mask: true,
})
wx.request({
  url: app.globalData.serverurl+'CrtTeam?pid='+this.data.userOpenid+'&&gname='+e.detail.value.gname+'&&regtime='+time+'&&intro='+e.detail.value.gintro+'&&fund='+e.detail.value.fund,
  complete: (res) => {},
  fail: (res) => {},
  success:result=> {
    wx.hideLoading()
    wx.showLoading({
      title: '上传社团头像',
      mask: true,
    })
    var gid=result.data.gid
    //上传群头像
    wx.uploadFile({
      filePath: this.data.groupavatar,
      name: 'cover',
      url: app.globalData.serverurl+'update_team_avatar',
      complete: (res) => {},
      fail: (res) => {},
      formData: {
        gid:gid,
      },
      header: {
        'content-type': 'multipart/form-data'
      },
      success:result=> {
        wx.hideLoading()
        console.log('uploadresult',result)
        wx.showToast({
          title: '创建成功',
          icon:'success'
        })
        var filePath=this.data.groupavatar
        //创建成功后刷新界面
        var grouplist=this.data.grouplist
        let i=grouplist.length
        grouplist[i]=new Object()
        grouplist[i].name=e.detail.value.gname
        grouplist[i].avatarUrl=result.data.url
        grouplist[i].avatarcache=filePath
        grouplist[i].avatarstatus=1
        grouplist[i].intro=e.detail.value.gintro
        grouplist[i].status='主席'
        grouplist[i].num=1
        grouplist[i].auth='1111111'
        grouplist[i].gid=gid
        grouplist[i].done=1
       this.setData({
        tapcreate:0,
        grouplist:grouplist
      })
      },
    })
  },
})
},

//自定义函数
login(pid){
    //登录请求
    wx.request({
      url: app.globalData.serverurl+'Login?pid='+pid,
      complete:res=>{wx.hideLoading()},
      fail:res=>{
        wx.showToast({
          title: '登录失败，请重启小程序',
          duration:2000,
          icon:'none'
        })
      },
      success: logres => {
      console.log('login data:',logres)
      if(logres.data.flag){
          console.log('已入库')
          var avatarUrl=logres.data.avatarUrl
          //下载用户头像
          wx.downloadFile({
            url: logres.data.avatarUrl,
            success: (result) => {
              avatarUrl=result.tempFilePath
              //1.设置全局变量
              var userinfo=new Object()
              userinfo.name=logres.data.name
              userinfo.avatarUrl=avatarUrl
              app.globalData.userinfo=userinfo
              //2.设置本地变量
              var grouplist=logres.data.grouplist
              app.globalData.grouplist=grouplist

              if(!this.data.grouplist.length){
                this.data.grouplist=new Array(grouplist.length)
                for (let index = 0; index < this.data.grouplist.length; index++)
                  this.data.grouplist[index]=new Object()
              }
              var that=this//0.3秒后执行setData
              setTimeout(function(){that.setData({grouplist:grouplist})},300+20*grouplist.length)
              for (let i = 0; i < grouplist.length; i++) {//下载群头像
                var starttime=new Date().getTime()
                //console.log(this.data.grouplist[i].avatarcache)
                if(!this.data.grouplist[i].avatarcache||this.data.grouplist[i].avatarUrl!=grouplist[i].avatarUrl){//若没有缓存或头像已更改则下载
                  console.log('下载中')
                  wx.downloadFile({
                    url: grouplist[i].avatar,
                    complete: (res) => {},
                    fail: (res) => {
                      grouplist[i].avatarstatus=-1
                      console.log(res)
                      this.setData({
                        grouplist:grouplist,
                      })
                    },
                    success: (result) => {
                      console.log('已完成',i)
                      var endtime=new Date().getTime()
                      var time=(endtime-starttime)/1000
                      grouplist[i].avatarstatus=1//加载完成
                      grouplist[i].avatarcache=result.tempFilePath
                      if(time > 0.3)//若加载时间大于0.3秒则重新setData
                        this.setData({
                          grouplist:grouplist
                        })
                    },
                  })
                }
                else{
                  grouplist[i].avatarcache=this.data.grouplist[i].avatarcache
                  grouplist[i].avatarstatus=1
                }
              }
            },
          })
      }
      else{
        console.log('未入库')
        this.setData({grouplist:{}})
        wx.showToast({
          title: '前往个人页面授权'
        })
        }
      },
    })
  },

//压缩头像
//独立成模块失败，使用随时复制
compressImg(imgurl){ 
  wx.getImageInfo({
      src: imgurl,
      success: res =>{
        //---------利用canvas压缩图片--------------
        var ratio = 2;
        var canvasWidth = res.width //图片原始长宽
        var canvasHeight = res.height
        while (canvasWidth > 132 || canvasHeight > 132){// 保证宽高在132以内
            canvasWidth = Math.trunc(res.width / ratio)
            canvasHeight = Math.trunc(res.height / ratio)
            ratio++;
        }
        //----------绘制图形并取出图片路径--------------
        var ctx = wx.createCanvasContext('canvas_compress')
        ctx.drawImage(res.path, 0, 0, canvasWidth, canvasHeight)
        ctx.draw(false, setTimeout(function(){
          console.log(that.data.groupavatar)
             wx.canvasToTempFilePath({
                 canvasId: 'canvas_compress',
                 destWidth: canvasWidth,
                 destHeight: canvasHeight,
                 success: res=>{
                    console.log('canvasres',res.tempFilePath)//最终图片路径
                 },
                 fail: res=>{
                     console.log('canvas',res)
                }
            })
        },100))//留一定的时间绘制canvas
      },
      fail: res=>{
      console.log('getImageInfo',res.errMsg)
      },
    })
},

// blabla(){
//   wx.uploadFile({
//     filePath: imgnew[0],
//     name: 'name',
//     url: 'url',
//     complete: (res) => {},
//     fail: (res) => {},
//     formData: {
//       imglist:['1.jpg','2.jpg','3.jpg']
//     },
//     header: header,
//     success: (result) => {
//       if(result.data.flag){//第一张上传成功
//         for (let i = 0; i < imgnew.length; i++)
//           wx.uploadFile({
//             filePath: imgrest[i+1],
//             name: 'name',
//             url: 'url',
//             complete: (res) => {},
//             fail: (res) => {},
//             formData: '',
//             header: header,
//             success: (result) => {},
//           })
//       }
//     },
//   })
// }
})
