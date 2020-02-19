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
      {name:'公关部',id:'2356789',intro:'负责吃烤羊腿'},
      {name:'财务部',id:'4567890',intro:'负责收钱跑路'},
    ],

    //部门
    divisionlist:[
      {name:'公关部',id:'2356789',intro:'负责吃烤羊腿'},
      {name:'财务部',id:'4567890',intro:'负责收钱跑路'},
      {name:'人事部',id:'98675',intro:'负责没事开除人玩'}
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
      {name:'副主席'},
      {name:'公关部部长',id:'i65657'},
      {name:'财务部部长',id:'ury6r78'},
      {name:'权益部部长',id:'66676767'}],
    i:0,

    //点击权限
    authclicked:0,
    statuslist:[],

    //点击换届
    changingterm:0,

    memberlist:[
    {
      pid:'123456',
      avatar:'../../../images/1.jpg',
      name:'二狗',

      id:'',
      contact:'',
      regtime:'',
      status:'副主席'
    },
    {
      pid:'67890',
      avatar:'../../../images/3.jpg',
      name:'dy',
      division:'公关部',
      status:'部长'
    }]
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
        mydivlist:data.mydivlist
      })
    })
  },

  onReady(){
    //请求社团成员列表
    wx.request({
      url: 'http://st.titordong.cn/GetTeam_Mem?gid='+this.data.mygroup.gid,
      complete: (res) => {},
      fail: (res) => {},
      success: (result) => {
        console.log('本社团成员',result)
        var memberlist=result.data.memberlist
        for (let i = 0; i < memberlist.length; i++) {
          //拼接 要显示的身份 字符串
          var divlen=memberlist[i].divisionlist.length
          memberlist[i].statusshow=memberlist[i].status
          if(memberlist[i].status=='成员'&&divlen){
            memberlist[i].statusshow = ''
            for (let j = 0; j < divlen; j++) {
              j==0 ?  '' : (memberlist[i].statusshow += '，')
              memberlist[i].statusshow += (memberlist[i].divisionlist[j].dname + memberlist[i].divisionlist[j].status)
            }
          }
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
        if(this.data.mygroup.ischairman||Number(this.data.mygroup.auth[6]))
          this.setData({user_divlist:this.data.divisionlist})
        else
          this.setData({user_divlist:this.data.mydivlist})
      },
    })
  },

  onShow(){

  },

  //进入我的部门
  toMyDiv(e){
    //console.log(e)
    let index = e.currentTarget.dataset.index
    var mydivision = this.data.user_divlist[index]
    var memberlist = this.data.memberlist
    var divmember=new Array()
    let n=0;
    for (let i = 0; i < memberlist.length; i++) //部员列表生成
      for (let j = 0; j < memberlist[i].divisionlist.length; j++) 
        if (memberlist[i].divisionlist[j].id==mydivision.id){
          divmember[n]=memberlist[i]
          divmember[n++].division=memberlist[i].divisionlist[j]
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
            group:this.data.mygroup
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
  member.statusshow=='成员' ? member.statusdiv='尚未添加部门' : 
  (member.statusshow=='主席'||member.statusshow=='副主席' ?
  member.statusdiv='主席、副主席无法加入部门': member.statusdiv=member.statusshow)
  
  
  //检查是否可以对该成员进行身份修改
  //1. 只有主席可以修改所有人身份为副主席和成员 2. 自己不可修改自己的身份
  if(i==0 ? 0 : this.data.mygroup.ischairman){
    var statuslist=['成员','副主席']
    member.status=='成员' ? this.setData({i:0}) : this.setData({i:1})
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

chgStatus(){
  console.log(this.data.statuslist[this.data.i])
  console.log(this.data.memberchosed.pid)
  //在此变更此人社团身份
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

bindStatusTap(e){
  console.log(e)
},

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
  for (let i = 0; i < this.data.divisionlist.length; i++) {
    statuslist[i+1]=new Object()
    statuslist[i+1].name=this.data.divisionlist[i].dname
    statuslist[i+1].id=this.data.divisionlist[i].id
    statuslist[i+1].clicked=false
    statuslist[i+1].authlist=[
      {name:'社团值班发布',clicked:0},
      {name:'活动信息管理',clicked:0},
      {name:'社团资金管理',clicked:0},
      {name:'社团设备信息管理',clicked:0},
      {name:'社团设备借用管理',clicked:0},
      {name:'社团成员增删',clicked:0}]
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

//点击权限弹窗中的身份
clickstatus(e){
 
    let i=e.currentTarget.dataset.index
    var statuslist=this.data.statuslist
    for (let j = 0; j < statuslist.length; j++) {
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
        if(result.confirm)
          console.log('确认')
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
         group:this.data.mygroup
        })
    },
  })
}
})