//index.js
const app = getApp()
import { formatTime } from '../../utils/util.js';
Page({
  data: {
    //../../images/blablabl.jpg

    authdialog:0,
    userOpenid:'',
    groupavatar:'../../images/2.jpg',
    
    grouplistsearch:[],
    inputVal:'',

    grouplist: [],

    canvasImg:'',

    signed:0,
    count:0

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
        duration:2000
      })
      return
    }
    //先定义再setdata
    wx.cloud.callFunction({
      name:'login',
      success:res=>{
        this.setData({userOpenid:res.result.openid})
        app.globalData.userinfo.userOpenid=res.result.openid
        this.login(this.data.userOpenid)//请求登录数据
      },
      fail:res=>{
        wx.showToast({
          title: res.errMsg,
          duration: 2000,
          mask: true,
        })
      }
    })
},

onShow(){
  if(this.data.count)
    this.login(this.data.userOpenid)
},

onReady(){

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
      tapsearch:0,
      inputVal:''
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
  var grouplistsearch=this.data.grouplistsearch
  var grouplist=this.data.grouplist
  var i=e.currentTarget.dataset.i
  var userOpenid=this.data.userOpenid
  var time = formatTime(new Date())
  var gid=grouplistsearch[i].gid

  wx.showLoading({
    title: '加入中',
    mask: true,
  })
  wx.request({
    url: app.globalData.serverurl+'Join_Team',
    data:{
      pid:userOpenid,
      gid:gid,
      jointime:time
    },
    complete:res=>{wx.hideLoading()},
    success: result => {
      console.log('join',result)
      grouplist=grouplist.concat(grouplistsearch[i])
      wx.downloadFile({
        url:grouplist[i].avatar,
        complete: (res) => {},
        fail: (res) => {},
        success: res => {
          grouplist[i].avatarcache=res.tempFilePath
          grouplist[i].avatarstatus=1
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
    groupavatar:'../../images/2.jpg',
    tapcreate:1,
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
        url: '../upload/upload?src='+src+'&&from=group',
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
var userOpenid=this.data.userOpenid
var gname=e.detail.value.gname
var gintro=e.detail.value.gintro
var fund=e.detail.value.fund
var groupavatar=this.data.groupavatar
var grouplist=this.data.grouplist
var time = formatTime(new Date())
wx.showLoading({
  title: '提交社团信息',
  mask: true,
})
wx.request({
  url: app.globalData.serverurl+'CrtTeam',
  data:{
    pid:userOpenid,
    gname:gname,
    regtime:time,
    intro:gintro,
    fund:fund
  },
  complete: (res) => {wx.hideLoading()},
  fail: (res) => {},
  success:result=> {
    wx.showLoading({
      title: '上传社团头像',
      mask: true,
    })
    var gid=result.data.gid
    //上传群头像
    wx.uploadFile({
      filePath: groupavatar,
      name: 'cover',
      url: app.globalData.serverurl+'update_team_avatar',
      complete: (res) => {wx.hideLoading()},
      fail: (res) => {},
      formData: {
        gid:gid,
      },
      header: {
        'content-type': 'multipart/form-data'
      },
      success:result=> {
        console.log('uploadresult',result)
        wx.showLoading({
          title: '同步中',
          mask: true,
        })
        //创建成功后刷新界面
        var groupnew={}
        groupnew.name=e.detail.value.gname
        groupnew.avatarUrl=result.data.url
        groupnew.avatarcache=groupavatar
        groupnew.avatarstatus=1
        groupnew.intro=e.detail.value.gintro
        groupnew.status='主席'
        groupnew.num=1
        groupnew.auth='1111111'
        groupnew.gid=gid
        grouplist=grouplist.concat(groupnew)
        this.setData({
          tapcreate:0,
          grouplist:grouplist
        })
        wx.hideLoading()
        wx.showToast({
          title: '创建成功',
          duration: 2000,
          mask: true,
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
          wx.showLoading({
            title: '处理中',
            mask: true,})
          console.log('已入库')
          this.setData({signed:1})
          var avatarUrl=logres.data.avatarUrl
          app.globalData.userinfo.name=logres.data.name
          app.globalData.userinfo.avatarUrl=avatarUrl
          app.globalData.userinfo.signed=1
          //下载用户头像
          wx.downloadFile({
            url: avatarUrl,
            success: (result) => {
              app.globalData.userinfo.avatarUrl=result.tempFilePath
            },
          })
          var grouplist=logres.data.grouplist
          app.globalData.grouplist=grouplist
          var grouplistold=this.data.grouplist
          if(!grouplistold.length){//若本地grouplist为空则新建list
            for (let i in grouplist)
              grouplistold[i]={avatarcache:'',}
          }
          var that=this//0.3秒后执行setData
          setTimeout(function(){that.setData({grouplist:grouplist})},300+20*grouplist.length)
          for (let i in grouplist) {//下载群头像
            var starttime=new Date().getTime()
            if(!grouplistold[i].avatarcache||grouplistold[i].avatarUrl!=grouplist[i].avatarUrl){//若没有缓存或头像已更改则下载
              console.log('下载中')
              wx.downloadFile({
                url: grouplist[i].avatar,
                complete: (res) => {},
                fail: (res) => {
                  grouplist[i].avatarstatus=-1
                  //console.log(res)
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
              grouplist[i].avatarcache=grouplistold[i].avatarcache
              grouplist[i].avatarstatus=1
            }
          }
          wx.hideLoading()
      }else{
        console.log('未入库')
        this.setData({grouplist:[],signed:0})
        wx.showToast({
          title: '前往个人页面授权',
          icon:'none',
          duration:2000,
        })
        }
      this.data.count++
      },
    })
  },

})
