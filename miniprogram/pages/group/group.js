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
    myauth:'',
    avatarUrl:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('getData',function(data){
      wx.setNavigationBarTitle({
        title: data.group.name,
      })
      that.setData({
        userOpenid:data.pid,
        groupid:data.group.gid,
        myauth:data.group.auth,
        groupsum:data.group.intro,
        avatarUrl:data.group.avatar
      })
      if(data.group.status=='主席')
        that.setData({
          ischairman:1
        })
    })
    console.log(this.data)
  },

  toMembers(){
    var url='../members/groupMember/groupMember?gid='+this.data.groupid+'&&pid='+this.data.userOpenid+'&&ischairman='+this.data.ischairman+'&&auth='+this.data.myauth
    wx.navigateTo({
      /*页面跳转：打 ‘../’即可查看目录结构*/
      url:url,
      complete: (res) => {},
      fail: (res) => {},
      success: (result) => {
        console.log(url)
      },
    })
  },

  dismiss(){
    wx.showModal({
      cancelColor: 'green',
      cancelText: '我再想想',
      complete: (res) => {
        console.log(res)
      },
      confirmColor: 'red',
      confirmText: '残忍解散',
      content: '确认解散你的群？',
      fail: (res) => {},
      showCancel: true,
      success: (result) => {
        /*发送群id更改群的运行/解散信息
        *发送：gid
        *返回：flag（解散成功1失败0）
         */
        if(result.confirm)
          wx.request({
            url: 'http://st.titordong.cn/DeleteTeam?gid='+this.data.groupid,
            complete: (res) => {},
            fail: (res) => {},
            success: result => {
              console.log(result.data.flag)
              if(result.data.flag){
                let pages=getCurrentPages()
                let prevPage=pages[pages.length-2]
                //prevPage.refreshGroup()//刷新前界面
                var grouplist=prevPage.data.grouplist
                for (let i = 0; i < grouplist.length; i++) {
                  if(grouplist[i].gid==this.data.groupid)
                    grouplist[i].dismissed=1
                }
                prevPage.setData({
                  grouplist:grouplist
                })

                //Tabbar界面跳转
                wx.switchTab({
                  url: '../index/index',
                  complete: (res) => {console.log('complete',res)},
                  fail: (res) => {console.log('fail',res)},
                  success: (res) => {
                    wx.showToast({
                      title: '解散成功',
                      icon:'success'
                    })
                    console.log(res)
                  },
                })
              }
            },
          })
      },
      title: '群解散',
    })
  }
})