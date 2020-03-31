const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    useropenid:'',

    mygroup:[],
    mydivlist:[],

    memberlist:[],

    actionlist:[],
    dutylist:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel()
    var that=this
    eventChannel.on('getData',function(data){
      that.setData({
        useropenid:data.useropenid,
        mygroup:data.mygroup,
        mydivlist:data.mydivlist,
        memberlist:data.memberlist
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
    var mygroup=this.data.mygroup
    var mydivlist=this.data.mydivlist

    var gid=mygroup.gid
    var didlist=new Array()
    for (let i in mydivlist)
      didlist[i]=mydivlist[i].id
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    wx.request({
      url: app.globalData.serverurl+'GetAction',
      complete: (res) => {},
      data: {
        gid:gid,
        didlist:didlist
    },
      fail: (res) => {},
      success: (result) => {
        console.log(result.data)
        
        var actions=result.data.actions
        for (var i in actions){
          //console.log(actions[i])
          if(actions[i].type==1)
            actions[i].unit='社团'
          else
            for(var j in mydivlist)
              if(actions[i].id==mydivlist[j].id)
                actions[i].unit=mydivlist[j].name
        }
        this.setData({
          actionlist: actions
        })

        wx.hideLoading()
      },
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  addAction(){
    wx.navigateTo({
      url: '../addaction/addaction',
      complete: (res) => {},
      fail: (res) => {},
      success: (result) => {
        result.eventChannel.emit('getData',{
          useropenid:this.data.useropenid,
          mygroup:this.data.mygroup,
          mydivlist:this.data.mydivlist,
          memberlist:this.data.memberlist
        })
      },
    })
  },

  actionDetail(e){
    console.log(e)
    var action=e.currentTarget.dataset.item
    var mygroup=this.data.mygroup
    var mydivlist=this.data.mydivlist
    var memberlist=this.data.memberlist
    var useropenid=this.data.useropenid
    wx.navigateTo({
      url: '../action/action',
      complete: (res) => {},
      events: {},
      fail: (res) => {},
      success: (result) => {
        result.eventChannel.emit('getData',{
          useropenid:useropenid,
          mygroup:mygroup,
          mydivlist:mydivlist,
          memberlist:memberlist,
          action:action
        })
      },
    })
  },

  loadData(actions){
    for (let i = 0; i < actions.length; i++) {
      
    }
  }
})