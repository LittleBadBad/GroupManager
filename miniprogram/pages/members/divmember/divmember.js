// pages/members/divmember/divmember.js
import { formatTime } from '../../../utils/util';
const app = getApp()
Page({

  data: {
    mygroup:'',//我在本社团中的信息
    mydivision:'',//我在本部门中的信息

    groupmember:'',

    changingterm:0,

    showremove:0,
    showrecruit:'',//招募/移除权限
    recruitclkd:0,

    changeauth:0,//授予部员权限的权限
    authclicked:0,
    authtype:[
      {
        name:'社团管理权限',
        authlist:[
          {name:'社团值班发布',clicked:0},
          {name:'活动信息管理',clicked:0},
          {name:'社团资金管理',clicked:0},
          {name:'社团设备信息管理',clicked:0},
          {name:'社团设备借用管理',clicked:0},
          {name:'社团成员增删',clicked:0,memdisable:1}]
      },
      {
        name:'部门管理权限',
        authlist:[
          {name:'授予部员权限',clicked:0,memdisable:1},
          {name:'部门成员增删',clicked:0,memdisable:1},
          {name:'部门活动信息管理',clicked:0},
          {name:'部门值班发布',clicked:0}
        ]
      }
    ],

    goupid:'',
    ischairman:0,
    divmember:'',
    useropenid:'',    

    //部员弹窗
    status:'',
    divmemchosed:'',
    divmemclkd:0,
    chgstatus:0,//身份修改权限
    statuslist:['部长','副部','部员'],

    count:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel()
    var _this=this
    eventChannel.on('acceptdiv&divMem',function(data){
      wx.setNavigationBarTitle({title: data.mydivision.name})
      _this.setData({
        // goupid:options.gid,
        // ischairman:options.ischairman=='true',
        mydivision:data.mydivision,
        divmember:data.divmember,
        mygroup:data.group,
        useropenid:data.useropenid,
        groupmember:data.memberlist,
        showrecruit:Number(data.mydivision.authfinal ? data.mydivision.authfinal[1]:0),
        chgstatus:Number(data.group.auth[6]||data.mydivision.status=='部长'),
        changeauth:Number(data.mydivision.auth[0])
      })
      _this.loadPageData()
      console.log('dm',data.divmember)
    })
  },

  onShow(){
    if(this.data.count)
      this.loadPageData()
  },

  //改变副部权限
  chgVcAuth(){
    var mydivision=this.data.mydivision
    var authtype=this.data.authtype
    if(mydivision.authgroup)
      for (let i = 0; i < 6; i++) 
        if(!Number(mydivision.auth[i]))
          authtype[0].authlist[i].disable=1
        else
          authtype[0].authlist[i].clicked=Number(mydivision.authgroup[i])? 1:0
        
    if(mydivision.authdiv)
      for (let i = 0; i < 4; i++)
        if(Number(mydivision.authdiv[i]))
          authtype[1].authlist[i].clicked=1
        else
          authtype[1].authlist[i].clicked=0
    this.setData({
      authtype:authtype,
      authclicked:1
    })
  },

  toggleAuth(){
    this.setData({authclicked:0})
  },

  clicktype(e){
    let i=e.currentTarget.dataset.index
    var authtype=this.data.authtype
    for (let j = 0; j < authtype.length; j++) {
      j!=i ? authtype[j].clicked=false : authtype[j].clicked=!authtype[j].clicked
    }
    this.setData({
      i:i,
      authtype:authtype
    })
  },

  clkAuthItm(e){
    console.log(e)
    var authtype=this.data.authtype
    var i=e.currentTarget.dataset.i
    var j=e.currentTarget.dataset.j
    //console.log(e,this.data.mydivision)
    if(this.data.mydivision.status=='部长'&&!authtype[i].authlist[j].disable){
      var flag = authtype[i].authlist[j].clicked
      authtype[i].authlist[j].clicked=!flag
      this.setData({//setData可即时更改前端画面
        authtype:authtype
      })
    }else
    wx.showToast({
      title: '没有权限',
      duration: 2000,
      icon: 'none',
    })
  },
  
  authsubmit(){
    var mydivision=this.data.mydivision
    var authtype=this.data.authtype
    var auth1=new String()
    var auth2=new String()
    for (let i = 0; i < 6; i++) 
      authtype[0].authlist[i].clicked ? auth1+='1':auth1+='0'
    for (let i = 0; i < 4; i++) 
      authtype[1].authlist[i].clicked ? auth2+='1':auth2+='0'

    if(mydivision.authgroup!=auth1||mydivision.authdiv!=auth2)
      wx.request({
        url: app.globalData.serverurl+'Change_A',
        data: {
          operator:0,
          type:0,
          id:mydivision.id,
          auth1:auth1,
          auth2:auth2
        },
        success: (result) => {
          if(result.data.flag){
            mydivision.authgroup=auth1
            mydivision.authdiv=auth2
          }
          this.setData({
            mydivision:mydivision,
            authclicked:0
          })
          wx.showToast({
            title: '更改成功！',
            duration: 2000,
            icon: 'success',
            mask: true,
          })
        },
      })
  },

  //点击换届
  clkChgTerm(){
    this.setData({
      changingterm:1
    })
  },

  clickBack(){
    var divmember=this.data.divmember
    divmember.forEach(function(item,index){
      item.clicked=0
    })
    this.setData({
      changingterm:0,
      divmember:divmember
    })
  },

  slcMember(e){
    var i=e.currentTarget.dataset.index
    var divmemchosed=this.data.divmember[i]
    var mydivision=this.data.mydivision
    
    if(i){
      divmemchosed.clicked=1
      this.setData({divmember:this.data.divmember})
      wx.showModal({
        cancelColor: 'green',
        cancelText: '取消',
        complete: (res) => {},
        confirmColor: 'red',
        confirmText: '确认',
        content: '将部门转让此人？',
        fail: (res) => {},
        showCancel: true,
        success: (result) => {
          if(result.confirm)
            wx.request({
              url: app.globalData.serverurl+'Grow_Division',
              data: {
                did:mydivision.id,
                pid1:divmemchosed.pid,
                pid2:this.data.useropenid
              },
              success: (result) => {
                if(result.data.flag)
                  wx.showToast({
                    title: '换届成功',
                    duration: 2000,
                    icon: 'success',
                    success: (res) => {
                      mydivision.status='部员'
                      divmemchosed.division.status='部长'
                      divmemchosed.clicked=0
                      this.data.divmember[0].division.status='部员'
                      this.setData({
                        changingterm:0,
                        divmember:this.data.divmember
                      })
                    },
                  })
              },
            })
        },
        title: '部门换届',
      })
    }
    else{
      wx.showToast({
        title: '请选择其他人',
        duration: 2000,
        icon: 'none',
        success: (res) => {},
      })
    }
  },
  
  //招募部员
  clkRecruit(){
    this.setData({
      recruitclkd:1
    })
  },

  tglRecruit(){
    this.setData({
      recruitclkd:0
    })
  },

  selectMem(e){
    //console.log(e)
    var i=e.currentTarget.dataset.index
    var groupmember=this.data.groupmember
    var member=groupmember[i]
    member.clicked=!member.clicked
    this.setData({groupmember:groupmember})
    //console.log(groupmember)
  },

  recruit(){
    var groupmember=this.data.groupmember
    var mydivision=this.data.mydivision
    var divmember=this.data.divmember
    //console.log(groupmember)
    for (let i in groupmember) {
      if(groupmember[i].clicked==1){
      var time = formatTime(new Date())
      wx.request({
        url: app.globalData.serverurl+'Join_Division',
        complete: (res) => {},
        data: {
          pid:groupmember[i].pid,
          did:mydivision.id,
          jointime:time
        },
        success: (result) => {
          if(result.data.flag){
            let newdivstatus=new Object()
            newdivstatus.auth='0000'
            newdivstatus.id=mydivision.id
            newdivstatus.name=mydivision.name
            newdivstatus.status='部员'
            newdivstatus.jointime=time
            groupmember[i].divisionlist[groupmember[i].divisionlist.length]=newdivstatus
            groupmember[i].division=newdivstatus
            //groupmember[i].division.joined=1
            groupmember[i].clicked=0

            var flag=0
            for (var index = 0; index < divmember.length; index++) //index退出时大小为length
              if(divmember[index].pid==groupmember[i].pid)
                 flag=groupmember[i].pid
              if(!flag)
                divmember[index]=groupmember[i]
              console.log(flag)
              console.log('index',index)
              console.log('部员列表',divmember)
              this.setData({
                groupmember:groupmember,
                divmember:divmember,
                recruitclkd:0
              })
              wx.showToast({
                title: '招募成功',
                duration: 2000,
                icon: 'success',
              })
            }
          },
        })
      }
    }
  },

  //点击部门成员
  clkDivMem(e){
    let i = e.currentTarget.dataset.index
    var divmemchosed=this.data.divmember[i]
    var authtype=this.data.authtype
    var mydivision=this.data.mydivision
    var viceauth1=mydivision.authgroup?mydivision.authgroup:'000000'
    var viceauth2=mydivision.authdiv?mydivision.authdiv:'0000'

    //auth1 auth2为将要显示的权限
    var auth1=this.data.mydivision.auth//默认选择的人为部长
    var auth2='1111'

    if(divmemchosed.division.status=='部员'){
      auth1=divmemchosed.auth?divmemchosed.auth:'000000',//❗成员的社团权限暂未获取
      auth2=divmemchosed.division.auth?divmemchosed.division.auth:'0000'
    }
    else if(divmemchosed.division.status=='副部'){
      auth1=mydivision.authgroup?mydivision.authgroup:'000000',
      auth2=mydivision.authdiv?mydivision.authdiv:'0000'
    }
    //console.log(auth1,' ',auth2)
    for (let j = 0; j < 6; j++)//
      if(Number(auth1[j]))
        authtype[0].authlist[j].clicked=1
      else
        authtype[0].authlist[j].clicked=0
    for (let j = 0; j < 4; j++)
      if(Number(auth2[j]))
        authtype[1].authlist[j].clicked=1
      else
        authtype[1].authlist[j].clicked=0
    
    if (mydivision.status=='副部'&&mydivision.authfinal[0]) {//0号权限：授予部员权限
      for (let j = 0; j < 6; j++) //副部长没有的权限不能授予部员
        if(!Number(viceauth1[j]))
          authtype[0].authlist[j].memdisable=1
      for (let j = 0; j < 4; j++)
        if(!Number(viceauth2[j]))
          authtype[1].authlist[j].memdisable=1
    }

    this.setData({
      authtype:authtype,
      divmemchosed:divmemchosed,
      divmemclkd:1,
      showremove:this.data.showrecruit&&i!=0&&divmemchosed.division.status!='部长',
      changeauth:i&&divmemchosed.division.status=='部员'&&mydivision.authfinal[0],
    })
    /**
     *1. 本人在社团中的权限 
     *2. 本人在本部门中的权限
     *3. 本部门副部的权限
     **/
    //console.log('i',i)
    var mygroup=this.data.mygroup
    var mydivision=this.data.mydivision
    //1. 不可修改本人，2. 主席能改 部长 副部长 部员 3. 部长能改 副主席 部员 4. 其余人不具备此权限
    if(i&&(mygroup.ischairman||Number(mygroup.auth[6])||Number(mydivision.status=='部长'))){
      var statuslist=['','副部']
      if(mydivision.status=='部长')
        statuslist=['副部','部员']
      else if((Number(mygroup.auth[6])||mygroup.ischairman))
        statuslist=['部长','副部','部员']
      this.setData({
        chgstatus:1,
        statuslist:statuslist
      })
    }
    else
      this.setData({
        chgstatus:0
      })

  },

/**              数据初始化
 * 入口\             |
 * 入口——>过程——>出口——>
 * 入口/
 *   
 * 数据初始化
 *     |         / 出口
 * 入口——>过程——>——出口
 *               \ 出口
 */

  toggDivMem(){
    this.setData({
      divmemclkd:0
    })
  },

  bindStatusChange(e){
    console.log(e.detail.value)
    var i=e.detail.value
    var statuslist=this.data.statuslist
    this.setData({status:statuslist[i]})
  },

  clkMemAuth(e){
    //console.log(e)
    if(this.data.changeauth){
      var i1=e.currentTarget.dataset.i1
      var i2=e.currentTarget.dataset.i2
      var authtype=this.data.authtype
      authtype[i1].authlist[i2].clicked=!authtype[i1].authlist[i2].clicked
      this.setData({authtype:authtype})
    }else{
      wx.showToast({
        title: '无法更改',
        duration: 2000,
        icon: 'none',
      })
    }
  },

  removeMem(){
    var groupmember=this.data.groupmember
    var divmember=this.data.divmember
    var divmemchosed=this.data.divmemchosed
    var mydivision=this.data.mydivision
    wx.showModal({
      cancelColor: 'green',
      cancelText: '取消',
      complete: (res) => {},
      confirmColor: 'red',
      confirmText: '确认',
      content: '确认移除此部员？',
      fail: (res) => {},
      showCancel: true,
      success: (result) => {
        if(result.confirm)
          wx.request({
            url: app.globalData.serverurl+'DRemove',
            complete: (res) => {},
            data: {
              pid:divmemchosed.pid,
              did:mydivision.id
            },
            success: (result) => {
              if(result.data.flag){
                var divisionlistnew=[]
                var divmembernew=[]
                for (let i in divmemchosed.divisionlist) 
                  if(divmemchosed.divisionlist[i].id!=mydivision.id)
                    divisionlistnew=divisionlistnew.concat(divmemchosed.divisionlist[i])
                divmemchosed.divisionlist.divisionlistnew
                divmemchosed.division=''
                for(let i in divmember)
                  if(divmember[i].pid!=divmemchosed)
                    divmembernew=divmembernew.concat(divmember[i])
                console.log('部员列表',divmembernew)
                this.setData({
                  divmember:divmembernew,
                  groupmember:groupmember,
                  divmemclkd:0})
                wx.showToast({
                  title: '移除成功',
                  icon:'success',
                  duration:2000
                })
              }
            },
          })
      },
      title: '移除部员',
    })
  },

  alterInfo(){
    var i=this.data.i
    var authtype=this.data.authtype
    var statuslist=this.data.statuslist
    var status=this.data.status
    var mydivision=this.data.mydivision
    var divmemchosed=this.data.divmemchosed
    var mygroup=this.data.mygroup

    var auth1='',auth2=''
    for (let j = 0; j < 6; j++)
      auth1+=String(Number(authtype[0].authlist[j].clicked))
    
    for (let j = 0; j < 4; j++)
      auth2+=String(Number(authtype[1].authlist[j].clicked))

    //1. 改变身份
    if(status&&status!=divmemchosed.division.status)
      wx.request({
        url: app.globalData.serverurl+'Change_P',
        data: {
          type:0,
          pid:divmemchosed.pid,
          id:mydivision.id,
          status:status
        },
        success: (result) => {
          if(result.data.flag)
            divmemchosed.division.status=status
          this.setData({
            divmember:this.data.divmember
          })
          wx.showToast({
            title: '身份更改成功',
            duration: 2000,
            icon: 'success',
          })
        },
      })

    //2.改变权限
    //NULL
    console.log(auth1,' ',auth2)
    if(divmemchosed.myauth!=auth1||divmemchosed.division.auth!=auth2)
      wx.request({
        url: app.globalData.serverurl+'change_DA',
        complete: (res) => {},
        data: {
          did:mydivision.id,
          gid:mygroup.gid,
          pid:divmemchosed.pid,
          auth1:auth1,
          auth2:auth2
        },
        success: (result) => {
          if(result.data.flag){
            divmemchosed.auth=auth1
            divmemchosed.division.auth=auth2
            this.setData({
              divmember:this.data.divmember
            })
            console.log(this.data.divmember)
            wx.showToast({
              title: '更改成功',
              complete: (res) => {},
              duration: 2000,
              fail: (res) => {},
              icon: 'success',
              success: (res) => {},
            })
          }
        },
      })
  },

  loadPageData(){
    var divmember=this.data.divmember
    var mydivision=this.data.mydivision
    var authtype=this.data.authtype

    if(mydivision.authgroup)//确定本部门部长可授予的权限
      for (let i = 0; i < 6; i++) 
        if(!Number(mydivision.auth[i]))
          authtype[0].authlist[i].disable=1
        
    for (let i = 0; i < divmember.length; i++) {//将本人放置第一位
      if(divmember[i].pid==this.data.useropenid){
        var membert=divmember[i]
        divmember[i]=divmember[0]
        divmember[0]=membert
        break
      }
    }
    //console.log(divmember)
    this.setData({
      divmember:divmember,
      authtype:authtype,
      count:this.data.count+1
    })
  }
}) 

//  test(){
//     wx.request({
//       url: 'url',//链接
//       data: data,//发送数据
//       dataType: dataType,//数据类型（不必要）
//       header: header,//header（不是post不必要）
//       method: method,//get或post（get：数据写在链接里，post：数据不在链接里，例机密数据或图片）
//       responseType: responseType,//返回类型（不必要）
//       success: (result) => {},//请求成功后返回数据（result）查看处理
//       fail: (res) => {},//请求失败后错误信息（res）查看处理
//       complete: (res) => {},//请求返回过程完成后信息（res）查看处理（不确定请求是否成功时用）
//     })
//   }