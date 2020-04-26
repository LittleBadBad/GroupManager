// pages/division/division.js
import { formatTime } from '../../../utils/util.js';
const app = getApp()
Page({

  data: {
    subdisable:0,

    minister:'',
    mygroup:'',

    groupid:'',
    ischairman:0,
    useropenid:'',

    divisionlist:[],
    memberlist:[],

    candidates:[],

    divchosed:'',
    divclicked:0,
    divmember:{},
    editing:0,

    addclicked:0,
    nameinputing:0,
    nameunfilled:0,
    introinputing:0,
    i:'null',
    authlist:[
      {name:'群值班发布',clicked:0},
      {name:'群活动信息管理',clicked:0},
      {name:'群资金管理',clicked:0},
      {name:'群设备信息管理',clicked:0},
      {name:'群设备借用管理',clicked:0},
      {name:'群成员增删',clicked:0}],

    count:0
  },

  loadPageData(){
    var memberlist=this.data.memberlist
    var candidates=new Array()
    var n=0
    for (let index in memberlist)
      memberlist[index].status=='成员' ? candidates[n++]=memberlist[index]:''
    this.setData({
      candidates:candidates,
      count:this.data.count++
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const eventChannel = this.getOpenerEventChannel()
    var _this=this
    eventChannel.on('acceptdiv&mem', function(data) {//上一个页面的数据放本页面调用
     _this.setData({
       mygroup:data.mygroup,
       useropenid:data.useropenid,
       divisionlist:data.divisionlist,
       memberlist:data.memberlist
     })
     _this.loadPageData()
     console.log(_this.data.candidates)
    })
  },

  onShow(){
    if(this.data.count)
      this.loadPageData()
  },

  clickAdd(){
    var authlist=this.data.authlist
    for (let index = 0; index < 6; index++)
      authlist[index].clicked = 0
     this.setData({
      addclicked:1,
      authlist:authlist
    })
  },

  toggleAdd(){
    this.setData({
      addclicked:0,
      nameinputing:0,
      i:'null'
    })
  },

  nameFocus(e){
    //console.log(e)
    if(e.detail.value=="例：公关部")
      this.setData({
        nameinputing:1
      })
  },

  nameBlur(e){
    //console.log(e)
    if(!e.detail.value)
      this.setData({
        nameinputing:0
      })
  },

  introFocus(e){
    this.setData({
      introinputing:1
    })
  },

  introBlur(e){
    this.setData({
      introinputing:0
    })
  },

  chgMinister(e){
    console.log(e)
    var i=e.detail.value
    var candidates=this.data.candidates
    var minister=this.data.minister
    this.setData({
      i:i
    })
    if(minister.pid&&candidates[i].pid!=minister.pid)
      wx.showToast({
        title: '原部长将变为部员',
        duration: 2000,
      })
  },

  clickAuth(e){
    let i=e.currentTarget.dataset.index
    var authlist=this.data.authlist
    authlist[i].clicked=!authlist[i].clicked
    this.setData({
      authlist:authlist
    })
  },

  submitDivision(e){
    //console.log(e)
    var divchosed=this.data.divchosed
    var editing=this.data.divchosed
    var candidates=this.data.candidates
    var minister=this.data.minister

    var time = formatTime(new Date())
    if(e.detail.value.name=='例：公关部')//未填写部门名
      this.setData({
        nameunfilled:1
      })
    else{
      this.setData({subdisable:1})
      var auth=''
      for (let i = 0; i < this.data.authlist.length; i++) {
        auth+=String(this.data.authlist[i].clicked ? 1 : 0)
      }
      var divisionnew=new Object()
      divisionnew.name=e.detail.value.name
      divisionnew.intro=e.detail.value.intro
      divisionnew.auth=auth
      divisionnew.id=editing ?divchosed.id : ''
      var i=this.data.i
      console.log(candidates[i],minister)
      if(divisionnew.name!=divchosed.name||divisionnew.intro!=divchosed.intro||divisionnew.auth!=divchosed.auth||(i!='null'&&candidates[i].pid!=minister.pid))//四项有一项做过修改
        wx.request({
          url: app.globalData.serverurl+'CrtDivision',
          data:{
            gid:this.data.mygroup.gid,
            did:divisionnew.id ? divisionnew.id:'',
            pid:i!='null' ? candidates[i].pid : '',
            name:divisionnew.name,
            regtime:time,
            intro:divisionnew.intro,
            auth:divisionnew.auth
          },
          method:'GET',
          success: (result) => {
            //console.log(editing ? '修改成功':'创建成功',result)
            if (result.data.flag) {
              wx.showToast({
                title: editing ? '修改成功':'创建成功',
                icon: 'success',
              })
              var divisionlist=this.data.divisionlist
              
              if(editing){//更新divisionlist表
                for (let index = 0; index < divisionlist.length; index++)
                  divisionlist[index].id==divchosed.id ? 
                    divisionlist[index]=divisionnew :''
                for (let i1 = 0; i1 < candidates.length; i1++) 
                  for (let i2 = 0; i2 < candidates[i1].divisionlist.length; i2++) 
                    if(candidates[i1].divisionlist[i2].id==divisionnew.id)
                      candidates[i1].divisionlist[i2].name=divisionnew.name
              }
              else{
                divisionnew.id=result.data.id
                if(!divisionlist)divisionlist=new Array()
                divisionlist[divisionlist?divisionlist.length:0]=divisionnew
              }
              //console.log(divisionnew)
              if(i!='null'){//选择了部长
                divisionnew.status='部长'
                divisionnew.jointime=time
                if(editing){//在编辑
                  //1. 把本部原部长贬为部员
                  for (let index1 = 0; index1 < candidates.length; index1++)
                    for (let index2 = 0; index2 < candidates[index1].divisionlist.length; index2++) 
                      if(candidates[index1].divisionlist[index2].id==divisionnew.id&&candidates[index1].divisionlist[index2].status=='部长')
                      candidates[index1].divisionlist[index2].status='部员'
                  //2. 把本人变为本部门部长
                  let flag=0
                  //若本人在此部门则将其变为部长
                  for (let index = 0; index < candidates[i].divisionlist.length; index++) 
                    if(candidates[i].divisionlist[index].id==divisionnew.id)
                      {candidates[i].divisionlist[index].status='部长',flag=1}
                  if(!flag)
                    candidates[i].divisionlist[candidates[i].divisionlist.length]=divisionnew
                }else//在创建
                  candidates[i].divisionlist[candidates[i].divisionlist.length]=divisionnew
              }
              this.setData({
                divisionlist:divisionlist,
                divchosed:'',
                addclicked:0,
                i:'null',
                editing:0,
                candidates:candidates,
                subdisable:0
              })
            }
          },
        })
      else
      wx.showToast({
        title: '未做更改',
        duration: 2000,
        icon:'success',
        success:res=>{
          this.setData({addclicked:0})
        }
      })
    }
  },

//部门信息查看弹窗
clickDiv(e){
  let index = e.currentTarget.dataset.index
  var divchosed = this.data.divisionlist[index]
  var candidates = this.data.candidates
  var divmember=new Array()
  var minister = new Object()
  let n=0;
  for (let i = 0; i < candidates.length; i++) //部员列表生成
    for (let j = 0; j < candidates[i].divisionlist.length; j++) 
      if (candidates[i].divisionlist[j].id==divchosed.id&&candidates[i].status=='成员'&&!candidates[i].divisionlist[j].dismissed){
        divmember[n]=candidates[i]
        divmember[n++].division=candidates[i].divisionlist[j]
        candidates[i].divisionlist[j].status=='部长' ? minister=candidates[i]:''
      }
  console.log(this.data.i,minister)
  this.setData({
    minister:minister,
    divclicked:1,
    divchosed:divchosed,
    divmember:divmember
  })
},

toggleDiv(){
  this.setData({
    divclicked:0,
    divchosed:''
  })
},

//部门编辑弹窗
editDiv(){
  console.log(this.data.i,this.data.minister)
  this.setData({editing:1,nameinputing:1})

  var authlist=this.data.authlist
  var divchosed=this.data.divchosed
  
  for (let index = 0; index < divchosed.auth.length; index++)//被选部门的权限查看
    divchosed.auth[index]=='1' ? authlist[index].clicked = 1 :''

  this.setData({
    divchosed:divchosed,
    authlist:authlist,
    divclicked:0,//部门弹窗退下
    addclicked:1,//添加弹窗出来
  })
},

//部门解散
dissmiss(){
  wx.showModal({
    cancelColor: 'green',
    cancelText: '取消',
    complete: (res) => {},
    confirmColor: 'red',
    confirmText: '确定',
    content: '确定解散本部门？你将失去本部门所有信息',
    fail: (res) => {},
    showCancel: true,
    success: (result) => {
      var divchosed=this.data.divchosed
      var mygroup=this.data.mygroup
      if(result.confirm)
        wx.request({
          url: app.globalData.serverurl+'DeleteDivision',
          complete: (res) => {},
          data: {
            did:divchosed.id,
            gid:mygroup.gid
          },
          success: (result) => {
          if (result.data.flag)
            wx.showToast({
              title: '解散成功',
              duration:2000,
              icon: 'success',
              success: (res) => {
                var divisionlist=this.data.divisionlist
                var memberlist=this.data.memberlist
                //删除列表中此部门信息
                for (let index = 0; index < divisionlist.length; index++) 
                  divisionlist[index].id==divchosed.id ? divisionlist[index].deleted=1:''
                
                //删除成员中此部门信息
                for (let index1 = 0; index1 < memberlist.length; index1++) 
                  for (let index2 = 0; index2 < memberlist[index1].divisionlist.length; index2++) 
                    if(memberlist[index1].divisionlist[index2].id==divchosed.id)
                      memberlist[index1].divisionlist[index2].dismissed=1
                console.log(divchosed)
                console.log(memberlist)
                this.setData({
                  memberlist:memberlist,
                  divisionlist:divisionlist,
                  divclicked:0,
                })
              },
            })
          },
        })
      else
        wx.showToast({
          title: '已取消',
          complete: (res) => {},
          duration: 2000,
          fail: (res) => {},
          icon: 'none',
          mask: true,
          success: (res) => {},
        })
    },
    title: '部门解散',
  })


}
})