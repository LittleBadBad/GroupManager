// pages/me/me.js
var app=getApp()
import { formatTime } from '../../utils/util.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    backgroundimg:'../../images/4.jpg',
    userinfo:{},
    username:'',
    infocards:['个人信息','设置','留言']
  },

  onLoad: function (options) {

  },

  onShow(){
    var that=this
    setTimeout(function(){
      that.setData({
        userinfo:app.globalData.userinfo
      })
    },300)
  },

  onReady: function () {
    
  },

//在此授权（入库）
authorize(e){
  console.log('res:',e)
  if (e.detail.userInfo){
  //授权完成后直接登录
  wx.cloud.callFunction({
    name:'login',
    success:res=>{
      var userinfo=new Object()
      userinfo.name=e.detail.userInfo.nickName
      userinfo.avatarUrl=e.detail.userInfo.avatarUrl
      userinfo.gender=e.detail.userInfo.gender
      userinfo.openid=res.result.openid
      //2. 注册入库
      var time = formatTime(new Date())
      wx.request({
        url: 'http://st.titordong.cn/Register',
        method: 'GET',
        data:{
          pid:userinfo.openid,
          pname:userinfo.name,
          regtime:time,
          pgender:userinfo.gender
        },
        success:result => {
          //console.log('signin result',userinfo)
          if(result.data.flag){
            wx.showToast({
              title: '上传信息中',
              icon:'loading'
            })
            //上传用户头像
            wx.downloadFile({//下载用户现有微信头像
              url: userinfo.avatarUrl,
              success:result => {
                console.log('download success',userinfo)
                var path=result.tempFilePath
                wx.uploadFile({
                  filePath: path,
                  name: 'cover',
                  url: 'http://st.titordong.cn/update_me_avatar',
                  header: {
                    'content-type': 'multipart/form-data'
                  },
                  formData: {
                    pid:userinfo.openid
                  },
                  fail:res=>{console.log('uploadfail',res.errMsg)},
                  success: result => {
                    if(result.statusCode==200){
                      userinfo.avatarUrl = path
                      this.setData({
                        userinfo:userinfo,
                        username:userinfo.name
                      })
                      app.globalData.userinfo = userinfo
                      wx.showToast({
                        title: '授权成功！',
                        icon:'success'
                      })
                    }
                    //console.log('upload success',userinfo.openid)
                  },
                })
              },
            })
          }else
          wx.showToast({
            title: '授权失败',
            icon:'none'
          })
        }
      })
    },
  })
}else{
wx.showToast({
  title: '尚未授权',
  icon:'none'
})
}
  },
})