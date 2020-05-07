// pages/devices/index/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        startpoint:[],

        useropenid:'',
        mygroup:'',
        memberlist:'',
        translate:0,

        devicelist:[
          {
            deid:"huvhjv",
            location:"uyfyugyu",
            type:"话筒",
            note:"只能唱歌不能吃",
            validnum:"5",
            place:"一组团三号楼207",
            usingnum:"4",
            imglist:["../../../images/1.jpg","../../../images/2.jpg"]
        },
        {
            deid:"huvhjv",
            location:"uyfyugyu",
            type:"rbq",
            note:"慢慢使用",
            validnum:"8",
            place:"一组团三号楼207",
            usingnum:"2",
            imglist:["../../../images/3.jpg","../../../images/4.jpg"],
        }
        ]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const eventChannel = this.getOpenerEventChannel()
        var that=this
        eventChannel.on('getData',function(data){
          that.setData({
            useropenid:data.pid,
            mygroup:data.group,
            memberlist:data.memberlist
          })
        })
    },

    onShow: function () {

    },

    tapdevice(e){
      console.log(e)
    },
    touchS(e){
      this.setData({
        startpoint:[e.touches[0].pageX,e.touches[0].pageY]
      })
    },
    touchM(e){
      console.log(e)
      var curpoint=[e.touches[0].pageX,e.touches[0].pageY]
      var startpoint=this.data.startpoint
      var delta=curpoint[0]-startpoint[0]
      var devicelist=this.data.devicelist
      var i=e.currentTarget.dataset.i
      console.log(delta)
      if(delta<0&&delta>-100){
        devicelist[i].translate=delta
        this.setData({
          devicelist:devicelist
        })
      }else if(delta<-100){
        devicelist[i].translate=-150
        this.setData({
          devicelist:devicelist
        })
      }
    },
    touchE(e){
      console.log(e)
      var curpoint=[e.changedTouches[0].pageX,e.changedTouches[0].pageY]
      var startpoint=this.data.startpoint
      var delta=curpoint[0]-startpoint[0]
      var devicelist=this.data.devicelist
      var i=e.currentTarget.dataset.i
      console.log(delta)
      if(delta>-100){
        devicelist[i].translate=0
        this.setData({
          devicelist:devicelist
        })
      }
    }
})