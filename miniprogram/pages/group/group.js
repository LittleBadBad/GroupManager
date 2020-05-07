// pages/group/group.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    models:[
      {
        id:0,
        name:'成员',
        bindtap:'toMembers'
      },
      {        
        id:1,
        name:'活动',
        bindtap:'toActions'
      },
      {
        id:2,
        name:'设备',
        bindtap:'toDevices'
      },
      {
        id:3,
        name:'资金',
        bindtap:'toFund'
      },
    ],

    mygroup:{
      gid:'',
      name:'',
      intro:'',
      status:'',
      ischairman:'',
      myauth:'',
      avatar:'',
      viceauth:'',

      //最终计算得到的权限
      auth:''
    },

    divisionlist:{
      did:'',
      dname:'',
      intro:'',
      auth:'',//部门7位权限
      authgroup:'',
      authdiv:''
    },
    mydivlist:{
      id:'666',
      name:'公关部',

      status:'部长',
      myauth:'1111',//权限

      auth:'1111'//最终计算4位部门权限
    },

    userOpenid:'',

    memberlist:{},

    count:0
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
      var group=data.group
      if(data.group.status=='主席')
        group.ischairman=true
      that.setData({
        mygroup:group,
        userOpenid:data.pid,
      })
      that.loadPageData()
    })
  },

  onShow(){
    if(this.data.count)
      this.loadPageData()
  },

  //解散社团
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
            url: app.globalData.serverurl+'DeleteTeam?gid='+this.data.mygroup.gid,
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
                  if(grouplist[i].gid==this.data.mygroup.gid)
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
  },

  //前往成员界面
  toMembers(){
    var url='../members/groupMember/groupMember'
    wx.navigateTo({
      /*页面跳转：打 ‘../’即可查看目录结构*/
      url:url,
      success: (res) => {
        //console.log(url)
        res.eventChannel.emit('getData',{
          memberlist:this.data.memberlist,
          pid:this.data.userOpenid,
          group:this.data.mygroup,
          divisionlist:this.data.divisionlist,
          mydivlist:this.data.mydivlist
        })
      },
    })
  },

  toDevices(){
    wx.navigateTo({
      url: '../devices/index/index',
      complete: (res) => {},
      fail: (res) => {},
      success: (result) => {
        result.eventChannel.emit('getData',{
          memberlist:this.data.memberlist,
          pid:this.data.userOpenid,
          group:this.data.mygroup,
        })
      },
    })
  },

  //前往活动界面
  toActions(){
    wx.navigateTo({
      url: '../actions/index/index',
      complete: (res) => {},
      fail: (res) => {},
      success: (result) => {
        result.eventChannel.emit('getData',{
          useropenid:this.data.userOpenid,
          mygroup:this.data.mygroup,
          mydivlist:this.data.mydivlist,
          memberlist:this.data.memberlist
        })
      },
    })
  },

  loadPageData(){
    //请求社团部门
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    wx.request({
      url: app.globalData.serverurl+'GetGroDiv',
      complete: (res) => {wx.hideLoading()},
      data: {
        gid:this.data.mygroup.gid,
        pid:this.data.userOpenid
      },
      fail: (res) => {},
      success: (result) => {
        wx.showLoading({
          title: '处理中',
          mask: true,
        })
        console.log('本社团部门',result)
        var divisionlist=result.data.divisionlist//本社团部门
        var mydivlist=result.data.mydivlist//user加入的部门
        var mygroup=this.data.mygroup
        if(divisionlist)
          divisionlist.forEach(function(item,index){
            item.authfinal=[]
          })
        if(mydivlist)
          mydivlist.forEach(function(item,index){
            item.authfinal=[]
          })

        //社团权限计算
        if (mygroup.status=='成员') {
          var authlist=new Array()
          if(mydivlist)
            for (let i in mydivlist) {
              let j = 0
              for (; j < divisionlist.length; j++)
                if(mydivlist[i].id==divisionlist[j].id)//在divislist中找到本人加入的部门
                  break;
              if(mydivlist[i].status=='部长')
                authlist[i]=divisionlist[j].auth//本部门的权限
              else if(mydivlist[i].status=='副部')
              authlist[i]=(divisionlist[j].authgroup ? divisionlist[j].authgroup:'000000')//本部门副部的权限
              else
                authlist[i]='0000000'      
              
              //各部门权限计算
              mydivlist[i].status=='副部' ? mydivlist[i].authfinal=(divisionlist[j].authdiv ? divisionlist[j].authdiv : '0000') : ''
              mydivlist[i].status=='部长' ? mydivlist[i].authfinal='1111' : ''
              mydivlist[i].status=='部员' ? mydivlist[i].authfinal=mydivlist[i].myauth :''
              mydivlist[i].intro=divisionlist[j].intro
            }
          else{
              mydivlist=''
              divisionlist ? divisionlist='':''
          }
          console.log('user加入的部门',mydivlist)
          mygroup.auth=new Array()
          //开始计算最终权限mugroup.auth，首先第一位放入myauth：由之前部长所授予的社团管理权限
          for (let i = 0; i < 7; i++)
            mygroup.auth[i]=mygroup.myauth[i]
          for (let i in authlist) {//遍历本人所有权限
            for(let j = 0; j < 6; j++){//成员 遍历 6 项权限（社团身份一旦为成员就无法拥有部长任命的权限）
              mygroup.auth[j] = String(Number(Number(authlist[i][j])||Number(mygroup.auth[j])))
            }
          }
            //user最终权限：
            //部门[i]：mydivlist[i].authfinal
            //授予部员权限0，部门成员增删1，部门活动信息管理2，部门值班发布3
            //社团：mygroup.auth
            //社团值班发布0，社团活动信息管理1，社团资金管理2，社团设备信息管理3
            //社团设备借用管理4，社团成员增删5，部长任命6
            //member[i]最终权限：
            //成员[i].部门[j]：memberlist[i].divisionlist[j].auth
            //
        }
        else if(mygroup.status=='副主席')
          mygroup.auth=mygroup.viceauth
        else
          mygroup.auth='1111111'
        this.setData({
          mygroup:mygroup,
          divisionlist:divisionlist,
          mydivlist:mydivlist
        })
        wx.showLoading({
          title: '请求成员中',
          mask: true,
        })
        wx.request({
          url: app.globalData.serverurl+'GetTeam_Mem',
          data:{
            gid:this.data.mygroup.gid,
          },
          complete: (res) => {wx.hideLoading()},
          fail: (res) => {
            wx.showToast({
              title: res.errMsg,
              duration: 2000,
              mask: true,
            })
          },
          success: (result) => {
            console.log('本社团成员',result)
            var memberlist=result.data.memberlist
            this.setData({
              memberlist:memberlist,
              count:this.data.count+1
            })
          },
        })
      },
    })
  }
})