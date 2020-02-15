//index.js
const app = getApp()
var util = require('../../utils/util.js');
Page({
  data: {
    //../../images/blablabl.jpg
    avatarUrl: '../../images/user-unlogin.png',
    userInfo: {},
    logged: false,
    authorized:false,
    takeSession:false,
    noGroup:0,
    gender:1,
    username:'none',
    userOpenid:'qwert',
    grouplist: [{
      gid:'1287299719',
      avatarUrl:'../../images/user-unlogin.png',
      name: '校学生会',
      sum: '校会成立于1998年……',
      num:200
    },
    {
      gid:'108672146',
      avatarUrl: '../../images/user-unlogin.png',
      name:'小坏坏',
      sum:'坏坏成员每天至少发20张色图才能完成业绩',
      num:20
    }
    ]
  },

  //在此登录
  onLoad: function() {
    if (!wx.cloud) {
      wx.showToast({
        title: 'erro',
      })
      return
    }

    //先定义再setdata
    var userOpenid=this.data.userOpenid
    wx.cloud.callFunction({
      name:'login',
      success:res=>{
        this.setData({
        userOpenid:res.result.openid
      })
      //调取本地全局数据要加this
      console.log('userOpenid:',this.data.userOpenid)
      },
      fail:res=>{
      }
    })
    
    /*1. 用openid请求用户的加入社团信息
    *发送：pid
    *返回：flag（查询状态1有0无），grouplist（gid，gname，intro，num（人数），avatar（社团头像链接））
    */
    wx.request({
        url: 'http://st.titordong.cn/GetGroup_byPid?pid='+this.data.userOpenid,
        complete: (res) => {},
        fail: (res) => {
          this.setData({
            authorized:false
          })
        },
        success: (result) => {
          console.log('login data:',result)
          if(result.data.flag){
            this.setData({
              authorized:true,
              //设置用户头像昵称等信息
              //获取用户所加入群组信息
            })
            if(result.data.grouplist){
            this.setData({
              noGroup:0,
              grouplist:result.data.grouplist
            })
          }
            else
            this.setData({
              noGroup:1
            })
          }
            else
            this.setData({
              authorized:false
            })
        },
      })
},

//在此授权（入库）
authorize(res){

  for (let i = 0; i < this.data.grouplist.length; i++) {
    wx.downloadFile({
      url: 'https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJRfqR4B618pZEK7E1OlsWCn4iaWB0vWKtMJ0vdx4BCriaZ9jQiboTx0nloJuTPCVGqKywBgnkNjdO2g/132.jpg',
      complete: (res) => {},
      fail: (res) => {console.log('fail',res)},
   
      success: (result) => {
        console.log('success',result.tempFilePath[0])
      },
    })
  }


  console.log('res:',res)
  if (res.detail.userInfo){
   // 获取用户信息
    this.setData({
      username:res.detail.userInfo.nickName,
      gender:res.detail.userInfo.gender,
      avatarUrl:res.detail.userInfo.avatarUrl,
      authorized:1
    })
  //授权完成后直接登录
  wx.cloud.callFunction({
    name:'login',
    success:res=>{
      this.setData({
      userOpenid:res.result.openid
    })
    },
    fail:res=>{
      console.log('tfghdtf')
    }
  })
  /*2. 注册入库
  *发送 pid，pname，pgender，regtime
  *返回 flag（插入成功提示1成功0失败）
  */
 var time = util.formatTime(new Date())
  wx.request({
    url: 'http://st.titordong.cn/Register?pid='+this.data.userOpenid+'&&pname='+this.data.username+'&&regtime='+time+'&&pgender='+this.data.gender,
    complete: (res) => {console.log('complete')},
    fail: (res) => {
      console.log(res)
    },
    method: 'GET',
    success: (result) => {
      this.setData({
        noGroup:1
      })
      console.log('result',result)
      if(result.data.flag)
      wx.showToast({
        title: '授权成功！',
      })
      else
      wx.showToast({
        title: '授权失败',
        icon:'none'
      })
    }
  })
  /*3. 上传用户头像
  *发送：用户头像文件（pid.jpg）
  *返回：更新状态（1成功0失败）
   */
  wx.uploadFile({
    filePath: this.data.avatarUrl,
    name: this.data.userOpenid+'.jpg',
    url: 'www.baidu.com',
    complete: (res) => {},
    fail: (res) => {console.log(res)},
    success: (result) => {
      console.log(result)
    },
  })
}else{
wx.showToast({
  title: '尚未授权',
  icon:'none'
})
}
  },

toMyGroup:function(event){
    //跳转传值
    let i=event.currentTarget.dataset.index
    wx.navigateTo({
      url:'../group/group?gname='+this.data.grouplist[i].name+'&&gid='+this.data.grouplist[i].gid+'&&pid='+this.data.userOpenid+'&&avatar='+this.data.grouplist[i].avatarUrl
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
  /*4. 发送群相关信息搜索相关群
  *发送：ginfo
  *返回：grouplist（gid，gname，intro，num（人数），avatar（社团头像链接））
  */
  wx.request({
    url: 'url',
    complete: (res) => {},
    data: {
      ginfo:inputV
    },
    dataType: dataType,
    fail: (res) => {},
    header: header,
    method: method,
    responseType: responseType,
    success: (result) => {

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
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        const filePath = res.tempFilePaths[0]
        console.log(filePath)
      },
      fail: e => {
        console.error(e)
      }
    })
  },
  

submitgroup(e){
console.log(e)
}
// onGetOpenid: function() {
  //   // 调用云函数
  //   wx.cloud.callFunction({
  //     name: 'login',
  //     data: {},
  //     success: res => {
  //       console.log('[云函数] [login] user openid: ', res.result.openid)
  //       app.globalData.openid = res.result.openid
  //       wx.navigateTo({
  //         url: '../userConsole/userConsole',
  //       })
  //     },
  //     fail: err => {
  //       console.error('[云函数] [login] 调用失败', err)
  //       wx.navigateTo({
  //         url: '../deployFunctions/deployFunctions',
  //       })
  //     }
  //   })
  // },

  // // 上传图片
  // doUpload: function () {
  //   // 选择图片
  //   wx.chooseImage({
  //     count: 1,
  //     sizeType: ['compressed'],
  //     sourceType: ['album', 'camera'],
  //     success: function (res) {

  //       wx.showLoading({
  //         title: '上传中',
  //       })

  //       const filePath = res.tempFilePaths[0]
        
  //       // 上传图片
  //       const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
  //       wx.cloud.uploadFile({
  //         cloudPath,
  //         filePath,
  //         success: res => {
  //           console.log('[上传文件] 成功：', res)

  //           app.globalData.fileID = res.fileID
  //           app.globalData.cloudPath = cloudPath
  //           app.globalData.imagePath = filePath
            
  //           wx.navigateTo({
  //             url: '../storageConsole/storageConsole'
  //           })
  //         },
  //         fail: e => {
  //           console.error('[上传文件] 失败：', e)
  //           wx.showToast({
  //             icon: 'none',
  //             title: '上传失败',
  //           })
  //         },
  //         complete: () => {
  //           wx.hideLoading()
  //         }
  //       })

  //     },
  //     fail: e => {
  //       console.error(e)
  //     }
  //   })
  // },
})
