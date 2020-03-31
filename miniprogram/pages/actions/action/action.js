// pages/actions/action/action.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    useropenid:'',

    mygroup:[],
    mydivlist:[],

    auth:0,

    memberlist:[],

    action:'',
    action2:'',
    
    editing:0,

    editingname:false,
    editingparticipants:false,
    editingintro:false
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
        action:action
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
    console.log(files)
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
    this.setData({
      editing:1
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

  toggleName(){
    this.setData({editingname:0})
  },

  toggleParticipants(){
    this.setData({editingparticipants:0})
  },

  toggleIntro(){
    this.setData({editingintro:0})
  }

})