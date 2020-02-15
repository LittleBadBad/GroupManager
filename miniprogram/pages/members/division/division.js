// pages/division/division.js
var util = require('../../../utils/util.js');

Page({

  data: {
    groupid:'',

    divisionlist:[],
    memberlist:[],

    divchosed:'',
    divclicked:0,
    divmember:{},
    editing:0,

    addclicked:0,
    nameinputing:0,
    nameunfilled:0,
    introinputing:0,
    i:'',
    authlist:[
      {name:'群值班发布',clicked:0},
      {name:'群活动信息管理',clicked:0},
      {name:'群资金管理',clicked:0},
      {name:'群设备信息管理',clicked:0},
      {name:'群设备借用管理',clicked:0},
      {name:'群成员增删',clicked:0}],


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      groupid:options.gid
    })
    const eventChannel = this.getOpenerEventChannel()
    var _this=this
    eventChannel.on('acceptdiv&mem', function(data) {//上一个页面的数据放本页面调用
     _this.setData({
       divisionlist:data.divisionlist,
       memberlist:data.memberlist
     })
    })
    console.log(this.data.memberlist)
    console.log(this.data.divisionlist)
  },

  clickAdd(){
  this.setData({
    addclicked:1
  })
  },

  toggleAdd(){
    this.setData({
      addclicked:0
    })
  },

  nameFocus(e){
    console.log(e)
    if(e.detail.value=="例：公关部")
      this.setData({
        nameinputing:1
      })
  },

  nameBlur(e){
    console.log(e)
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
    this.setData({
      i:e.detail.value
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
    console.log(e)
    var time = util.formatTime(new Date())
    if(e.detail.value.name=='例：公关部')
      this.setData({
        nameunfilled:1
      })
    else{
      var auth=''
      for (let i = 0; i < this.data.authlist.length; i++) {
        auth+=String(this.data.authlist[i].clicked ? 1 : 0)
      }
      let i=this.data.i
      var url='http://st.titordong.cn/CrtDivision?gid='+this.data.groupid
      +'&&pid='+( i ? this.data.memberlist[i].pid : '')+'&&name='+e.detail.value.name
      +'&&regtime='+time+'&&intro='+e.detail.value.intro+'&&auth='+auth
      wx.request({
        url: url,
        complete: (res) => {},
        fail: (res) => {},
        success: (result) => {
          console.log(result)
          if (result.data.flag) {
            wx.showToast({
              title: '创建成功',
              complete: (res) => {},
              fail: (res) => {},
              icon: 'success',
              success: (res) => {},
            })
            this.setData({
              addclicked:0
            })
          }
        },
      })
    }
  },

//部门信息查看弹窗
clickDiv(e){
  let index = e.currentTarget.dataset.index
  var divison = this.data.divisionlist[index]
  var memberlist = this.data.memberlist
  var divmember=new Array()
  let n=0;
  for (let i = 0; i < memberlist.length; i++) //部员列表生成
    for (let j = 0; j < memberlist[i].divisionlist.length; j++) 
      if (memberlist[i].divisionlist[j].did==divison.did){
        divmember[n]=memberlist[i]
        divmember[n++].division=memberlist[i].divisionlist[j]
      }
  //console.log(divmember)
  this.setData({
    divclicked:1,
    divchosed:divison,
    divmember:divmember
  })
},

toggleDiv(){
  this.setData({
    divclicked:0
  })
},

editDiv(){
  var divmember=this.data.divmember
  var memberlist=this.data.memberlist
  for (let i = 0; i < divmember.length; i++)
    if(divmember[i].division.divstatus=='部长')
      for (let j = 0; j < memberlist.length; j++) 
        if(memberlist[j].pid==divmember[i].pid)
          this.setData({i:j})
  
  //this.data.divchosed.auth

  console.log('i',this.data.i)
  this.setData({
    divclicked:0,
    addclicked:1,
    editing:1
  })
}
})