// pages/actions/addduty/addduty.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectingsln:0,
    addingsln:0,

    intervallist:[],

    useropenid:'',
    mygroup:'',
    mydivlist:'',
    namelist:'',

    slnlist:'',//方案list
    slnchoosed:'',
    datelist:[],

    unitlist:'',
    unit:'',

    newsln:{
      name:'',
      timelist:{
        start:['08:00','11:00'],
        end:['11:00','12:00']
      }
    },

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('getData',function(data){
      var mydivlist=data.mydivlist
      var mygroup=data.mygroup
      var unitlist=new Array()
      if(Number(mygroup.auth[0]))
        unitlist[0]="社团"
      for (let i in mydivlist)
        if(Number(mydivlist[i].authfinal[3]))
          unitlist[i+1]=mydivlist[i].name
      console.log(data)
      that.setData({
        useropenid:data.useropenid,
        mygroup:data.mygroup,
        mydivlist:data.mydivlist,
        namelist:data.memberlist,
        unitlist:unitlist,
        slnlist:data.slnlist
      })
    })
  },
  
  onShow(){
  },

  openDialog: function () {
    this.setData({
        selectingsln: true
    })
  },
  closeDialog: function () {
      this.setData({
          selectingsln: false
      })
  },

  addSolution(){
    this.setData({
      addingsln:1
    })
  },
  toggleAdd(){
    this.setData({
      addingsln:0
    })
  },
  inputSlnName(e){
    var value=e.detail.value
    var newsln=this.data.newsln
    newsln.name=value
    this.setData({newsln:newsln})
  },
  slctTime(e){
    var id=e.currentTarget.id
    var value=e.detail.value
    var i=e.currentTarget.dataset.index
    var newsln=this.data.newsln
    var timelist=this.data.newsln.timelist
    if(id)
      timelist.start[i]=value
    else
      timelist.end[i]=value
    this.setData({newsln:newsln})
  },

  addTimeBlock(){
    var newsln=this.data.newsln
    var timelist=this.data.newsln.timelist
    var length=timelist.start.length
    timelist.start[length]=timelist.end[length-1]
    timelist.end[length]='点击选择'
    this.setData({newsln:newsln})
  },
  deleteTimeBlock(e){
    var newsln=this.data.newsln
    var i=e.currentTarget.dataset.index
    var timelist=this.data.newsln.timelist
    var start=[],end=[]
    for(let j in timelist.start)
      if(i!=j){
        start=start.concat(timelist.start[j])
        end=end.concat(timelist.end[j])
      }
    timelist.start=start
    timelist.end=end
    this.setData({newsln:newsln})
  },

  createSln(){
    var newsln=this.data.newsln
    var timelist=newsln.timelist
    var mygroup=this.data.mygroup
    if(!newsln.name)
      wx.showModal({
        confirmColor: 'grey',
        confirmText: '确认',
        content: '请输入方案名',
        showCancel:false
      })
    else{
      wx.showLoading({
        title: '创建中',
        mask: true,
      })
      var time=[]
      for(let i in timelist.start)
        time[i]=timelist.start[i]+'-'+timelist.end[i]
      newsln.time=time
      newsln.gid=mygroup.gid
      wx.request({
        url: app.globalData.serverurl+'AddSolu',
        complete: (res) => {
          wx.hideLoading()
        },
        data: newsln,
        fail:(res)=>{
          wx.showModal({
            complete: (res) => {},
            confirmColor: 'grey',
            confirmText: '确定',
            content: res.errMsg,
            showCancel: false,
          })
        },
        success: (result) => {
          if(result.data.flag){
            wx.showToast({
              title: '创建成功',
            })
            newsln.sid=result.data.sid
            var slnlist=this.data.slnlist
            this.setData({
              newsln:'',
              slnlist:slnlist.concat(newsln),
              addingsln:0
            })
          }
        },
      })
    }
  },
  selectSln(e){
    var i=e.currentTarget.dataset.index
    var slnlist=this.data.slnlist
    this.setData({
      slnchoosed:slnlist[i],
      selectingsln:0
    })
  },
  deleteSln(e){
    var i=e.currentTarget.dataset.index
    var slnlist=this.data.slnlist
    wx.showModal({
      cancelColor: 'grey',
      cancelText: '取消',
      complete: (res) => {},
      confirmColor: 'red',
      confirmText: '确认',
      content: '确认删除方案 '+ slnlist[i].name,
      fail: (res) => {},
      showCancel: true,
      success: (result) => {
        if(result.confirm){
          wx.showLoading({
            title: '删除方案中',
            mask: true,
          })
          wx.request({
            url: app.globalData.serverurl+'DeleteSolu',
            complete: (res) => {
              wx.hideLoading()
            },
            data: {
              sid:slnlist[i].sid
            },
            success: (result) => {
              if(result.data.flag){
                var slnlistnew=[]
                for(let j in slnlist)
                  if(j!=i)
                    slnlistnew=slnlistnew.concat(slnlist[j])
                this.setData({
                  slnlist:slnlistnew,
                  selectingsln:0
                })
                wx.showToast({
                  title: '删除成功',
                  duration: 2000,
                })
              }
            },
          })
        }
      },
    })
  },
  bindUnitChange(e){
    var i=e.detail.value
    var unitlist=this.data.unitlist
    this.setData({unit:unitlist[i]})
  },

  bindDateChange(e){
    console.log(e)
    var datestr=e.detail.value
    var arr=datestr.split("-")
    var date=new Date(datestr)
    var day=date.getDay()
    var datelist=this.data.datelist
    var dateitem=new Object()
    var flag=0
    dateitem.date=date
    dateitem.dateshow=arr[1]+'-'+arr[2]
    dateitem.day='周'+this.NtoC(day)
    console.log(date)
    for(let i in datelist){
      if(datelist[i].dateshow==dateitem.dateshow)
        flag=1
    }
    if(!flag){
      datelist=datelist.concat(dateitem)
      //console.log(datelist[0].date.getTime())
      datelist = this.sortDate(datelist)
      this.setData({
        datelist:datelist
      })
    }
  },

  deleteDate(e){
    var i=e.currentTarget.dataset.index
    var datelist=this.data.datelist
    var datelistnew=[]
    for(let j in datelist)
      if(i!=j)
        datelistnew=datelistnew.concat(datelist[j])
    this.setData({datelist:datelistnew})
  },

  publish(){//发布值班
    var duty=new Object
    var datelist=this.data.datelist
    var sln=this.data.slnchoosed
    var unit=this.data.unit
    var mydivlist=this.data.mydivlist
    var pid=this.data.useropenid
    var mygroup=this.data.mygroup
    if(!unit)
      wx.showModal({
        confirmColor: 'grey',
        confirmText: '确定',
        content: '请选择发布对象',
        showCancel:false
      })
    else if(!sln)
      wx.showModal({
        confirmColor: 'grey',
        confirmText: '确定',
        content: '请选择方案',
        showCancel:false
      })
    else if(!datelist.length)
      wx.showModal({
        confirmColor: 'grey',
        confirmText: '确定',
        content: '请至少添加一天',
        showCancel:false
      })
    else{
      duty.sid=sln.sid
      duty.pid=pid
      if(unit=='社团')
        duty.type=1,duty.id=mygroup.gid
      else
        for(let i in mydivlist)
          if(unit==mydivlist[i],name)
            duty.type=0,duty.id=mydivlist[i].id
      duty.date=[]
      for(let i in datelist)
        duty.date=duty.date.concat(datelist[i].dateshow + ' ' + datelist[i].day)
      wx.showLoading({
        title: '上传中',
        mask: true,
      })
      console.log(duty)
      wx.request({
        url: app.globalData.serverurl+'v3/AddDuty',
        complete: (res) => {
          wx.hideLoading()
        },
        data: duty,
        fail: (res) => {},
        method: 'POST',
        header:{
          'content-type':'application/x-www-form-urlencoded'
        },
        success: (result) => {
          console.log(result)
          if(result.data.flag){
            wx.navigateBack({
              delta: 1,
            })
          }else{
            wx.showToast({
              title: 'erro',
              complete: (res) => {},
              duration: 2000,
              icon: 'none',
              mask: true,
              success: (res) => {},
            })
          }
        },
      })
    }
  },

  NtoC(num){
    switch (num) {
      case 0:return '一';
      case 1:return '二';
      case 2:return '三';
      case 3:return '四';
      case 4:return '五';
      case 5:return '六';
      case 6:return '日';
      default:return 'erro'
    }
  },
  sortDate(datelist){
    for(let i=0;i<datelist.length;i++){
      var flag=0
      for(let j=datelist.length-1;j>i;j--)
        if(datelist[j-1].date.getTime()>datelist[j].date.getTime()){
          flag=1
          let t=datelist[j-1]
          datelist[j-1]=datelist[j]
          datelist[j]=t
        }
      if(!flag)
        break;
    }
    return datelist
  }
  // str="jpg|bmp|gif|ico|png";
  // arr=theString.split("|");
  //  //arr是一个包含字符值"jpg"、"bmp"、"gif"、"ico"和"png"的数组

})