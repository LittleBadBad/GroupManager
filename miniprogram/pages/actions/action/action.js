// pages/actions/action/action.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    useropenid:'',

    mygroup:[],
    mydivlist:[],

    auth:0,//活动管理权限（未完善）

    memberlist:[],

    actions:'',

    action:'',
    action2:'',
    
    editing:0,

    editingname:false,
    editingparticipants:false,
    inputVal:'',
    editingintro:false,

    limit:9
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel()
    var that=this
    console.log(this.data.editingname)
    eventChannel.on('getData',function(data){
      var action=data.action
      var mygroup=data.mygroup
      var mydivlist=data.mydivlist
      var auth=0
      if(action.type==1){
        action.unit=mygroup.name
        auth=Number(mygroup.auth)
      }
      else
        for(div in mydivlist)
          if(action.id==div.id){
            action.unit=div.name
            auth=div.authfinal
          }
      that.setData({
        useropenid:data.useropenid,
        mygroup:data.mygroup,
        mydivlist:data.mydivlist,
        memberlist:data.memberlist,
        action:action,
        actions:data.actions
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

  },

  previewImage: function(e){
    var i=e.currentTarget.dataset.index
    var files=this.data.action.imglist
      wx.previewImage({
          current: files[i], // 当前显示图片的http链接
          urls: files // 需要预览的图片http链接列表
      })
  },

  editAction(){
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
          action:this.data.action
        })
      },
    })
  },

  editAction(){
    var action2=new Object()
    var action=this.data.action
    action2.type=action.type
    action2.id=action.id
    action2.imglist=action.imglist? action.imglist:[]
    action2.intro=action.intro
    action2.location=action.location
    action2.name=action.name
    action2.participats=action.participats ? action.participats:[]
    action2.unit=action.unit
    action2.date=action.date
    action2.imgdelete=new Array()
    this.setData({
      editing:1,
      action2:action2
    })
  },

  cancelEdit(){
    this.setData({
      editing:0
    })
  },

  edit(e){
    console.log(e)
    var id=e.currentTarget.id
    switch(id){
      case 'name':
        this.setData({editingname:true});break;
      case 'participats':
        this.setData({editingparticipants:true});break;
      case 'intro':
        this.setData({editingintro:true});break;
      default:
        wx.showToast({
          title: 'erro',
          duration: 2000,
          icon: 'none',
          mask: true,
        });break
    }
  },

  inputName(e){
    var value=e.detail.value
    console.log(value)
    var action2=this.data.action2
    action2.name=value
    this.setData({
      action2:action2
    })
  },

  toggleName(e){
    var id=e.currentTarget.id
    var action2=this.data.action2
    console.log(id,action2)
    if(!id){
      action2.name=this.data.action.name
    }
    this.setData({
      action2:action2,
      editingname:0
    })
  },

  alterDate(e){
    var action2=this.data.action2
    var date=e.detail.value
    action2.date=date
    this.setData({
      action2:action2,
    })
  },

  cancelChoose(e){
    console.log(e)
    var i=e.currentTarget.dataset.index
    var action2=this.data.action2
    var participats=action2.participats
    var participats2=new Array()
    var n=0
    for(let j in participats)
      if(j!=i)
        participats2[n++]=participats[j]
    action2.participats=participats2
    this.setData({
      action2:action2
    })
  },

  confirmInput(e){
    var newname=e.detail.value
    var action2=this.data.action2
    var participats=action2.participats
    action2.participats=participats.concat(newname)
    this.setData({action2:action2,inputVal:''})
  },

  tabName(e){
    var member=e.currentTarget.dataset.item
    var action2=this.data.action2
    var participats=action2.participats
    var flag=0
    for(var i in participats)
      if(participats[i]==member.name){
        flag=1
        wx.showModal({
          cancelColor: 'grey',
          cancelText: '否',
          confirmColor: 'red',
          confirmText: '是',
          content: '此人已存在，是否重复添加？',
          showCancel: true,
          success: (result) => {
            if(result.confirm){
              action2.participats = participats.concat(member.name)
              this.setData({action2:action2})
            }
          },
        })
        break;
      }
    if(!flag){
      action2.participats = participats.concat(member.name)
      this.setData({action2:action2})
    }
  },

  toggleParticipants(){
    this.setData({editingparticipants:0})
  },

  inputIntro(e){
    var value=e.detail.value
    var action2=this.data.action2
    action2.intro=value
    this.setData({
      action2:action2
    })
  },

  toggleIntro(e){
    var id=e.currentTarget.id
    var action2=this.data.action2
    //console.log(id,action2)
    if(!id){
      action2.intro=this.data.action.intro
    }
    this.setData({
      action2:action2,
      editingintro:0
    })
  },

  deleteImg(e){
    var i=e.currentTarget.dataset.index
    var img=e.currentTarget.dataset.item
    var action2=this.data.action2
    var imglist=action2.imglist
    var imglist2=new Array()
    var n=0
    for(let index in imglist)
      if(index!=i)
        imglist2[n++]=imglist[index]
    action2.imgdelete=action2.imgdelete.concat(img)
    action2.imglist=imglist2
    this.setData({action2:action2})
  },

  chooseImage: function (e) {
    var that = this;
    var files=this.data.action2.imglist
    var limit=this.data.limit
    var action2=this.data.action2
    wx.chooseImage({//res1选择
        count:limit-files.length,
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success:res1=> {
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            var files=res1.tempFilePaths
            wx.showLoading({
              title: '加载中',
              mask: true,
            })

            for(let index in files)
              wx.compressImage({
                src: files[index],
                complete: (res) => {
                  wx.hideLoading()
                },
                fail: (res) => {},
                quality: 1,
                success: (result) => {
                  console.log(result.tempFilePath)
                  action2.imglist=action2.imglist.concat(result.tempFilePath)
                  that.setData({
                    action2:action2
                  }); 
                },
              })
        }
    })
  },

  submitAlter(){
    var action2=this.data.action2
    var action=this.data.action
    action2.people=action2.participats
    console.log(action2)
    wx.showModal({
      cancelColor: 'grey',
      cancelText: '取消',
      complete: (res) => {},
      confirmColor: 'red',
      confirmText: '确认',
      content: '提交后原内容将消失，确认？',
      fail: (res) => {},
      showCancel: true,
      success: (result) => {
        if(result.confirm){
          wx.showLoading({
            title: '提交中',
            mask: true
          })
          wx.request({
            url: app.globalData.serverurl+'ChangeAction',
            complete: (res) => {
              wx.hideLoading()
            },
            data:action2,
            fail: (res) => {},
            success: (result1) => {
              console.log(result1)
              if(result1.data.flag){
                wx.showLoading({
                  title: '上传图片中',
                  mask: true
                })
                for(let i in action2.imglist){
                  wx.showLoading({
                    title: '正在处理第'+ i+1 +'张图片',
                    mask: true
                  })
                  let flag=0
                  for(let j in action.imglist)
                    if(action2.imglist[i]==action.imglist[j])
                      flag=1
                  if(flag==0)
                    wx.uploadFile({
                      filePath: action2.imglist[i],
                      name: 'cover',
                      url: app.globalData.serverurl+'AddActImg',
                      complete: (res) => {
                        if(i==action2.imglist.length-1)
                          wx.hideLoading()
                      },
                      fail: (res) => {},
                      formData: {
                        addr:result1.data.url
                      },
                      header: {
                        'content-type': 'multipart/form-data'
                      },
                      success: (result) => {
                        if(i==action2.imglist.length-1){
                          this.setData({
                            action:action2,
                            editing:false
                          })
                          wx.showToast({
                            title: '修改完成',
                            duration: 2000,
                          })
                        }
                      },
                    })
                }
                this.setData({
                  action:action2,
                  editing:false
                })
                wx.hideLoading()
              }
            },
          })
        }
      },
    })
  },
  deleteAction(){
    wx.showModal({
      cancelColor: 'grey',
      cancelText: '取消',
      complete: (res) => {},
      confirmColor: 'red',
      confirmText: '确定',
      content: '确认删除？活动无法恢复',
      fail: (res) => {},
      showCancel: true,
      success: (result) => {
        if(result.confirm){
          wx.showLoading({
            title: '删除中',
            mask: true,
          })
          wx.request({
            url: app.globalData.serverurl+'DeleteAction',
            complete: (res) => {
              wx.hideLoading()
            },
            data: {aid:this.data.action.aid},
            fail: (res) => {},
            success: (result2) => {
              console.log(result2)
              if(result2.data.flag){
                var actions=this.data.actions
                var actionsnew=[]
                for(let i in actions)
                  if(actions[i].aid!=this.data.action.id)
                    actionsnew=actionsnew.concat(actions[i])
                this.setData({
                  actions:actionsnew
                })
                wx.navigateBack({delta: 1})
                wx.showToast({
                  title: '删除成功',
                  duration:2000
                })
              }
            },
          })
        }
      },
    })
  }
})