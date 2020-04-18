// pages/group/group.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
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

    memberlist:{}
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
      // that.setData({
      //   userOpenid:data.pid,
      //   groupid:data.group.gid,
      //   myauth:data.group.auth,
      //   groupsum:data.group.intro,
      //   avatarUrl:data.group.avatar
      // })
      if(data.group.status=='主席')
        group.ischairman=true
      that.setData({
        mygroup:group,
        userOpenid:data.pid,
      })
    })
    //console.log(this.data)
  },

  onShow(){
    //请求社团部门
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    wx.request({
      url: 'http://st.titordong.cn/GetGroDiv',
      complete: (res) => {},
      data: {
        gid:this.data.mygroup.gid,
        pid:this.data.userOpenid
      },
      fail: (res) => {},
      success: (result) => {
        console.log('本社团部门',result);
        var divisionlist=result.data.divisionlist
        var mydivlist=result.data.mydivlist
        var mygroup=this.data.mygroup
        
        //社团权限计算
        if (mygroup.status=='成员') {
          var authlist=new Array()
          if(mydivlist)
            for (let i in mydivlist) {
              let j = 0

              for (; j < divisionlist.length; j++)
                if(mydivlist[i].id==divisionlist[j].id)
                  break;
            
              if(mydivlist[i].status=='部长')
                authlist[i]=divisionlist[j].auth//本部门的权限
              else if(mydivlist[i].status=='副部')
              authlist[i]=(divisionlist[j].authgroup ? divisionlist[j].authgroup:'000000')//本部门副部的权限
              else
                authlist[i]='0000000'
            
              // j = 0
              // for (; j < divisionlist.length; j++)
              //   if(mydivlist[i].id==divisionlist[j].id)
              //     break;
              mydivlist[i].status=='副部' ? mydivlist[i].authfinal=(divisionlist[j].authdiv ? divisionlist[j].authdiv : '0000') : ''
              mydivlist[i].status=='部长' ? mydivlist[i].authfinal='1111' : ''
              mydivlist[i].status=='部员' ? mydivlist[i].authfinal=mydivlist[i].myauth :''
              mydivlist[i].intro=divisionlist[j].intro
            }else{
              mydivlist=''
              divisionlist ? divisionlist='':''
            }
            console.log(mydivlist)
            mygroup.auth=new Array()
            for (let i = 0; i < 7; i++) 
            mygroup.auth[i]=mygroup.myauth[i]
            for (let i = 0; i < authlist.length; i++) {//遍历本人所有权限
            //console.log(authlist[i])
            for(let j = 0; j < 6; j++){//遍历 7× 6√ 项权限；社团身份一旦为成员就无法拥有部长任命的权限
              mygroup.auth[j] = String(Number(Number(authlist[i][j])||Number(mygroup.auth[j])))
            }
            //最终权限：
            //部门[i]：mydivlist[i].authfinal
            //授予部员权限0，部门成员增删1，部门活动信息管理2，部门值班发布3
            
            //社团：mygroup.auth
            //社团值班发布0，社团活动信息管理1，社团资金管理2，社团设备信息管理3
            //社团设备借用管理4，社团成员增删5，部长任命6
            
          }
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
        wx.hideLoading()
        //console.log('my group auth',this.data.mygroup.auth)
        //console.log('my division',this.data.divisionlist)
      },
    })

    //请求社团成员列表
    wx.request({
      url: 'http://st.titordong.cn/GetTeam_Mem?gid='+this.data.mygroup.gid,
      complete: (res) => {},
      fail: (res) => {},
      success: (result) => {
        console.log('本社团成员',result)
        var memberlist=result.data.memberlist
        this.setData({memberlist:memberlist})
      },
    })
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
            url: 'http://st.titordong.cn/DeleteTeam?gid='+this.data.mygroup.gid,
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

  }
})