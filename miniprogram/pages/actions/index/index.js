const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showaddaction:0,
    showaddduty:0,

    useropenid:'',

    mygroup:[],
    mydivlist:[],

    memberlist:[],

    actionlist:[],
    dutylist:[],
    slnlist:[],

    count:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel()
    var that=this
    eventChannel.on('getData',function(data){
      var mygroup=data.mygroup
      var mydivlist=data.mydivlist
      var actiondiv=0
      var dutydiv=0
      that.setData({
        useropenid:data.useropenid,
        mygroup:data.mygroup,
        mydivlist:data.mydivlist,
        memberlist:data.memberlist
      })
      for(let i in mydivlist){
        actiondiv=actiondiv||Number(mydivlist[i].authfinal[2])
        dutydiv=dutydiv||Number(mydivlist[i].authfinal[3])
      }
      if(Number(mygroup.auth[1])||actiondiv)
        that.setData({showaddaction:1})
      if(Number(mygroup.auth[0])||dutydiv)
        that.setData({showaddduty:1})
      that.loadPageData()
    })
  },

  onShow: function () {
    if(this.data.count)
      this.loadPageData()
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
          memberlist:this.data.memberlist,
          
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
    var actions=this.data.actionlist
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
          action:action,
          actions:actions
        })
      },
    })
  },

  addDuty(){
    wx.navigateTo({
      url: '../addduty/addduty',
      complete: (res) => {},
      fail: (res) => {},
      success: (result) => {
        result.eventChannel.emit('getData',{
          useropenid:this.data.useropenid,
          mygroup:this.data.mygroup,
          mydivlist:this.data.mydivlist,
          memberlist:this.data.memberlist,
          slnlist:this.data.slnlist
        })
      },
    })
  },

  toDuty(e){
    var i=e.currentTarget.dataset.index
    var dutylist=this.data.dutylist
    console.log(dutylist[i])
    if(dutylist[i].status==1)
      wx.navigateTo({
        url: '../addvacant/addvacant',
        complete: (res) => {},
        fail: (res) => {},
        success: (result) => {
          result.eventChannel.emit('getData',{
            useropenid:this.data.useropenid,
            duty:dutylist[i],
            memberlist:this.data.memberlist
          })
        },
      })
    else
      wx.navigateTo({
        url: '../dutychart/dutychart',
        complete: (res) => {},
        fail: (res) => {},
        success: (result) => {
          result.eventChannel.emit('getData',{
            useropenid:this.data.useropenid,
            duty:dutylist[i],
            memberlist:this.data.memberlist
          })
        },
      })

  },

  deleteDuty(e){
    var i=e.currentTarget.dataset.index
    var dutylist=this.data.dutylist
    console.log(dutylist[i].duid)
    wx.showModal({
      cancelColor: 'grey',
      cancelText: '取消',
      complete: (res) => {},
      confirmColor: 'red',
      confirmText: '确定',
      content: '确定撤销此值班？',
      fail: (res) => {},
      showCancel: true,
      success: (result) => {
        if(result.confirm){
          wx.showLoading({
            title: '删除中',
            mask: true,
          })
          wx.request({
            url: app.globalData.serverurl+'v3/DelDuty',
            complete: (res) => {wx.hideLoading()},
            data: {
              duid:dutylist[i].duid
            },
            fail: (res) => {},
            header: {
              'content-type':'application/x-www-form-urlencoded'
            },
            method: 'POST',
            success: (result) => {
              console.log(result)
              if(result.data.flag){
                dutylist[i].status=0
                this.setData({dutylist:dutylist})
              }
            },
          })
        }
      },
    })
  },

  loadPageData(){
    var mygroup=this.data.mygroup
    var mydivlist=this.data.mydivlist
    var memberlist=this.data.memberlist
    var gid=mygroup.gid
    var didlist=new Array()
    for (let i in mydivlist)
      didlist[i]=mydivlist[i].id
    wx.showLoading({
      title: '加载活动中',
      mask: true,
    })
    wx.request({//request1
      url: app.globalData.serverurl+'GetAction',
      complete: (res) => {wx.hideLoading()},
      data: {
        gid:gid,
        didlist:didlist
      },
      fail: (res) => {},
      success: (result1) => {
        console.log(result1.data)
        var actions=result1.data.actions
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
        wx.showToast({
          title: '活动加载完成',
          duration: 2000,
          success: (res2) => {
            wx.showLoading({
              title: '加载值班内容',
              success:res3=>{
                wx.request({//request2
                  url: app.globalData.serverurl+'GetSolu',
                  complete: (res) => {},
                  data: {
                    gid:this.data.mygroup.gid
                  },
                  fail: (res) => {},
                  success: (result) => {
                    var solutions=result.data.solutions
                    for(let i in solutions){
                      solutions[i].timelist=new Object()
                      solutions[i].timelist.start=[]
                      solutions[i].timelist.end=[]
                      for(let j in solutions[i].time){
                        var arr=solutions[i].time[j].split('-')
                        solutions[i].timelist.start[j]=arr[0]
                        solutions[i].timelist.end[j]=arr[1]
                      }
                    }
                    console.log('本群方案',solutions)
                    this.setData({
                      slnlist:solutions
                    })
                    wx.request({//request3
                      url: app.globalData.serverurl+'v3/GetDuty',
                      complete: (res) => {wx.hideLoading()},
                      data: {
                        gid:gid,
                        didlist:didlist
                      },
                      header: {
                        'content-type':'application/x-www-form-urlencoded'
                      },
                      fail: (res) => {},
                      method: 'POST',
                      success: (result4) => {
                        var slnlist=this.data.slnlist
                        var dutylist=result4.data.dutylist
                        ///console.log(dutylist)
                        for(let i in dutylist){
                          //获取发布人
                          for(let j in memberlist)
                            if(dutylist[i].pid==memberlist[j].pid)
                              dutylist[i].publisher=memberlist[j].name
                          
                          //获取发布单位
                          if(dutylist[i].type==1)
                            dutylist[i].unit='社团'
                          else
                            for(let j in mydivlist)
                              if(dutylist[i].id==mydivlist[j].id)
                                dutylist[i].unit=mydivlist[j].name

                          //获取值班名称
                          for(let j in slnlist)
                            if(dutylist[i].sid==slnlist[j].sid)
                              dutylist[i].sln=slnlist[j]
                        }
                        this.setData({
                          dutylist:dutylist,
                          count:this.data.count+1
                        })
                      },
                    })
                  },
                })
              }
            })
          },
        })
      },
    })
  }
})