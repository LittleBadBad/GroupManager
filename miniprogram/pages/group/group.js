// pages/group/group.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ischairman:0,
    userOpenid:'',
    groupid:'',
    groupsum:'',
    ischairman:false,
    avatarUrl:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      userOpenid:options.pid,
      groupid:options.gid,
      avatarUrl:options.avatar
    })
    wx.setNavigationBarTitle({
      title: options.gname,
    })

    /*5. 发送gid和pid请求此人在群中的身份和群简介
    *发送：pid，gid
    *返回：status（此人在群中的身份），intro（群简介）
    */
    wx.request({
      url: 'url',
      complete: (res) => {},
      data: {
        gid:this.data.groupid,
        pid:this.data.userOpenid
      },
      fail: (res) => {},
      method: 'GET',
      success: (result) => {
        //在此根据身份决定是否显示右上角解散按钮
      },
    })
  },

})