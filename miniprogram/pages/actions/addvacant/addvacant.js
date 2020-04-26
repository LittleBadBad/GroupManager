// pages/actions/duty/duty.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        useropenid:'',
        duty:'',
        memberlist:'',

        vacant:[],
        limit:8,

        modelist:["复选模式","单选-凑合","单选-可以"],
        i:0,

        note:'',
        count:0
    },

    loadPageData(){
        wx.showLoading({
            title: '加载上次提交中',
            mask: true,
          })
          var duty=this.data.duty
          wx.request({
            url: app.globalData.serverurl+'v3/GetmeDuty',
            complete: (res) => {wx.hideLoading()},
            data: {
                pid:this.data.useropenid,
                duid:duty.duid
            },
            fail: (res) => {},
            header: {
              'content-type':'application/x-www-form-urlencoded'
            },
            method: 'POST',
            success: (result) => {
                console.log(result)
                if(result.data.flag){
                    var vacant=result.data.vacant
                    var vacantlocal=[]
                    var count=0
                    if(vacant){
                      for(let i in duty.sln.timelist.start){
                          vacantlocal[i]=new Array()
                          for(let j in duty.date)
                              vacantlocal[i][j]=vacant[count++]
                      }
                    this.setData({
                        vacant:vacantlocal,
                        count:this.data.count+1
                    })
                  }
                }
            },
          })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that=this
        const eventChannel = this.getOpenerEventChannel()
        eventChannel.on('getData',function(data){
            var duty=data.duty
            var vacant=[]
            var limit=duty.sln.timelist.start.length*duty.date.length
            for(let i in duty.sln.timelist.start)
                vacant[i]=new Array()//横j 竖i
            that.setData({
                useropenid:data.useropenid,
                duty:data.duty,
                vacant:vacant,
                limit:limit*0.5,

                memberlist:data.memberlist
            })
            that.loadPageData()
        })
    },
    onShow(){
        if(this.data.count)
            this.loadPageData()
    },
    addVacant(e){
        console.log(e)
        var i=e.currentTarget.dataset.index
        var j=e.currentTarget.dataset.item
        var vacant=this.data.vacant
        //console.log(this.data.i)
        if(!vacant[i][j])
            if(!Number(this.data.i))
                    wx.showActionSheet({
                        itemList: ['凑合可以','可以'],
                        complete: (res) => {},
                        fail: (res) => {},
                        success: (result) => {
                            if(!result.cancel)
                              vacant[i][j]=result.tapIndex + 1
                              this.setData({
                                  vacant:vacant
                              })
                        },
                    })
            else
                vacant[i][j]=Number(this.data.i),this.setData({vacant:vacant})
        else
            vacant[i][j]=!vacant[i][j],this.setData({vacant:vacant})
        
    },
    changeMode(e){
        this.setData({i:e.detail.value})
    },
    submitVacant(){
        var pid=this.data.useropenid
        var duty=this.data.duty
        var vacant=this.data.vacant
        var vacantstr=""
        var invalidcount=0,likecount=0
        var limit=this.data.limit
        console.log(duty,pid)
        for(let i in duty.sln.timelist.start)
            for(let j in duty.date)
                if(vacant[i][j])
                    vacantstr+=String(vacant[i][j])
                else
                    vacantstr+="0"
        console.log(vacantstr)
        
        for(let i in vacantstr)
            if(!Number(vacantstr[i]))
                invalidcount++
        //console.log(vacantstr.length-invalidcount<limit)
        if(vacantstr.length-invalidcount<limit)
            wx.showModal({
              confirmColor: 'grey',
              confirmText: '确定',
              content: '请至少选择'+limit+'班',
              showCancel: false,
            })
        else
            wx.showLoading({
              title: '上传中',
              complete: (res) => {},
              fail: (res) => {},
              mask: true,
              success: (res) => {
                  wx.request({
                    url: app.globalData.serverurl+'v3/JoinDuty',
                    complete: (res) => {wx.hideLoading()},
                    data: {
                        pid:pid,
                        duid:duty.duid,
                        vacant:vacantstr
                    },
                    fail: (res) => {},
                    header: {
                        'content-type':'application/x-www-form-urlencoded'
                      },
                    method: 'POST',
                    success: (result) => {
                        console.log(result)
                        if(result.data.flag){
                            wx.showToast({
                              title: '上传成功',
                              duration: 2000,
                              mask: true,
                            })
                        }
                    },
                  })
              },
            })
    },

    toArrange(){
        wx.navigateTo({
          url: '../arrange/arrange',
          complete: (res) => {},
          fail: (res) => {},
          success: (result) => {
            result.eventChannel.emit('getData',{
                duty:this.data.duty,

                memberlist:this.data.memberlist
            })
          },
        })
    }
})
// var text='Hello world, Hello world';
// var b= text.replace('world','zhengxiaoya');  // 找到字符串中的第一个'world',并把它替换为'zhengxiaoya'
// var c=text.replace(/world/g,'zhengxiaoya');   // 用正则表达式去匹配所有的'world',替换为'zhengxiaoya'
// var d=text.replace(/hello/gi,'Hi')           // 忽略大小写替换所有匹配
// console.log("---today---",b);                // ---today--- Hello zhengxiaoya, Hello world
// console.log("---today c---",c);              // Hello zhengxiaoya, Hello zhengxiaoya
// console.log("---d----",d);                  //---d---- Hi world, Hi world