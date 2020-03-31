// miniprogram/pages/members/groupMember.js
import { formatTime } from '../../../utils/util.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //个人
    mygroup:{},
    mydivlist:{},

    groupid:'',
    useropenid:'',
    ischairman:0,
    auth:'000000',
    user_divlist:[
      // {name:'公关部',id:'2356789',intro:'负责吃烤羊腿'},
      // {name:'财务部',id:'4567890',intro:'负责收钱跑路'},
    ],

    //部门
    divisionlist:[
      // {name:'公关部',id:'2356789',intro:'负责吃烤羊腿'},
      // {name:'财务部',id:'4567890',intro:'负责收钱跑路'},
      // {name:'人事部',id:'98675',intro:'负责没事开除人玩'}
    ],

    //点击成员
    memberclicked:0,
    memberavatar:"../../../images/1.jpg",
    membername:'',    
    memberstatus:'',
    memberid:'',
    memberchosed:'',
    showremove:0,
    showpicker:0,
    statusarray:[
      // {name:'副主席'},
      // {name:'公关部部长',id:'i65657'},
      // {name:'财务部部长',id:'ury6r78'},
      // {name:'权益部部长',id:'66676767'}
    ],
    i:0,

    //点击权限
    authclicked:0,
    statuslist:[],
    substatus:0,

    //点击换届
    changingterm:0,

    memberlist:[],

    count:-1
  },

  //对成员列表，部门列表初始化
  init(memberlist){
    for (let i in memberlist) {
      memberlist[i].clicked = 0
      //拼接 要显示的身份 字符串
      var divlen=memberlist[i].divisionlist?memberlist[i].divisionlist.length:0
      memberlist[i].statusshow=memberlist[i].status
      if(memberlist[i].status=='成员'&&divlen){
        memberlist[i].statusshow = ''
        for (let j = 0,n=0; j < divlen; j++) 
          if(!memberlist[i].divisionlist[j].dismissed){
            n++==0 ?  '' : (memberlist[i].statusshow += '，')
            memberlist[i].statusshow += (memberlist[i].divisionlist[j].name + memberlist[i].divisionlist[j].status)
          }
        
      }
      memberlist[i].statusshow=='成员' ? memberlist[i].statusdiv='尚未添加部门' : 
      (memberlist[i].statusshow=='主席'||memberlist[i].statusshow=='副主席' ?
      memberlist[i].statusdiv='主席、副主席无法加入部门': memberlist[i].statusdiv=memberlist[i].statusshow)
      //将本人放置最前列
      if(memberlist[i].pid==this.data.useropenid){
        let membert=memberlist[i]
        memberlist[i]=memberlist[0]
        memberlist[0]=membert
      }
    }
    this.setData({
      memberlist:memberlist
    })

    //显示本人的部门
    if(this.data.mygroup.status=='成员')
      this.setData({user_divlist:this.data.mydivlist})
    else
      this.setData({user_divlist:this.data.divisionlist})
  },

  onLoad: function (options) {
    // this.setData({
    //   groupid:options.gid,
    //   useropenid:options.pid,
    //   ischairman:options.ischairman=='true',
    //   auth:options.auth
    // })
    //console.log('groupmember onload',this.data.ischairman)
    const eventChannel = this.getOpenerEventChannel()
    var that=this
    eventChannel.on('getData',function(data){
      that.setData({
        useropenid:data.pid,
        mygroup:data.group,
        divisionlist:data.divisionlist,
        mydivlist:data.mydivlist,
        memberlist:data.memberlist
      })
      that.init(data.memberlist)
    })
  },

  onReady(){

  },

  onShow(){
    var count=++this.data.count
    var memberlist=this.data.memberlist
    if(count){
      this.init(memberlist)
    }
  },

  //进入我的部门
  toMyDiv(e){
    //console.log(e)
    let index = e.currentTarget.dataset.index
    var mydivision = this.data.user_divlist[index]
    var memberlist = this.data.memberlist
    var divisionlist=this.data.divisionlist
    var divmember=new Array()
    let n=0
    for (let i in memberlist) //部员列表生成
      if(memberlist[i].status=='成员')
        for (let j in memberlist[i].divisionlist)
          if (memberlist[i].divisionlist[j].id==mydivision.id&&!memberlist[i].divisionlist[j].dismissed){
            divmember[n]=memberlist[i]
            divmember[n].division=memberlist[i].divisionlist[j]
            divmember[n++].division.joined=1
          }
    for (let i in divisionlist) 
      if(divisionlist[i].id==mydivision.id){
        mydivision.auth=divisionlist[i].auth//部门的社团管理权限
        mydivision.authgroup=divisionlist[i].authgroup//部门副部的社团管理权限
        mydivision.authdiv=divisionlist[i].authdiv//部门副部的部门管理权限
      }
    //console.log(divmember)
    // ?gid='+this.data.groupid + '&&ischairman='+this.data.ischairman

      wx.navigateTo({
        url: '../divmember/divmember',
        success: (result) => {
          result.eventChannel.emit('acceptdiv&divMem',
          {
            mydivision: mydivision,
            divmember:divmember,
            useropenid: this.data.useropenid,
            group:this.data.mygroup,
            memberlist:memberlist
          })
        },
      })
  },

  //成员
  clickmember(e){
    console.log(e)

    //获取成员
    let i=e.currentTarget.dataset.index
    let member=this.data.memberlist[i]
    
    //检查是否可以对该成员进行身份修改
    //1. 只有主席可以修改所有人身份为副主席和成员 2. 自己不可修改自己的身份
    if(i==0 ? 0 : this.data.mygroup.ischairman){
      var statuslist=['成员','副主席']
      this.setData({
        showpicker:1,
        statuslist:statuslist
      })
    }else
    this.setData({showpicker:0})

    //检查是否可对该成员进行移除操作
    //1. 本人不可移除本人 2. 不可移除主席 3. 主席必有权限 4. 检查5号权限
    if(i==0 ? 0 : (member.status=='主席'? 0 : (this.data.mygroup.ischairman ? 1 : Number(this.data.mygroup.auth[5]))))
      this.setData({showremove:1})
    else
      this.setData({showremove:0})

      this.setData({
        memberclicked:1,
        memberchosed:member
      })
  },

  removeMem(){
    wx.showModal({
      cancelColor: 'green',
      cancelText: '取消',
      complete: (res) => {},
      confirmColor: 'red',
      confirmText: '确认',
      content: '确认移除此人？',
      fail: (res) => {},
      showCancel: true,
      success: (res) => {
        if(res.confirm)
          wx.request({
            url: 'http://st.titordong.cn/GRemove',
            complete: (res) => {},
            data: {
              gid:this.data.mygroup.gid,
              pid:this.data.memberchosed.pid
            },
            success: (result) => {
              if(result.data.flag)
                wx.showToast({
                  title: '移除成功',
                  duration: 2000,
                  icon: 'success',
                  success:r=>{
                    var memberchosed=this.data.memberchosed
                    memberchosed.removed=1
                    // console.log(memberlist)
                    // for (let i = 0; i < memberlist.length; i++)
                    //   memberlist[i].pid==memberchosed.pid ? memberlist[i].removed=1:''
                    this.setData({
                      memberlist:this.data.memberlist,
                      memberclicked:0
                    })
                  }
                })
            },
          })
      },
      title: '移除成员'
    })
  },


  chgStatus(){
    //console.log(this.data.statuslist[this.data.i])
    //console.log(this.data.memberchosed.pid)
    var memberchosed=this.data.memberchosed
    var statuslist=this.data.statuslist
    var i=this.data.i
    var mygroup=this.data.mygroup

    //在此变更此人社团身份
    if(i!=''&&memberchosed.status!=statuslist[i])
      wx.request({
        url: 'https://st.titordong.cn/Change_P',
        data: {
          type:1,
          pid:memberchosed.pid,
          id:mygroup.gid,
          status:statuslist[i]
        },
        success: (result) => {
          console.log(result)
          if(result.data.flag)
            memberchosed.status=statuslist[i]
            memberchosed.statusshow=''
            if(memberchosed.status=='成员'&&memberchosed.divisionlist.length)//解除副主席身份后暂时无法解除部门身份
              for (let index in  memberchosed.divisionlist) {
                index==0 ? '':memberchosed.statusshow+='，'
                memberchosed.statusshow+=memberchosed.divisionlist[index].name
                memberchosed.statusshow+=memberchosed.divisionlist[index].status
              }
            else
              memberchosed.statusshow=memberchosed.status
            var memberlist=this.data.memberlist
            for (let index in memberlist) 
              if(memberlist[index].pid==memberchosed.pid){
                memberlist[index]=memberchosed
                break
              }
            this.setData({
              memberlist:memberlist
            })
            wx.showToast({
              title: '更改成功',
              duration: 2000,
              icon: 'success',
            })
        },
      })
    else
      wx.showToast({
        title: '未做更改',
        duration:2000,
        icon: 'success',
      })

    this.setData({
      memberclicked:0,
      memberchosed:'',
      i:''
    })

  },

  bindStatusChange(e){
    console.log(e)
  },

  toggleMember(){
    this.setData({
      memberclicked:0
    })
  },
  bindStatusChange(e){
    console.log(e)
    this.setData({
      i: e.detail.value
  })
  },

  // bindStatusTap(e){
  //   console.log(e)
  // },

  //点击权限按钮
  clickauth(){
    var authlist1=[
      {name:'社团值班发布',clicked:0},
      {name:'活动信息管理',clicked:0},
      {name:'社团资金管理',clicked:0},
      {name:'社团设备信息管理',clicked:0},
      {name:'社团设备借用管理',clicked:0},
      {name:'社团成员增删',clicked:0},
      {name:'部长任命',clicked:0}]

    var statuslist=new Array()
    statuslist[0]=new Object()
    statuslist[0].name='副主席'
    statuslist[0].clicked=false
    statuslist[0].id=this.data.mygroup.gid
    statuslist[0].authlist=authlist1
    for (let index in this.data.mygroup.viceauth) 
      if(Number(this.data.mygroup.viceauth[index]))
        statuslist[0].authlist[index].clicked=1
    
    for (let i in this.data.divisionlist) {
      statuslist[i+1]=new Object()
      statuslist[i+1].name=this.data.divisionlist[i].name
      statuslist[i+1].id=this.data.divisionlist[i].id
      statuslist[i+1].clicked=false
      statuslist[i+1].authlist=[
        {name:'社团值班发布',clicked:0},
        {name:'活动信息管理',clicked:0},
        {name:'社团资金管理',clicked:0},
        {name:'社团设备信息管理',clicked:0},
        {name:'社团设备借用管理',clicked:0},
        {name:'社团成员增删',clicked:0}]
      //console.log(statuslist[i+1])
      for (let index = 0; index < 6 ; index++)
        if(Number(this.data.divisionlist[i].auth[index]))
          statuslist[i+1].authlist[index].clicked = 1
    }
    
    this.setData({
      statuslist:statuslist,
      authclicked:1
    })
  },
  toggleAuth(){
    this.setData({
      authclicked:0
    })
  },

  authsubmit(){
    var statuslist = this.data.statuslist
    var divisionlist=this.data.divisionlist
    var mygroup=this.data.mygroup
    var viceauth=''
    for (let i in statuslist[0].authlist) 
      statuslist[0].authlist[i].clicked ? viceauth+='1' : viceauth+='0'
    //console.log(viceauth)
    var gid=mygroup.gid
    if(mygroup.viceauth!=viceauth){
      this.setData({substatus:1})
      wx.request({
        url: 'https://st.titordong.cn/Change_A',
        data:{
          operator:1,
          type:1,
          id:gid,
          auth1:viceauth,
          auth2:''
        },
        success: (result) => {
          if(result.data.flag)
            wx.showToast({
              title: '副主席修改完成',
              duration: 2000,
              icon: 'success',
              success:res=>{
                mygroup.viceauth=viceauth
                this.setData({
                  mygroup:mygroup
                })

              }
            })
        },
      })
    }

      //副主席更改成功后继续更改下一个身份
    for (let i = 0; i < statuslist.length - 1; i++) {
      var did=divisionlist[i].id
      var auth=''
      for (let j = 0; j < 6; j++)
        statuslist[i+1].authlist[j].clicked ? auth+='1' : auth+='0'
      if(auth!=divisionlist[i].auth){
        wx.request({
          url: 'https://st.titordong.cn/Change_A',
          data: {
            operator:1,
            type:0,
            id:did,
            auth1:auth,
            auth2:''
          },
          success: (result) => {
            if(result.data.flag)
            wx.showToast({
              title: divisionlist[i].name + '修改完成',
              duration: 2000,
              icon: 'success',
              success:res=>{
                divisionlist[i].auth=auth
                this.setData({
                  divisionlist:divisionlist
                })
              }
            })
          },
        })
      }
    }
    this.setData({
      authclicked:0
    })
  },


  //点击权限弹窗中的身份
  clickstatus(e){
  
      let i=e.currentTarget.dataset.index
      var statuslist=this.data.statuslist
      for (let j in statuslist) {
        j!=i ? statuslist[j].clicked=false : statuslist[j].clicked=!statuslist[j].clicked
      }
      this.setData({
        i:i,
        statuslist:statuslist
      })
    
    //console.log(statuslist)
  },

  //点击权限条目
  clkAuthItm(e){
    if(this.data.mygroup.ischairman){
      var statuslist=this.data.statuslist
      var i=this.data.i
      var j=e.currentTarget.dataset.index
      var flag = statuslist[i].authlist[j].clicked
      statuslist[i].authlist[j].clicked=!flag
      this.setData({//setData可即时更改前端画面
        statuslist:statuslist
      })
  }
},

  //点击换届
  clkChgTerm(){
    this.setData({
      changingterm:1
    })
  },

  clickBack(){
    this.setData({
      changingterm:0
    })
  },

  slctMember(e){
  var i=e.currentTarget.dataset.index
  if(i){//i不等于0 不能是自己
      var memberlist=this.data.memberlist
      var memberchosed=memberlist[i]
      var mygroup=this.data.mygroup
      memberlist[i].clicked=1
      this.setData({
        memberlist:memberlist
      })
      wx.showModal({
        cancelColor: 'red',
        cancelText: '取消',
        confirmColor: 'green',
        confirmText: '确认',
        content: '确认将社团转让给此人？',
        showCancel: true,
        title: '社团转让',
        success: (result) => {
          if(result.confirm){
            wx.request({
              url: 'http://st.titordong.cn/Grow_Team',
              data: {
                gid:mygroup.gid,
                pid1:memberchosed.pid,
                pid2:this.data.useropenid
              },
              success: (result) => {
                if(result.data.flag){
                  memberlist[0].status='成员'
                  memberlist[0].statusshow='成员'
                  memberchosed.status='主席'
                  memberchosed.statusshow='主席'
                  memberchosed.clicked=0
                  mygroup.ischairman=0
                  this.setData({
                    changingterm:0,
                    memberlist:memberlist,
                    mygroup:mygroup
                  })

                }
              },
            })
          }
          else{
            memberlist[i].clicked=0
            this.setData({
              memberlist:memberlist
            })
          }
        }
      })
    }
  },

  //点击部门按钮
  clickdivision(e){
    // ?gid='+this.data.groupid + '&&ischairman='+this.data.ischairman
    wx.navigateTo({
      url: '../division/division',
      complete: (res) => {},
      fail: (res) => {},
      success: (result) => {
        result.eventChannel.emit('acceptdiv&mem',
        {
          divisionlist: this.data.divisionlist,
          memberlist:this.data.memberlist,
          useropenid:this.data.useropenid,
          mygroup:this.data.mygroup
          })
      },
    })
  },


})