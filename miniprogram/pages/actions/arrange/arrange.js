const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        duty:'',
        vacant:'',

        memberlist:'',

        pidlist:'',

        perperson:0,
        perclass:0,

        num_per_class:[],

        arrangecount:0,
        chart:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that=this
        const eventChannel = this.getOpenerEventChannel()
        eventChannel.on('getData',function(data){
            var duty=data.duty
            that.setData({
                duty:duty,
                memberlist:data.memberlist,
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
        wx.showLoading({
          title: '加载参与人中',
          mask: true,
        })
        var duty=this.data.duty
        var memberlist=this.data.memberlist
        wx.request({
          url: app.globalData.serverurl+'v3/GetallDuty',
          complete: (res) => {wx.hideLoading()},
          data: {
              duid:duty.duid
          },
          fail: (res) => {},
          header:{
            'content-type':'application/x-www-form-urlencoded'
          },
          method: 'POST',
          success: (result) => {
              //console.log(result.data)
              if(result.data.flag){
                  var pidlist=result.data.pidlist
                  for(let i in pidlist)
                    for(let j in memberlist)
                        if(pidlist[i].pid==memberlist[j].pid)
                            pidlist[i].avatar=memberlist[j].avatar,pidlist[i].name=memberlist[j].name
                this.setData({pidlist:pidlist})
              }
          },
        })
    },
    viewVacant(e){
        //console.log(e)
        var pchosed=e.currentTarget.dataset.item
        var duty=this.data.duty
        var vacant=[]
        var count=0
        if(pchosed.vacant){
          for(let i in duty.sln.timelist.start){
              vacant[i]=new Array()
              for(let j in duty.date)
                  vacant[i][j]=Number(pchosed.vacant[count++])
          }
          this.setData({vacant:vacant})
          //console.log(this.data.vacant)
        }
    },

    chgPerclass(e){
        var perclass=Number(e.detail.value)+1
        var num_per_class=this.data.num_per_class
        var duty=this.data.duty
        for(let i in duty.sln.timelist.start){
            num_per_class[i]=[]
            for(let j in duty.date)
                num_per_class[i][j]=perclass
        }
        //console.log(num_per_class)
        this.setData({
            perclass:perclass,
            num_per_class:num_per_class,
            arrangecount:0
        })
    },

    chgPerperson(e){
        var perperson=Number(e.detail.value)+1
        var pidlist=this.data.pidlist
        for(let i in pidlist)
            pidlist[i].num=perperson
        this.setData({
            perperson:perperson,
            pidlist:pidlist,
            arrangecount:0
        })
    },
    chgPClassNUm(e){
        console.log(e)
        var i=e.currentTarget.dataset.index
        var pidlist=this.data.pidlist
        var pchosed=pidlist[i]
        var num=Number(e.detail.value)+1
        pchosed.num=num
        this.setData({
            pidlist:pidlist,
            arrangecount:0
        })
    },
    chgClassNum(e){
        var i=e.currentTarget.dataset.index
        var j=e.currentTarget.dataset.item
        var value=Number(e.detail.value)+1
        var num_per_class=this.data.num_per_class
        num_per_class[i][j]=value
        this.setData({
            num_per_class:num_per_class,
            arrangecount:0
        })
    },
    arrange(){
        var perclass=this.data.perclass
        var perperson=this.data.perperson
        var arrangecount=this.data.arrangecount
        if(!perclass)
            wx.showModal({
              confirmColor: 'grey',
              confirmText: '确定',
              content: '每班至少一人',
              showCancel: false,
            })
        else if(!perperson)
            wx.showModal({
                confirmColor: 'grey',
                confirmText: '确定',
                content: '每人至少一班',
                showCancel: false,
            })
        else{
            if(!arrangecount)
                this.submitArrange(arrangecount)
            else
                wx.showModal({
                cancelColor: 'grey',
                cancelText: '取消',
                complete: (res) => {},
                confirmColor: 'green',
                confirmText: '确定',
                content: '将按照上次安排排班，确定？',
                fail: (res) => {},
                showCancel: true,
                success: (result) => {
                    if(result.confirm)
                        this.submitArrange(arrangecount)
                },
                })

        }
    },

    submitArrange(arrangecount){
        var num_per_class=this.data.num_per_class
        var num_per_class_str=""
        var duty=this.data.duty
        var pidlist=this.data.pidlist
        console.log(pidlist)
        console.log(duty)
        for(let i in num_per_class)
            for(let j in num_per_class[i])
                num_per_class_str+=String(num_per_class[i][j])
        var memberlist=JSON.stringify(pidlist)
        //console.log(memberlist)
        wx.request({
          url: app.globalData.serverurl+'v3/StartDuty',
          complete: (res) => {},
          data: {
              num_per_class:num_per_class_str,
              duid:duty.duid,
              memberlist:memberlist
          },
          fail: (res) => {},
          header: {
            'content-type':'application/x-www-form-urlencoded'
          },
          method: 'POST',
          success: (result) => {
                console.log(result)
                if(result.data.flag){
                    var dutychart=result.data.dutychart
                    var chart=[]
                    var n=0
                    for(let i in duty.sln.timelist.start){
                        chart[i]=[]
                        for(let j in duty.date){
                            chart[i][j]={}
                            chart[i][j].show=1
                            chart[i][j].pidlist=dutychart[n++].split(",")
                            chart[i][j].namelist=[]
                            for(let i2 in chart[i][j].pidlist)
                                for(let j2 in pidlist)
                                    if(pidlist[j2].pid==chart[i][j].pidlist[i2])
                                        chart[i][j].namelist[i2]=pidlist[j2].name
                        }
                    }
                    console.log(chart)
                    this.setData({chart:chart,arrangecount:arrangecount+1})
                }
            },
        })
    },

    publish(){
        wx.showModal({
          cancelColor: 'gery',
          cancelText: '取消',
          complete: (res) => {},
          confirmColor: 'red',
          confirmText: '确定',
          content: '一旦提交无法更改，确定？',
          fail: (res) => {},
          showCancel: true,
          success: (result) => {
              if(result.confirm)
                wx.navigateBack({
                  delta: 2,
                  success:res=>{
                      wx.showToast({
                        title: '发布成功',
                        duration: 2000,
                        mask: true,
                      })
                  }
                })
          },
        })
    }
})

