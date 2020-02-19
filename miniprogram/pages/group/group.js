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

      authfinal:'1111'//最终计算4位部门权限
    },

    userOpenid:'',
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
    wx.request({
      url: 'http://st.titordong.cn/GetDivision',
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
          for (let i = 0; i < mydivlist.length; i++) {
            let j = 0
            for (; j < divisionlist.length; j++)
              if(mydivlist[i].id==divisionlist[j].did)
                break;
            mydivlist[i].status=='部长' ? authlist[i]=divisionlist[j].auth : ''//本部门的权限
            mydivlist[i].status=='副部' ? authlist[i]=divisionlist[j].authGroup : ''//本部门副部的权限
          }
          for (let i = 0; i < authlist.length; i++) {//遍历本人所有权限
            for(let j = 0; j < 7; j++){//遍历7项权限
              mygroup.auth[j] = String(Number(authlist[i][j]||mygroup.myauth[j]))
            }
          }
          console.log(mygroup.auth)
        }else if(mygroup.status=='副主席')
          mygroup.auth=mygroup.viceauth
        //部门权限计算
        for (let i = 0; i < mydivlist.length; i++) {
          let j = 0
          for (; j < divisionlist.length; j++)
            if(mydivlist[i].id==divisionlist[j].did)
              break;
          mydivlist[i].status=='副部' ? mydivlist[i].authfinal=divisionlist[j].authdiv : ''
          mydivlist[i].status=='部长' ? mydivlist[i].authfinal='1111' : ''
          mydivlist[i].intro=divisionlist[j].intro
        }
        this.setData({
          mygroup:mygroup,
          divisionlist:divisionlist,
          mydivlist:mydivlist
        })
      },
    })
  },

  toMembers(){
    var url='../members/groupMember/groupMember'
    wx.navigateTo({
      /*页面跳转：打 ‘../’即可查看目录结构*/
      url:url,
      success: (res) => {
        //console.log(url)
        res.eventChannel.emit('getData',{
          pid:this.data.userOpenid,
          group:this.data.mygroup,
          divisionlist:this.data.divisionlist,
          mydivlist:this.data.mydivlist
        })
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
  }
})